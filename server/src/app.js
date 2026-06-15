const express = require('express');
const cors = require('cors'); // Importante para el frontend
const authRoutes = require('./routes/authRoutes');
const { sequelize } = require('./models');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN })); 
app.use(express.json());

// Montar la ruta
const ticketRoutes = require('./routes/ticketRoutes');
const resetRoutes = require('./routes/resetRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/reset', resetRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// [GEN-08] Manejo de rutas inexistentes (404)
app.use((req, res, next) => {
  res.status(404).json({ error: true, message: 'Ruta no encontrada' });
});

// [GEN-08] Manejo centralizado de errores globales (500)
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err.stack);
  res.status(500).json({ error: true, message: 'Error interno del servidor' });
});

// 🪄 2. EL MARTILLO MÁGICO DE SEQUELIZE (ponlo justo antes del module.exports)
sequelize.sync({ alter: true })
  .then(() => console.log('🪄 ¡Base de datos sincronizada mágicamente! Tablas listas.'))
  .catch((err) => console.error('Error forzando la BD:', err));

module.exports = app;
