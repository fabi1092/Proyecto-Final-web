const { Ticket } = require('../models');

// rq-08: Listar Tickets (Bandeja)
const getTickets = async (req, res) => {
  try {
    // Traemos los tickets del usuario logueado
    const tickets = await Ticket.findAll({ 
      where: { usuarioId: req.usuario.id },
      order: [['createdAt', 'DESC']]
    });
    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Error al obtener tickets' });
  }
};

// rq-03: Crear Ticket
const createTicket = async (req, res) => {
  try {
    const { titulo, descripcion } = req.body;
    const nuevoTicket = await Ticket.create({
      titulo,
      descripcion,
      usuarioId: req.usuario.id // Lo sacamos del token!
    });
    return res.status(201).json(nuevoTicket);
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Error al crear ticket' });
  }
};

module.exports = { getTickets, createTicket };