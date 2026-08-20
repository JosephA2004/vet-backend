const pool = require('../config/db');

// Listar todas las citas (con nombre de mascota y veterinario)
const listarCitas = async (req, res) => {
  try {
    const [citas] = await pool.query(`
      SELECT ci.*, m.nombre AS mascota_nombre, u.nombre AS veterinario_nombre
      FROM citas ci
      JOIN mascotas m ON ci.mascota_id = m.id
      JOIN veterinarios v ON ci.veterinario_id = v.id
      JOIN usuarios u ON v.usuario_id = u.id
      ORDER BY ci.fecha DESC, ci.hora DESC
    `);
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar citas', detalle: error.message });
  }
};

// Obtener una cita por ID
const obtenerCita = async (req, res) => {
  try {
    const { id } = req.params;
    const [citas] = await pool.query('SELECT * FROM citas WHERE id = ?', [id]);
    if (citas.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    res.json(citas[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cita', detalle: error.message });
  }
};

// Crear una cita
const crearCita = async (req, res) => {
  try {
    const { mascota_id, veterinario_id, fecha, hora, motivo, estado } = req.body;

    if (!mascota_id || !veterinario_id || !fecha || !hora) {
      return res.status(400).json({ error: 'mascota_id, veterinario_id, fecha y hora son obligatorios' });
    }

    const [mascotas] = await pool.query('SELECT id FROM mascotas WHERE id = ?', [mascota_id]);
    if (mascotas.length === 0) {
      return res.status(404).json({ error: 'La mascota indicada no existe' });
    }

    const [veterinarios] = await pool.query('SELECT id FROM veterinarios WHERE id = ?', [veterinario_id]);
    if (veterinarios.length === 0) {
      return res.status(404).json({ error: 'El veterinario indicado no existe' });
    }

    const [resultado] = await pool.query(
      'INSERT INTO citas (mascota_id, veterinario_id, fecha, hora, motivo, estado) VALUES (?, ?, ?, ?, ?, ?)',
      [mascota_id, veterinario_id, fecha, hora, motivo || null, estado || 'pendiente']
    );

    res.status(201).json({ mensaje: 'Cita creada', id: resultado.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cita', detalle: error.message });
  }
};

// Actualizar una cita
const actualizarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { mascota_id, veterinario_id, fecha, hora, motivo, estado } = req.body;

    const [resultado] = await pool.query(
      'UPDATE citas SET mascota_id = ?, veterinario_id = ?, fecha = ?, hora = ?, motivo = ?, estado = ? WHERE id = ?',
      [mascota_id, veterinario_id, fecha, hora, motivo, estado, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    res.json({ mensaje: 'Cita actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cita', detalle: error.message });
  }
};

// Eliminar una cita
const eliminarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const [resultado] = await pool.query('DELETE FROM citas WHERE id = ?', [id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    res.json({ mensaje: 'Cita eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cita', detalle: error.message });
  }
};

module.exports = { listarCitas, obtenerCita, crearCita, actualizarCita, eliminarCita };