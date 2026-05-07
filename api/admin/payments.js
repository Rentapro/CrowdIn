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
    const { action } = req.query;

    if (action === 'logs') {
      const { contract_id } = req.query;
      const rows = await sql`SELECT * FROM payment_logs WHERE contract_id = ${contract_id} ORDER BY executed_at DESC`;
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const { contract_id, amount, payment_number } = req.body;
      
      if (action === 'add') {
        // Neon driver doesn't support BEGIN/COMMIT in simple neon() calls easily, 
        // but we can do it in separate calls or use the transaction method.
        // For simplicity in serverless, we'll do two calls.
        await sql`
          INSERT INTO payment_logs (contract_id, payment_amount, payment_number) 
          VALUES (${contract_id}, ${amount}, ${payment_number})
        `;
        await sql`
          UPDATE contracts SET payments_made = payments_made + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ${contract_id}
        `;
        return res.json({ message: 'Pago registrado exitosamente' });
      }

      if (action === 'liquidate') {
        await sql`UPDATE contracts SET status = 'LIQUIDATED', updated_at = CURRENT_TIMESTAMP WHERE id = ${contract_id}`;
        return res.json({ message: 'Contrato liquidado' });
      }
    }

    res.status(405).json({ error: 'Metodo o accion no permitida' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
