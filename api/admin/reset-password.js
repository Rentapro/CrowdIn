import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'SUPERADMIN') return res.status(403).json({ error: 'Prohibido' });

    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'Falta user_id' });

    const sql = neon(process.env.DATABASE_URL);

    // Auto-generate password
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(tempPassword, salt);

    await sql`UPDATE users SET password_hash = ${hash} WHERE id = ${user_id}`;

    return res.status(200).json({ 
      success: true, 
      message: 'Clave regenerada',
      tempPassword 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
