const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const {
  listarCitas,
  obtenerCita,
  crearCita,
  actualizarCita,
  eliminarCita
} = require('../controllers/citaController');

router.get('/', verificarToken, listarCitas);
router.get('/:id', verificarToken, obtenerCita);
router.post('/', verificarToken, crearCita);
router.put('/:id', verificarToken, actualizarCita);
router.delete('/:id', verificarToken, eliminarCita);

module.exports = router;