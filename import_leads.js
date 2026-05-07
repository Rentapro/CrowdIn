import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function importFile(filePath, type) {
  if (!fs.existsSync(filePath)) {
    console.log(`[!] Saltando ${filePath} (no existe).`);
    return;
  }

  const leads = [];
  console.log(`[*] Procesando ${filePath}...`);

  return new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => leads.push(data))
      .on('end', async () => {
        let imported = 0;
        for (const lead of leads) {
          try {
            const name = lead.name || 'N/A';
            const phone = lead.phone || '';
            const source = type === 'maps' ? 'Google Maps' : 'Google Sniper';
            const notes = type === 'maps' 
              ? `Tipo: ${lead.type} | Locacion: ${lead.location}` 
              : `${lead.position} | ${lead.notes}`;

            await sql`
              INSERT INTO prospects (name, phone, source, notes, status)
              VALUES (${name}, ${phone}, ${source}, ${notes}, 'Prospecto')
            `;
            imported++;
          } catch (err) {
            // Error silencioso para duplicados
          }
        }
        console.log(`[+] Importados ${imported} registros desde ${filePath}.`);
        resolve();
      });
  });
}

async function start() {
  await importFile('./marketing/leads_sniper.csv', 'sniper');
  await importFile('./marketing/leads_maps.csv', 'maps');
  console.log("[!] Proceso finalizado.");
  process.exit(0);
}

start();
