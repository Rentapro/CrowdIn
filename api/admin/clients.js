const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });

    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT u.id as user_id, u.name, u.email, u.kyc_status, c.id as contract_id, c.amount, c.monthly_roi, c.tier_name, c.payments_made, c.status, c.bank_account_info
        FROM users u
        LEFT JOIN contratos c ON u.id = c.user_id
        WHERE u.role ILIKE 'CLIENT'
        ORDER BY u.created_at DESC
      `);
      return res.json(result.rows);
    }

    if (req.method === 'POST') {
      const { name, email, amount, bankAccount } = req.body;
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      await pool.query('BEGIN');
      const userRes = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, email, hashedPassword, 'CLIENT']
      );
      const userId = userRes.rows[0].id;

      const tiers = [
        { value: 100000000, roi: 0.025, name: 'Institucional' },
        { value: 40000000, roi: 0.025, name: 'Elite' },
        { value: 20000000, roi: 0.022, name: 'Premium' },
        { value: 10000000, roi: 0.020, name: 'Avanzado' },
        { value: 5000000, roi: 0.017, name: 'Crecimiento' },
        { value: 1000000, roi: 0.015, name: 'Inicio' }
      ];
      const tier = tiers.find(t => amount >= t.value) || tiers[tiers.length - 1];

      await pool.query(
        'INSERT INTO contratos (user_id, amount, monthly_roi, tier_name, bank_account_info) VALUES ($1, $2, $3, $4, $5)',
        [userId, amount, tier.roi, tier.name, bankAccount]
      );
      await pool.query('COMMIT');
      return res.json({ message: 'Inversor creado', tempPassword });
    }

    if (req.method === 'PATCH') {
      const { action, userId, kycStatus } = req.body;
      if (action === 'kyc') {
        const newStatus = kycStatus === 'VERIFIED' ? 'PENDING' : 'VERIFIED';
        await pool.query('UPDATE users SET kyc_status = $1 WHERE id = $2', [newStatus, userId]);
        return res.json({ message: 'Estado KYC actualizado' });
      }
      if (action === 'reset-password') {
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
        return res.json({ message: 'Password reseteada', tempPassword });
      }
    }

    if (req.method === 'DELETE') {
      const { user_id } = req.body;
      await pool.query('DELETE FROM users WHERE id = $1', [user_id]);
      return res.json({ message: 'Usuario eliminado' });
    }

    res.status(405).json({ error: 'Metodo no permitido' });
  } catch (err) {
    if (pool) await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
};
