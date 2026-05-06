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

    const { contract_id } = req.body;
    const sql = neon(process.env.DATABASE_URL);

    // Marcar como LIQUIDATED
    await sql`UPDATE contracts SET status = 'LIQUIDATED' WHERE id = ${contract_id}`;

    return res.status(200).json({ success: true, message: 'Operación Liquidada' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al liquidar contrato' });
  }
}
