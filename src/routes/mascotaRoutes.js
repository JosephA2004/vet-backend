const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const {
  listarMascotas,
  obtenerMascota,
  crearMascota,
  actualizarMascota,
  eliminarMascota
} = require('../controllers/mascotaController');

router.get('/', verificarToken, listarMascotas);
router.get('/:id', verificarToken, obtenerMascota);
router.post('/', verificarToken, crearMascota);
router.put('/:id', verificarToken, actualizarMascota);
router.delete('/:id', verificarToken, eliminarMascota);

module.exports = router;