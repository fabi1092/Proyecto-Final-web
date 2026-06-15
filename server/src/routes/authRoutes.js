const express = require('express');
const router = express.Router();

// 1. IMPORTAMOS TODAS LAS FUNCIONES SUELTAS (Agregamos las dos nuevas)
const { register, login, resetPassword, solicitarCodigo } = require('../controllers/authController');

// Rutas Públicas
router.post('/register', register);
router.post('/login', login);

// 2. LAS USAMOS DIRECTAMENTE (Igual que el login y register)
router.put('/reset', resetPassword);
router.post('/solicitar-codigo', solicitarCodigo);

module.exports = router;