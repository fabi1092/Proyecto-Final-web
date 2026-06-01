const express = require('express');
const app = express();

// Middleware básico
app.use(express.json());

// Ruta de prueba
app.get('/api/v1', (req, res) => {
  res.json({ message: '¡El servidor del sistema de tickets está funcionando!' });
});

// Levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});