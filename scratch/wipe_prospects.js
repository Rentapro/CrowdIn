import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function wipe() {
  try {
    console.log("[*] Eliminando todos los prospectos de la tabla...");
    await sql`DELETE FROM prospects`;
    console.log("[+] Tabla de prospectos limpiada. 0 registros ahora.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

wipe();
