import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method Not Allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'SUPERADMIN') return res.status(403).json({ error: 'Prohibido' });

    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'User ID requerido' });

    const sql = neon(process.env.DATABASE_URL);
    
    // Primero borramos sus contratos
    await sql`DELETE FROM contracts WHERE user_id = ${user_id}`;
    // Luego borramos el usuario
    await sql`DELETE FROM users WHERE id = ${user_id}`;

    return res.status(200).json({ success: true, message: 'Inversor eliminado' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al eliminar inversor' });
  }
}
