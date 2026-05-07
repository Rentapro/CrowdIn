import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'prospectos'
    `;
    console.log("Columnas de prospectos:", columns);
    
    const constraints = await sql`
      SELECT conname, contype 
      FROM pg_constraint 
      WHERE conrelid = 'prospectos'::regclass
    `;
    console.log("Constraints de prospectos:", constraints);
  } catch (err) {
    console.error(err);
  }
}

check();
