const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authenticate = require('../middlewares/authMiddleware');

router.use(authenticate); // Todo protegido por JWT

// Rutas de métricas y filtros
router.get('/metricas', ticketController.getMetricas); // [rq-10] Métricas (debe ir antes del /:id)

// CRUD principal
router.get('/', ticketController.getTickets);           // [rq-07] Leer con filtros
router.post('/', ticketController.createTicket);        // [GEN-10] Crear 
router.put('/:id', ticketController.updateTicket);      // [rq-05, rq-06, rq-09] Cambiar estado
router.delete('/:id', ticketController.deleteTicket);   // Eliminar

// Rutas secundarias (Comentarios)
router.post('/:id/comentarios', ticketController.addComentario); // [rq-04] Agregar comentario

module.exports = router;