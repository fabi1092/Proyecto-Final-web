const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Rutas Públicas
router.post('/register', register);
router.post('/login', login);
router.put('/reset', authController.resetPassword);
router.post('/solicitar-codigo', authController.solicitarCodigo);


module.exports = router;