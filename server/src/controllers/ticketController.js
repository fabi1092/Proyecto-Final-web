const { Ticket } = require('../models');

// [R] Leer todos los tickets (Panel)
const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({ 
      where: { usuarioId: req.usuario.id },
      order: [['createdAt', 'DESC']]
    });
    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Error al obtener tickets' });
  }
};

// [C] Crear Ticket
const createTicket = async (req, res) => {
  try {
    const { titulo, descripcion } = req.body;
    const nuevoTicket = await Ticket.create({
      titulo,
      descripcion,
      usuarioId: req.usuario.id 
    });
    return res.status(201).json(nuevoTicket);
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Error al crear ticket' });
  }
};

// [U] Actualizar Ticket (Cambiar estado a Cerrado)
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    // Buscamos que el ticket exista y sea del usuario actual
    const ticket = await Ticket.findOne({ where: { id, usuarioId: req.usuario.id } });
    
    if (!ticket) {
      return res.status(404).json({ error: true, message: 'Ticket no encontrado' });
    }

    // Actualizamos el estado
    ticket.estado = 'Cerrado';
    await ticket.save();

    return res.json({ error: false, message: 'Ticket cerrado exitosamente', ticket });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Error al actualizar ticket' });
  }
};

// [D] Eliminar Ticket
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOne({ where: { id, usuarioId: req.usuario.id } });
    
    if (!ticket) {
      return res.status(404).json({ error: true, message: 'Ticket no encontrado' });
    }

    await ticket.destroy();
    return res.json({ error: false, message: 'Ticket eliminado' });
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Error al eliminar ticket' });
  }
};

// Exportamos las 4 funciones del CRUD
module.exports = { getTickets, createTicket, updateTicket, deleteTicket };