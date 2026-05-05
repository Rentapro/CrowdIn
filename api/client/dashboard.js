import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'CLIENT') return res.status(403).json({ error: 'Prohibido' });

    const sql = neon(process.env.DATABASE_URL);
    
    // Fetch contract details for this specific user
    const contracts = await sql`
      SELECT 
        id, amount, tier_name, monthly_roi, status, created_at
      FROM contracts
      WHERE user_id = ${decoded.id}
      ORDER BY created_at DESC
    `;

    return res.status(200).json({ contracts });
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
