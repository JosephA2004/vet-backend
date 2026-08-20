const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} = require('../controllers/clienteController');

router.get('/', verificarToken, listarClientes);
router.get('/:id', verificarToken, obtenerCliente);
router.post('/', verificarToken, crearCliente);
router.put('/:id', verificarToken, actualizarCliente);
router.delete('/:id', verificarToken, eliminarCliente);

module.exports = router;