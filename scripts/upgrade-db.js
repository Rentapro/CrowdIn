import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function upgrade() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL no está configurada.');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('Actualizando esquema de la base de datos...');

    // 1. Añadir columnas a users (KYC)
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'PENDING'`;
    
    // 2. Añadir columnas a contracts (Pagos y Banco)
    await sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payments_made INTEGER DEFAULT 0`;
    await sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS bank_account_info TEXT`;

    console.log('✅ Esquema actualizado con éxito.');
  } catch (error) {
    console.error('❌ Error al actualizar la base de datos:', error);
  }
}

upgrade();
