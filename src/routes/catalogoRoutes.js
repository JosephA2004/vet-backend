const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const { listarEspecies, listarRazas, listarVeterinarios } = require('../controllers/catalogoController');

router.get('/especies', verificarToken, listarEspecies);
router.get('/razas', verificarToken, listarRazas);
router.get('/veterinarios', verificarToken, listarVeterinarios);

module.exports = router;