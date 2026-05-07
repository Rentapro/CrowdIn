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
          { name: 'Andrónico Luksic Craig', phone: '+56911112222', source: 'Family Office', notes: 'Presidente Quiñenco - Inversor Estratégico' },
          { name: 'Matías Muchnick', phone: '+56933334444', source: 'Tech/VC', notes: 'Founder NotCo - Inversor Angel' },
          { name: 'Horst Paulmann', phone: '+56955556666', source: 'Retail/HNWI', notes: 'Fundador Cencosud - Perfil Patrimonial' },
          { name: 'Ignacio Cueto', phone: '+56977778888', source: 'Corporate/Finance', notes: 'Presidente LATAM - Inversor Diversificado' },
          { name: 'Bernardo Larraín Matte', phone: '+56999990000', source: 'Energy/Family Office', notes: 'Presidente Colbún - Inversor Institucional' }
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
