const { Ticket, Comentario, Usuario } = require('../models');
const { Op } = require('sequelize');

// [rq-07] Leer Tickets con Filtros y [rq-04] Traer Comentarios
const getTickets = async (req, res, next) => {
  try {
    const { estado, prioridad } = req.query;
    const whereClause = {};

    // ¡La magia! El servidor comprueba directamente el correo del usuario del Token.
    // Esto es mucho más seguro y no falla.
    if (req.usuario.email !== 'admin@admin.com') { // Asegúrate que este sea TU correo de admin
      whereClause.usuarioId = req.usuario.id;
    }
    
    if (estado) whereClause.estado = estado;
    if (prioridad) whereClause.prioridad = prioridad;

    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [{
        model: Comentario,
        as: 'comentarios',
        include: [{ model: Usuario, as: 'autor', attributes: ['nombre'] }]
      }],
      order: [['createdAt', 'DESC']]
    });
    return res.json(tickets);
  } catch (error) {
    next(error);
  }
};

// [GEN-10] Crear Ticket validando entrada
const createTicket = async (req, res, next) => {
  try {
    const { titulo, descripcion, prioridad } = req.body;
    
    // Validaciones de obligatoriedad
    if (!titulo || !descripcion) {
      return res.status(400).json({ error: true, message: 'El título y la descripción son obligatorios' });
    }

    // [rq-05] Validar valores permitidos de Prioridad
    const prioridadesValidas = ['Baja', 'Media', 'Alta'];
    const prioridadFinal = prioridad || 'Media';
    
    if (!prioridadesValidas.includes(prioridadFinal)) {
      return res.status(422).json({ error: true, message: 'Prioridad inválida. Debe ser Baja, Media o Alta.' });
    }

    const nuevoTicket = await Ticket.create({
      titulo, descripcion, prioridad: prioridadFinal, usuarioId: req.usuario.id
    });
    return res.status(201).json(nuevoTicket);
  } catch (error) {
    next(error);
  }
};

// [rq-05, rq-06, rq-09] Actualizar Estado y Reglas Estrictas
const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, tiempoResolucion } = req.body;
    
    const ticket = await Ticket.findOne({ where: { id, usuarioId: req.usuario.id } });
    if (!ticket) return res.status(404).json({ error: true, message: 'Ticket no encontrado' });

    // [rq-05] Transición: No editar tickets ya cerrados
    if (ticket.estado === 'Cerrado') {
       return res.status(409).json({ error: true, message: 'Regla de negocio: No se puede modificar un ticket que ya fue cerrado.' });
    }

    // [rq-05] Validar valores permitidos de Estado
    const estadosValidos = ['Abierto', 'En Progreso', 'Cerrado'];
    if (estado && !estadosValidos.includes(estado)) {
      return res.status(422).json({ error: true, message: 'Estado inválido. Use Abierto, En Progreso o Cerrado.' });
    }

    // [rq-06] Regla: Solo tickets cerrados aceptan tiempo_resolucion
    if (tiempoResolucion) {
      if (estado !== 'Cerrado') {
        return res.status(422).json({ error: true, message: 'Regla de negocio: Solo puedes registrar el tiempo de resolución si el estado es Cerrado.' });
      }
      ticket.tiempoResolucion = tiempoResolucion;
    }

    if (estado) ticket.estado = estado;
    await ticket.save();
    return res.json({ error: false, message: 'Ticket actualizado con éxito', ticket });
  } catch (error) {
    next(error);
  }
};

const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOne({ where: { id, usuarioId: req.usuario.id } });
    if (!ticket) return res.status(404).json({ error: true, message: 'Ticket no encontrado' });

    await ticket.destroy();
    return res.json({ error: false, message: 'Ticket eliminado' });
  } catch (error) {
    next(error);
  }
};

// [rq-04] Agregar un Comentario al Ticket
const addComentario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { texto } = req.body;
    
    if (!texto) return res.status(400).json({ error: true, message: 'El comentario no puede estar vacío' });
    
    const ticket = await Ticket.findOne({ where: { id, usuarioId: req.usuario.id } });
    if (!ticket) return res.status(404).json({ error: true, message: 'Ticket no encontrado' });

    // Regla lógica: No comentar en tickets cerrados
    if (ticket.estado === 'Cerrado') {
      return res.status(409).json({ error: true, message: 'No se pueden añadir comentarios a un ticket cerrado.' });
    }

    const comentario = await Comentario.create({
      texto, ticketId: id, usuarioId: req.usuario.id
    });
    return res.status(201).json({ error: false, message: 'Comentario agregado', comentario });
  } catch (error) {
    next(error);
  }
};

// [rq-10] Obtener Métricas y SLA
const getMetricas = async (req, res, next) => {
  try {
    // Buscamos los tickets activos del usuario
    const ticketsAbiertos = await Ticket.findAll({ 
      where: { estado: { [Op.ne]: 'Cerrado' }, usuarioId: req.usuario.id } 
    });
    
    let altas = 0, medias = 0, bajas = 0, slaVencidos = 0;
    const ahora = new Date();

    ticketsAbiertos.forEach(t => {
      if (t.prioridad === 'Alta') altas++;
      if (t.prioridad === 'Media') medias++;
      if (t.prioridad === 'Baja') bajas++;
      
      // Cálculo de SLA (Acuerdo de Nivel de Servicio): Se considera vencido si lleva > 24 horas abierto
      const horasAbierto = Math.abs(ahora - t.createdAt) / 36e5;
      if (horasAbierto > 24) slaVencidos++;
    });

    return res.json({ 
      totalActivos: ticketsAbiertos.length, 
      porPrioridad: { altas, medias, bajas },
      slaVencidos
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTickets, createTicket, updateTicket, deleteTicket, addComentario, getMetricas };