const express = require('express');
const cors = require('cors'); // Importante para el frontend
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN })); 
app.use(express.json());

// Montar la ruta
const ticketRoutes = require('./routes/ticketRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tickets', ticketRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
