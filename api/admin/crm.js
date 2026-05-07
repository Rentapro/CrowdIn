const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'SUPERADMIN' && decoded.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });

    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM prospectos ORDER BY created_at DESC');
      return res.json(result.rows);
    }

    if (req.method === 'POST') {
      const { name, phone, email, source, notes } = req.body;
      await pool.query(
        'INSERT INTO prospectos (name, phone, email, source, notes) VALUES ($1, $2, $3, $4, $5)',
        [name, phone, email, source, notes]
      );
      return res.json({ message: 'Prospecto creado' });
    }

    if (req.method === 'PATCH') {
      const { id, status } = req.body;
      await pool.query(
        'UPDATE prospectos SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [status, id]
      );
      return res.json({ message: 'Estado actualizado' });
    }

    res.status(405).json({ error: 'Metodo no permitido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
