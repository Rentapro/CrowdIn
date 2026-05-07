import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

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
      const rows = await sql`SELECT * FROM prospects ORDER BY created_at DESC`;
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const { name, phone, email, source, notes } = req.body;
      await sql`
        INSERT INTO prospects (name, phone, email, source, notes) 
        VALUES (${name}, ${phone}, ${email}, ${source}, ${notes})
      `;
      return res.json({ message: 'Prospecto creado' });
    }

    if (req.method === 'PATCH') {
      const { id, status } = req.body;
      await sql`UPDATE prospects SET status = ${status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
      return res.json({ message: 'Estado actualizado' });
    }

    res.status(405).json({ error: 'Metodo no permitido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
