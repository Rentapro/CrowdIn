const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo no permitido' });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });

    const { name, phone, email, source, notes } = req.body;

    await pool.query(
      'INSERT INTO prospectos (name, phone, email, source, notes) VALUES ($1, $2, $3, $4, $5)',
      [name, phone, email, source, notes]
    );

    res.json({ message: 'Prospecto creado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
