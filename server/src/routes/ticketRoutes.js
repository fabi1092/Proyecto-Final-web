const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authenticate = require('../middlewares/authMiddleware');

router.use(authenticate); // Todo protegido

// El CRUD completo
router.get('/', ticketController.getTickets);           // Leer
router.post('/', ticketController.createTicket);        // Crear
router.put('/:id', ticketController.updateTicket);      // Actualizar
router.delete('/:id', ticketController.deleteTicket);   // Eliminar

module.exports = router;