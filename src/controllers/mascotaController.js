const pool = require('../config/db');

// Listar todas las mascotas (con nombre de cliente, especie y raza)
const listarMascotas = async (req, res) => {
  try {
    const [mascotas] = await pool.query(`
      SELECT m.*, c.nombre AS cliente_nombre, e.nombre AS especie_nombre, r.nombre AS raza_nombre
      FROM mascotas m
      JOIN clientes c ON m.cliente_id = c.id
      JOIN especies e ON m.especie_id = e.id
      LEFT JOIN razas r ON m.raza_id = r.id
      ORDER BY m.id DESC
    `);
    res.json(mascotas);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar mascotas', detalle: error.message });
  }
};

// Obtener una mascota por ID
const obtenerMascota = async (req, res) => {
  try {
    const { id } = req.params;
    const [mascotas] = await pool.query('SELECT * FROM mascotas WHERE id = ?', [id]);
    if (mascotas.length === 0) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }
    res.json(mascotas[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mascota', detalle: error.message });
  }
};

// Crear una mascota
const crearMascota = async (req, res) => {
  try {
    const { cliente_id, nombre, especie_id, raza_id, fecha_nacimiento, sexo, peso } = req.body;

    if (!cliente_id || !nombre || !especie_id) {
      return res.status(400).json({ error: 'cliente_id, nombre y especie_id son obligatorios' });
    }

    // Verificar que el cliente exista antes de crear la mascota
    const [clientes] = await pool.query('SELECT id FROM clientes WHERE id = ?', [cliente_id]);
    if (clientes.length === 0) {
      return res.status(404).json({ error: 'El cliente indicado no existe' });
    }

    const [resultado] = await pool.query(
      'INSERT INTO mascotas (cliente_id, nombre, especie_id, raza_id, fecha_nacimiento, sexo, peso) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [cliente_id, nombre, especie_id, raza_id || null, fecha_nacimiento || null, sexo || null, peso || null]
    );

    res.status(201).json({ mensaje: 'Mascota creada', id: resultado.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear mascota', detalle: error.message });
  }
};

// Actualizar una mascota
const actualizarMascota = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, especie_id, raza_id, fecha_nacimiento, sexo, peso } = req.body;

    const [resultado] = await pool.query(
      'UPDATE mascotas SET nombre = ?, especie_id = ?, raza_id = ?, fecha_nacimiento = ?, sexo = ?, peso = ? WHERE id = ?',
      [nombre, especie_id, raza_id || null, fecha_nacimiento || null, sexo || null, peso || null, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }
    res.json({ mensaje: 'Mascota actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar mascota', detalle: error.message });
  }
};

// Eliminar una mascota
const eliminarMascota = async (req, res) => {
  try {
    const { id } = req.params;
    const [resultado] = await pool.query('DELETE FROM mascotas WHERE id = ?', [id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }
    res.json({ mensaje: 'Mascota eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar mascota', detalle: error.message });
  }
};

module.exports = { listarMascotas, obtenerMascota, crearMascota, actualizarMascota, eliminarMascota };