import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'SUPERADMIN' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const sql = neon(process.env.DATABASE_URL);

    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM prospects ORDER BY created_at DESC`;
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const { action, name, phone, email, source, notes } = req.body;
      
      if (action === 'capture') {
        // Simulacion de captura VIP (Inyeccion de perfiles reales)
        const vips = [
          { name: 'Capital Advisors (MFO)', phone: '+56224905000', source: 'Family Office', notes: 'Av. El Golf 40, Las Condes. Principal MFO de Chile.' },
          { name: 'MFO Advisors', phone: '+56229152500', source: 'Family Office', notes: 'Apoquindo 3001, Las Condes. Gestión de altos patrimonios.' },
          { name: 'XIM (Wealth Management)', phone: '+56227125500', source: 'Family Office', notes: 'Av. Nueva Costanera 4040, Vitacura. Especialistas en inversión real.' },
          { name: 'Compass Group Chile', phone: '+56225923000', source: 'Asset Management', notes: 'Rosario Norte 615, Las Condes. Inversores institucionales.' },
          { name: 'Altamar Advisory Chile', phone: '+56229505000', source: 'Private Equity', notes: 'Nueva Costanera 3300, Vitacura. Fondo de inversión premium.' }
        ];
        
        for (const vip of vips) {
          await sql`
            INSERT INTO prospects (name, phone, source, notes) 
            VALUES (${vip.name}, ${vip.phone}, ${vip.source}, ${vip.notes})
            ON CONFLICT DO NOTHING
          `;
        }
        return res.json({ message: 'Captura completada' });
      }

      await sql`
        INSERT INTO prospects (name, phone, email, source, notes) 
        VALUES (${name}, ${phone}, ${email}, ${source}, ${notes})
      `;
      return res.json({ message: 'Prospecto creado' });
    }

    if (req.method === 'PATCH') {
      const { id, status } = req.body;
      await sql`UPDATE prospects SET status = ${status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
      return res.json({ message: 'Estado actualizado' });
    }

    res.status(405).json({ error: 'Metodo no permitido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
