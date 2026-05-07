const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

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
    if (decoded.role !== 'SUPERADMIN' && decoded.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });

    const { action } = req.query;

    if (action === 'logs') {
      const { contract_id } = req.query;
      const result = await pool.query('SELECT * FROM pagos_historial WHERE contract_id = $1 ORDER BY executed_at DESC', [contract_id]);
      return res.json(result.rows);
    }

    if (req.method === 'POST') {
      const { contract_id, amount, payment_number } = req.body;
      
      if (action === 'add') {
        await pool.query('BEGIN');
        await pool.query(
          'INSERT INTO pagos_historial (contract_id, payment_amount, payment_number) VALUES ($1, $2, $3)',
          [contract_id, amount, payment_number]
        );
        await pool.query(
          'UPDATE contratos SET payments_made = payments_made + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [contract_id]
        );
        await pool.query('COMMIT');
        return res.json({ message: 'Pago registrado exitosamente' });
      }

      if (action === 'liquidate') {
        await pool.query('UPDATE contratos SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['LIQUIDATED', contract_id]);
        return res.json({ message: 'Contrato liquidado' });
      }
    }

    res.status(405).json({ error: 'Metodo o accion no permitida' });
  } catch (err) {
    if (pool) await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
};
