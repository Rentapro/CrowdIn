import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
  try {
    const users = await sql`SELECT id, name, email, role FROM users`;
    console.log("Usuarios en DB:", users);
  } catch (err) {
    console.error(err);
  }
}

check();
