import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function createTestUser() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL no está configurada.');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const email = 'inversor@prueba.com';
    const password = 'test';
    
    // Borrar si existe
    const exist = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (exist.length > 0) {
      await sql`DELETE FROM contracts WHERE user_id = ${exist[0].id}`;
      await sql`DELETE FROM users WHERE id = ${exist[0].id}`;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = await sql`
      INSERT INTO users (email, password_hash, name, role, kyc_status)
      VALUES (${email}, ${hash}, 'Inversor Beta', 'CLIENT', 'VERIFIED')
      RETURNING id
    `;
    const userId = newUser[0].id;

    await sql`
      INSERT INTO contracts (user_id, amount, tier_name, monthly_roi, status, payments_made, bank_account_info)
      VALUES (${userId}, 20000000, 'Premium', 0.022, 'ACTIVE', 3, 'RUT: 11.222.333-4 | BCI CTA 1111')
    `;

    console.log('✅ Usuario de prueba creado exitosamente:');
    console.log(`Correo: ${email}`);
    console.log(`Clave: ${password}`);
  } catch (error) {
    console.error('❌ Error al crear usuario de prueba:', error);
  }
}

createTestUser();
