import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'SUPERADMIN') return res.status(403).json({ error: 'Prohibido' });

    const { user_id, current_status } = req.body;
    const newStatus = current_status === 'VERIFIED' ? 'PENDING' : 'VERIFIED';

    const sql = neon(process.env.DATABASE_URL);
    await sql`UPDATE users SET kyc_status = ${newStatus} WHERE id = ${user_id}`;

    return res.status(200).json({ success: true, kyc_status: newStatus });
  } catch (error) {
    return res.status(401).json({ error: 'Error al cambiar KYC' });
  }
}
