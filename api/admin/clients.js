import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'SUPERADMIN' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const sql = neon(process.env.DATABASE_URL);

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT u.id as user_id, u.name, u.email, u.kyc_status, c.id as contract_id, c.amount, c.monthly_roi, c.tier_name, c.payments_made, c.status, c.bank_account_info
        FROM users u
        LEFT JOIN contracts c ON u.id = c.user_id
        WHERE u.role ILIKE 'CLIENT'
        ORDER BY u.created_at DESC
      `;
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const { name, email, amount, bankAccount } = req.body;
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const [user] = await sql`
        INSERT INTO users (name, email, password_hash, role) 
        VALUES (${name}, ${email}, ${hashedPassword}, 'CLIENT') 
        RETURNING id
      `;

      const tiers = [
        { value: 100000000, roi: 0.025, name: 'Institucional' },
        { value: 40000000, roi: 0.025, name: 'Elite' },
        { value: 20000000, roi: 0.022, name: 'Premium' },
        { value: 10000000, roi: 0.020, name: 'Avanzado' },
        { value: 5000000, roi: 0.017, name: 'Crecimiento' },
        { value: 1000000, roi: 0.015, name: 'Inicio' }
      ];
      const tier = tiers.find(t => amount >= t.value) || tiers[tiers.length - 1];

      await sql`
        INSERT INTO contracts (user_id, amount, monthly_roi, tier_name, bank_account_info) 
        VALUES (${user.id}, ${amount}, ${tier.roi}, ${tier.name}, ${bankAccount})
      `;
      
      return res.json({ message: 'Inversor creado', tempPassword });
    }

    if (req.method === 'PATCH') {
      const { action, userId, kycStatus } = req.body;
      if (action === 'kyc') {
        const newStatus = kycStatus === 'VERIFIED' ? 'PENDING' : 'VERIFIED';
        await sql`UPDATE users SET kyc_status = ${newStatus} WHERE id = ${userId}`;
        return res.json({ message: 'Estado KYC actualizado' });
      }
      if (action === 'reset-password') {
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        await sql`UPDATE users SET password_hash = ${hashedPassword} WHERE id = ${userId}`;
        return res.json({ message: 'Password reseteada', tempPassword });
      }
    }

    if (req.method === 'DELETE') {
      const { user_id } = req.body;
      await sql`DELETE FROM users WHERE id = ${user_id}`;
      return res.json({ message: 'Usuario eliminado' });
    }

    res.status(405).json({ error: 'Metodo no permitido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
