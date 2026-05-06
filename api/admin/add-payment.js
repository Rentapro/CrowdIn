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
    
    // Get current payments
    const contract = await sql`SELECT payments_made FROM contracts WHERE id = ${contract_id}`;
    if (contract.length === 0) return res.status(404).json({ error: 'Contrato no encontrado' });
    
    let current = contract[0].payments_made || 0;
    if (current >= 12) return res.status(400).json({ error: 'Ya se pagaron las 12 cuotas' });

    await sql`UPDATE contracts SET payments_made = ${current + 1} WHERE id = ${contract_id}`;

    return res.status(200).json({ success: true, payments_made: current + 1 });
  } catch (error) {
    return res.status(401).json({ error: 'Error al registrar pago' });
  }
}
