const { Ticket, Comentario, Usuario } = require('../models');
const { Op } = require('sequelize');

// [rq-07] Leer Tickets con Filtros y [rq-04] Traer Comentarios
const getTickets = async (req, res, next) => {
  try {
    const { estado, prioridad } = req.query;
    const whereClause = {};

    // Lista de correos permitidos como administradores
    const admins = ['admin@admin.com', 'otro-admin@email.com', 'profe@universidad.cl'];

    // Si el correo NO está en la lista, aplicamos el filtro por usuario
    if (!admins.includes(req.usuario.email)) {
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
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });

    const admins = ['admin@admin.com', 'otro-admin@email.com', 'profe@universidad.cl'];
    const isAdmin = admins.includes(req.usuario.email);
    const isOwner = ticket.usuarioId === req.usuario.id;

    // Solo el dueño o el admin pueden editar/cerrar
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "No tienes permiso para modificar este ticket" });
    }

    await ticket.update(req.body);
    return res.json(ticket);
  } catch (error) { next(error); }
};

const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 1. Verificación de seguridad básica: ¿El usuario viene en el request?
    if (!req.usuario) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });

    // 2. Definimos quiénes son admin y si el usuario actual es admin
    const admins = ['admin@admin.com', 'otro-admin@email.com', 'profe@universidad.cl'];
    const isAdmin = admins.includes(req.usuario.email);
    const isOwner = ticket.usuarioId === req.usuario.id;

    // 3. Permisos
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este ticket" });
    }

    await ticket.destroy();
    return res.json({ message: "Ticket eliminado" });
  } catch (error) { 
    console.error("Error en deleteTicket:", error); // Esto te dirá qué pasó en Railway
    next(error); 
  }
};

// [rq-04] Agregar un Comentario al Ticket
const addComentario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { texto } = req.body;
    const ticket = await Ticket.findByPk(id);

    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });

    const admins = ['admin@admin.com', 'otro-admin@email.com', 'profe@universidad.cl'];
    const isAdmin = admins.includes(req.usuario.email);
    const isOwner = ticket.usuarioId === req.usuario.id;

    // Tanto el dueño como el admin pueden comentar
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "No tienes permiso para comentar" });
    }

    // Aquí creas tu comentario en la base de datos...
    const nuevoComentario = await Comentario.create({
        texto,
        ticketId: id,
        usuarioId: req.usuario.id
    });
    
    return res.json(nuevoComentario);
  } catch (error) { next(error); }
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