import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkStructure() {
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `;
    console.log("Columnas de users:", columns);
    
    const count = await sql`SELECT COUNT(*) FROM users WHERE role ILIKE 'client'`;
    console.log("Conteo de clientes:", count);
  } catch (err) {
    console.error(err);
  }
}

checkStructure();
