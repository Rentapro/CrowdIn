const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function audit() {
  try {
    console.log("--- AUDITORIA DE BASE DE DATOS ---");
    const users = await pool.query("SELECT id, name, email, role FROM users");
    console.log("Usuarios en total:", users.rowCount);
    console.log(users.rows);
    
    const contratos = await pool.query("SELECT * FROM contratos");
    console.log("Contratos en total:", contratos.rowCount);
    console.log(contratos.rows);

    const prospectos = await pool.query("SELECT * FROM prospectos");
    console.log("Prospectos en total:", prospectos.rowCount);

    await pool.end();
  } catch (err) {
    console.error(err);
  }
}

audit();
