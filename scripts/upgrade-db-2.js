import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function upgrade() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL no está configurada.');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('Actualizando esquema de la base de datos (Fase 4)...');

    // Crear tabla payment_logs
    await sql`
      CREATE TABLE IF NOT EXISTS payment_logs (
        id SERIAL PRIMARY KEY,
        contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
        payment_number INTEGER NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        executed_by VARCHAR(50) DEFAULT 'SUPERADMIN'
      )
    `;

    console.log('✅ Esquema actualizado con éxito. Tabla payment_logs creada.');
  } catch (error) {
    console.error('❌ Error al actualizar la base de datos:', error);
  }
}

upgrade();
