const express = require('express');
const router = express.Router();

const { register, login, resetPassword, solicitarCodigo } = require('../controllers/authController');

// Rutas Públicas
router.post('/register', register);
router.post('/login', login);
router.put('/reset', resetPassword);
router.post('/solicitar-codigo', solicitarCodigo);

// ESTA LÍNEA ES LA QUE FALTABA Y CAUSABA EL ERROR
module.exports = router;