const pool = require('../config/db');

const listarEspecies = async (req, res) => {
  try {
    const [especies] = await pool.query('SELECT * FROM especies ORDER BY nombre');
    res.json(especies);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar especies', detalle: error.message });
  }
};

const listarRazas = async (req, res) => {
  try {
    const { especie_id } = req.query;
    let query = 'SELECT * FROM razas';
    let params = [];
    if (especie_id) {
      query += ' WHERE especie_id = ?';
      params.push(especie_id);
    }
    query += ' ORDER BY nombre';
    const [razas] = await pool.query(query, params);
    res.json(razas);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar razas', detalle: error.message });
  }
};

const listarVeterinarios = async (req, res) => {
  try {
    const [veterinarios] = await pool.query(`
      SELECT v.id, u.nombre, v.especialidad
      FROM veterinarios v
      JOIN usuarios u ON v.usuario_id = u.id
      ORDER BY u.nombre
    `);
    res.json(veterinarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar veterinarios', detalle: error.message });
  }
};

module.exports = { listarEspecies, listarRazas, listarVeterinarios };