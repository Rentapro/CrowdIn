import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDB() {
  try {
    const res = await pool.query("SELECT role, COUNT(*) FROM users GROUP BY role");
    console.log("Usuarios por rol:", res.rows);
    
    const clients = await pool.query("SELECT id, name, role FROM users WHERE role ILIKE 'client'");
    console.log("Clientes encontrados:", clients.rows);
    
    await pool.end();
  } catch (err) {
    console.error(err);
  }
}

checkDB();
