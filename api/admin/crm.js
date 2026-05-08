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
          { name: 'Dr. Francisco Larraín', phone: '+56911223344', source: 'Vitacura/RM', notes: 'Especialista Clínica Alemana. Inversor en activos reales.' },
          { name: 'Carolina Schmidt', phone: '+56944556677', source: 'Zapallar/V', notes: 'Empresaria sector turismo lujo. Interés en copropiedad.' },
          { name: 'Ignacio Walker', phone: '+56977889900', source: 'Machalí/VI', notes: 'Gerente Operaciones Minería. Alta liquidez mensual.' },
          { name: 'Mariana Elsztain', phone: '+56922334455', source: 'San Pedro/VIII', notes: 'Dueña de constructora industrial (Biobío). Buscando diversificación.' },
          { name: 'Gustavo Fischer', phone: '+56966778899', source: 'Puerto Varas/X', notes: 'Exportador sector Salmonero. Inversor patrimonial de largo plazo.' },
          { name: 'Andrés Londoño', phone: '+56933445566', source: 'Antofagasta/II', notes: 'Consultor estratégico minero. Interesado en renta inmobiliaria.' }
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
