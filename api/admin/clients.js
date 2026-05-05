import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'SUPERADMIN') return res.status(403).json({ error: 'Prohibido' });

    const sql = neon(process.env.DATABASE_URL);
    
    const clients = await sql`
      SELECT 
        u.id as user_id, u.name, u.email, u.created_at,
        c.id as contract_id, c.amount, c.tier_name, c.monthly_roi, c.status
      FROM users u
      LEFT JOIN contracts c ON u.id = c.user_id
      WHERE u.role = 'CLIENT'
      ORDER BY u.created_at DESC
    `;

    return res.status(200).json(clients);
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
