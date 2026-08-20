const express = require('express');
const cors = require('cors');
require('dotenv').config({ quiet: true });
const pool = require('./config/db');

const authRoutes = require('./routes/authRoutes');

const verificarToken = require('./middleware/authMiddleware');

const clienteRoutes = require('./routes/clienteRoutes');

const mascotaRoutes = require('./routes/mascotaRoutes');

const citaRoutes = require('./routes/citaRoutes');

const catalogoRoutes = require('./routes/catalogoRoutes');

const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM mascotas');
    res.json({ conexion: 'exitosa', mascotas_registradas: rows[0].total });
  } catch (error) {
    res.status(500).json({ error: 'Error de conexión a la base de datos', detalle: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/mascotas', mascotaRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api', catalogoRoutes);

app.get('/api/perfil', verificarToken, (req, res) => {
  res.json({ mensaje: 'Acceso autorizado', usuario: req.usuario });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});