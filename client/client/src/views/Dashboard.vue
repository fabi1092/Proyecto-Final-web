<script setup>
import { ref, onMounted, reactive } from 'vue'; // ¡Agregamos reactive aquí!

const tickets = ref([]);
const metricas = ref(null);
const nuevoTitulo = ref('');
const nuevaDescripcion = ref('');
const nuevaPrioridad = ref('Media');

// 1. LA SOLUCIÓN AL TEXTO CLONADO: Un diccionario reactivo para cada ticket
const comentariosLocales = reactive({});

// Estado para edición de tickets
const ticketEditando = ref(null);
const ticketEditData = reactive({ titulo: '', descripcion: '', prioridad: 'Media' });

const iniciarEdicion = (ticket) => {
  ticketEditando.value = ticket.id;
  ticketEditData.titulo = ticket.titulo;
  ticketEditData.descripcion = ticket.descripcion;
  ticketEditData.prioridad = ticket.prioridad || 'Media';
};

const cancelarEdicion = () => {
  ticketEditando.value = null;
};

const guardarEdicion = async (id) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...ticketEditData })
    });
    if (res.ok) {
      cancelarEdicion();
      obtenerTickets();
    } else {
      const data = await res.json();
      alert(data.message || "Error al editar ticket");
    }
  } catch (error) { console.error("Error al guardar edición"); }
};

// Variable para saber si el que entró es el admin
const esAdmin = ref(false);

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const obtenerTickets = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets`, { 
      headers: getAuthHeaders() 
    });
    if (res.ok) tickets.value = await res.json();
  } catch (error) { console.error("Error al cargar tickets"); }
};

const obtenerMetricas = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/metricas`, { headers: getAuthHeaders() });
    if (res.ok) metricas.value = await res.json();
  } catch (error) { console.error("Error al cargar métricas"); }
};

const crearTicket = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        titulo: nuevoTitulo.value,
        descripcion: nuevaDescripcion.value,
        prioridad: nuevaPrioridad.value
      })
    });
    if (res.ok) {
      nuevoTitulo.value = ''; nuevaDescripcion.value = ''; 
      obtenerTickets(); 
      obtenerMetricas(); 
    }
  } catch (error) { console.error("Error al crear ticket"); }
};

const cerrarTicket = async (id) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ estado: 'Cerrado', tiempoResolucion: 24 })
    });
    if (res.ok) { obtenerTickets(); obtenerMetricas(); }
  } catch (error) { console.error("Error al cerrar ticket"); }
};

const eliminarTicket = async (id) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) { obtenerTickets(); obtenerMetricas(); }
  } catch (error) { console.error("Error al eliminar ticket"); }
};

// 2. ACTUALIZAMOS agregarComentario para usar el diccionario local
const agregarComentario = async (id) => {
  const texto = comentariosLocales[id]; // Buscamos el texto específico de este ticket
  
  if(!texto) return alert("Escribe un comentario primero");
  
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${id}/comentarios`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ texto })
    });
    
    if (res.ok) {
      alert("Comentario guardado con éxito");
      comentariosLocales[id] = ''; // Limpiamos ÚNICAMENTE la caja de este ticket
    }
  } catch (error) { console.error("Error al comentar"); }
};

const cerrarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('email'); 
  window.location.href = '/'; 
};

onMounted(async () => {
  const correoLogueado = localStorage.getItem('email');
  const admins = ['admin@admin.com', 'otro-admin@email.com', 'profe@universidad.cl'];

  if (correoLogueado && admins.includes(correoLogueado.toLowerCase())) {
    esAdmin.value = true;
  }

  await obtenerTickets();
  await obtenerMetricas();
});
</script>

<template>
  <div class="dashboard">
    <div class="header">
      <h1>Panel de Soporte <span v-if="esAdmin" class="badge-admin">(Administrador)</span></h1>
      <button class="btn-salir" @click.prevent="cerrarSesion">Cerrar Sesión</button>
    </div>

    <div class="metricas" v-if="esAdmin && metricas">
      <div class="tarjeta">Total Tickets: <b>{{ metricas.totalTickets }}</b></div>
      <div class="tarjeta">Abiertos: <b>{{ metricas.ticketsAbiertos }}</b></div>
      <div class="tarjeta">Cerrados: <b>{{ metricas.ticketsCerrados }}</b></div>
    </div>

    <div class="crear-ticket">
      <h3>Crear Nuevo Ticket</h3>
      <input v-model="nuevoTitulo" placeholder="Título del problema" />
      <input v-model="nuevaDescripcion" placeholder="Descripción detallada" />
      <select v-model="nuevaPrioridad">
        <option value="Baja">Prioridad Baja</option>
        <option value="Media">Prioridad Media</option>
        <option value="Alta">Prioridad Alta</option>
      </select>
      <button class="btn-crear" @click.prevent="crearTicket">Enviar Ticket</button>
    </div>

    <h3>Tickets Recientes</h3>
    <div class="lista-tickets">
      <div class="ticket-card" v-for="ticket in tickets" :key="ticket.id">
        
        <template v-if="ticketEditando === ticket.id">
          <h4>Editando Ticket #{{ ticket.id }}</h4>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px;">
            <input v-model="ticketEditData.titulo" placeholder="Título" class="edit-input" />
            <input v-model="ticketEditData.descripcion" placeholder="Descripción" class="edit-input" />
            <select v-model="ticketEditData.prioridad" class="edit-input">
              <option value="Baja">Prioridad Baja</option>
              <option value="Media">Prioridad Media</option>
              <option value="Alta">Prioridad Alta</option>
            </select>
          </div>
          <div class="acciones">
            <button @click.prevent="guardarEdicion(ticket.id)" class="btn-crear">Guardar</button>
            <button @click.prevent="cancelarEdicion" class="btn-eliminar">Cancelar</button>
          </div>
        </template>
        
        <template v-else>
          <h4>#{{ ticket.id }} - {{ ticket.titulo }}</h4>
          <p><b>Estado:</b> {{ ticket.estado }} | <b>Prioridad:</b> {{ ticket.prioridad }}</p>
          <p>{{ ticket.descripcion }}</p>
          
          <div v-if="ticket.comentarios && ticket.comentarios.length > 0" class="comentarios-lista">
            <h5>Comentarios del Administrador:</h5>
            <div v-for="c in ticket.comentarios" :key="c.id" class="comentario-item">
              <strong>{{ c.autor?.nombre || 'Admin' }}:</strong> {{ c.texto }}
            </div>
          </div>
          
          <div class="acciones">
            <template v-if="esAdmin">
              <input v-model="comentariosLocales[ticket.id]" placeholder="Añadir comentario..." />
              <button @click.prevent="agregarComentario(ticket.id)">Comentar</button>
              <button class="btn-cerrar" v-if="ticket.estado === 'Abierto'" @click.prevent="cerrarTicket(ticket.id)">Cerrar</button>
            </template>
            <button v-if="ticket.estado === 'Abierto'" @click.prevent="iniciarEdicion(ticket)">Editar</button>
            <button class="btn-eliminar" @click.prevent="eliminarTicket(ticket.id)">Eliminar</button>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard { max-width: 800px; margin: 20px auto; font-family: sans-serif; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #eee; }
h1 { color: #333; margin: 0; display: flex; align-items: center; gap: 10px; }
.badge-admin { font-size: 14px; background: #17a2b8; color: white; padding: 3px 8px; border-radius: 10px; }
.btn-salir { background-color: #dc3545; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; }
.btn-salir:hover { background-color: #c82333; }

h3 { color: #333; }
.metricas { display: flex; gap: 15px; margin-bottom: 20px; }
.tarjeta { background: #f8f9fa; padding: 15px; border-radius: 8px; flex: 1; text-align: center; border: 1px solid #ddd; }
.crear-ticket { display: flex; flex-direction: column; gap: 10px; background: #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
input, select { padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
button { padding: 8px 12px; border: none; border-radius: 5px; cursor: pointer; color: white; background: #007bff; transition: 0.2s; }
button:hover { background: #0056b3; }
.btn-crear { background: #28a745; font-size: 16px; padding: 12px; }
.btn-crear:hover { background: #218838; }
.ticket-card { background: white; padding: 15px; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.acciones { display: flex; gap: 10px; margin-top: 15px; align-items: center; }
.btn-cerrar { background: #ffc107; color: black; }
.btn-cerrar:hover { background: #e0a800; }
.btn-eliminar { background: #dc3545; }
.btn-eliminar:hover { background: #c82333; }
.nota-usuario { color: #6c757d; font-size: 14px; margin-top: 10px; }
.edit-input { width: 100%; box-sizing: border-box; }
.comentarios-lista { background: #f1f3f5; padding: 10px; border-radius: 5px; margin-top: 10px; }
.comentarios-lista h5 { margin: 0 0 5px 0; color: #495057; }
.comentario-item { font-size: 14px; margin-bottom: 5px; }
</style>