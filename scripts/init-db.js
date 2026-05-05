import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

async function init() {
  if (!process.env.DATABASE_URL) {
    console.error("CRITICAL ERROR: DATABASE_URL not found in .env");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log("Iniciando creación de tablas en Neon Postgres...");

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'CLIENT',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("[OK] Tabla 'users' operativa.");

    await sql`
      CREATE TABLE IF NOT EXISTS contracts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC NOT NULL,
        tier_name VARCHAR(100) NOT NULL,
        monthly_roi NUMERIC NOT NULL,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("[OK] Tabla 'contracts' operativa.");

    // Check if SUPERADMIN exists, if not, create one automatically
    const adminExists = await sql`SELECT id FROM users WHERE role = 'SUPERADMIN' LIMIT 1`;
    
    if (adminExists.length === 0) {
      console.log("No se detectó un Superadmin. Creando el usuario Jefe por defecto...");
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("comandante2026", salt);
      
      await sql`
        INSERT INTO users (email, password_hash, name, role)
        VALUES ('jefe@crowdin.cl', ${hash}, 'Comandante', 'SUPERADMIN')
      `;
      console.log("[OK] Usuario Superadmin creado.");
      console.log("   -> Credenciales Iniciales: jefe@crowdin.cl / comandante2026");
    } else {
      console.log("[INFO] Usuario Superadmin ya existe en el sistema.");
    }

    console.log("=========================================");
    console.log("Misión Cumplida: Base de Datos Inicializada.");
    console.log("=========================================");
    process.exit(0);

  } catch (error) {
    console.error("Error crítico inicializando la base de datos:", error);
    process.exit(1);
  }
}

init();
