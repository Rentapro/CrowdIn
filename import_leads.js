import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function importLeads() {
  const leads = [];
  const filePath = './marketing/leads_sniper.csv';

  if (!fs.existsSync(filePath)) {
    console.error("[!] No se encontro el archivo leads_sniper.csv. Corra el sniper primero.");
    return;
  }

  console.log("[*] Importando prospectos a la DB...");

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => leads.push(data))
    .on('end', async () => {
      for (const lead of leads) {
        try {
          await sql`
            INSERT INTO prospectos (name, notes, source, status)
            VALUES (${lead.name}, ${lead.position + ' | ' + lead.notes}, ${lead.source}, 'Prospecto')
          `;
        } catch (err) {
          // Ignorar duplicados o errores menores
        }
      }
      console.log(`[+] Importacion completada: ${leads.length} registros.`);
      process.exit(0);
    });
}

importLeads();
