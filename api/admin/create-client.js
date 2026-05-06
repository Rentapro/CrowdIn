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

    const { name, email, amount, tier_name, monthly_roi, bank_account, rut } = req.body;

    if (!name || !email || !amount || !tier_name || !monthly_roi || !bank_account) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Check if email exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) return res.status(400).json({ error: 'El correo ya está registrado' });

    // Auto-generate password
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(tempPassword, salt);

    // Insert user (default PENDING KYC)
    // We add the RUT to the name temporarily or just keep it in DB if we added a column. 
    // Wait, let's append RUT to name or bank_account_info to keep schema simple.
    const fullBankInfo = `RUT: ${rut || 'No provisto'} | ${bank_account}`;

    const newUser = await sql`
      INSERT INTO users (email, password_hash, name, role, kyc_status)
      VALUES (${email}, ${hash}, ${name}, 'CLIENT', 'PENDING')
      RETURNING id
    `;
    const userId = newUser[0].id;

    // Insert contract
    await sql`
      INSERT INTO contracts (user_id, amount, tier_name, monthly_roi, status, payments_made, bank_account_info)
      VALUES (${userId}, ${amount}, ${tier_name}, ${monthly_roi}, 'ACTIVE', 0, ${fullBankInfo})
    `;

    return res.status(200).json({ 
      success: true, 
      message: 'Cliente creado con éxito',
      credentials: { email, tempPassword }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
