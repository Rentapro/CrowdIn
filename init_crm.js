const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initCRM() {
  try {
    console.log("[*] Inicializando Tablas de CRM...");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prospectos (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        source VARCHAR(50), -- LinkedIn, Maps, Manual
        status VARCHAR(50) DEFAULT 'Prospecto', -- Prospecto, Contactado, Seguimiento, Invertido, Rechazado
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("[+] Tabla 'prospectos' creada exitosamente.");
    await pool.end();
  } catch (err) {
    console.error("[!] Error:", err);
    process.exit(1);
  }
}

initCRM();
