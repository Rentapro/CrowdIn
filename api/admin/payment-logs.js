import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'SUPERADMIN' && decoded.role !== 'CLIENT') {
        return res.status(403).json({ error: 'Prohibido' });
    }

    const { contract_id } = req.query;
    if (!contract_id) return res.status(400).json({ error: 'Falta contract_id' });

    const sql = neon(process.env.DATABASE_URL);

    // Si es cliente, verificar pertenencia
    if (decoded.role === 'CLIENT') {
       const ownership = await sql`SELECT user_id FROM contracts WHERE id = ${contract_id}`;
       if (ownership.length === 0 || ownership[0].user_id !== decoded.userId) {
           return res.status(403).json({ error: 'No tienes acceso a este contrato' });
       }
    }

    const logs = await sql`
      SELECT p.id, p.payment_number, p.executed_at, p.executed_by, 
             c.amount, c.monthly_roi
      FROM payment_logs p
      JOIN contracts c ON p.contract_id = c.id
      WHERE p.contract_id = ${contract_id}
      ORDER BY p.executed_at DESC
    `;

    const formattedLogs = logs.map(log => ({
       id: log.id,
       payment_number: log.payment_number,
       executed_at: log.executed_at,
       executed_by: log.executed_by,
       payment_amount: Number(log.amount) * Number(log.monthly_roi)
    }));

    return res.status(200).json(formattedLogs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
