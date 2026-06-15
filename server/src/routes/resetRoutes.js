const express = require('express');
const router = express.Router();
const resetController = require('../controllers/resetController');

// Estas rutas NO usan token JWT porque el usuario no puede iniciar sesión
router.post('/solicitar', resetController.solicitarReset);
router.post('/confirmar', resetController.confirmarReset);

module.exports = router;