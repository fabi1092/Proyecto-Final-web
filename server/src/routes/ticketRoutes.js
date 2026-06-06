const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authenticate = require('../middlewares/authMiddleware');


router.use(authenticate); 

router.get('/', ticketController.getTickets); 
router.post('/', ticketController.createTicket); 

module.exports = router;