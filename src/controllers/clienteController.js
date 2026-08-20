const pool = require('../config/db');

// Listar todos los clientes
const listarClientes = async (req, res) => {
  try {
    const [clientes] = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar clientes', detalle: error.message });
  }
};

// Obtener un cliente por ID
const obtenerCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const [clientes] = await pool.query('SELECT * FROM clientes WHERE id = ?', [id]);
    if (clientes.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(clientes[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cliente', detalle: error.message });
  }
};

// Crear un cliente
const crearCliente = async (req, res) => {
  try {
    const { nombre, telefono, email, direccion } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const [resultado] = await pool.query(
      'INSERT INTO clientes (nombre, telefono, email, direccion) VALUES (?, ?, ?, ?)',
      [nombre, telefono, email, direccion]
    );
    res.status(201).json({ mensaje: 'Cliente creado', id: resultado.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cliente', detalle: error.message });
  }
};

// Actualizar un cliente
const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, email, direccion } = req.body;
    const [resultado] = await pool.query(
      'UPDATE clientes SET nombre = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?',
      [nombre, telefono, email, direccion, id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ mensaje: 'Cliente actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cliente', detalle: error.message });
  }
};

// Eliminar un cliente
const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const [resultado] = await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ mensaje: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cliente', detalle: error.message });
  }
};

module.exports = { listarClientes, obtenerCliente, crearCliente, actualizarCliente, eliminarCliente };