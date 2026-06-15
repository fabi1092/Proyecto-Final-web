<script setup>
import { ref, onMounted } from 'vue';

const tickets = ref([]);
const metricas = ref(null);
const nuevoTitulo = ref('');
const nuevaDescripcion = ref('');
const nuevaPrioridad = ref('Media');
const nuevoComentario = ref('');

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
    // Ya no necesitamos enviar ?esAdmin=true. El servidor ya sabe quién eres por el Token.
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

const agregarComentario = async (id) => {
  if(!nuevoComentario.value) return alert("Escribe un comentario primero");
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${id}/comentarios`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ texto: nuevoComentario.value })
    });
    if (res.ok) {
      alert("Comentario guardado con éxito");
      nuevoComentario.value = '';
    }
  } catch (error) { console.error("Error al comentar"); }
};

const cerrarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('email'); // Limpiamos también el correo por seguridad
  window.location.href = '/'; 
};

// Dentro de tu onMounted en Dashboard.vue
onMounted(async () => {
  const correoLogueado = localStorage.getItem('email');
  
  // Lista de admins (debe ser igual a la del backend)
  const admins = ['admin@admin.com', 'otro-admin@email.com', 'profe@universidad.cl'];

  // Si el correo existe y está en la lista, es admin
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
        <h4>#{{ ticket.id }} - {{ ticket.titulo }}</h4>
        <p><b>Estado:</b> {{ ticket.estado }} | <b>Prioridad:</b> {{ ticket.prioridad }}</p>
        <p>{{ ticket.descripcion }}</p>
        
        <div class="acciones" v-if="esAdmin">
          <input v-model="nuevoComentario" placeholder="Añadir comentario..." />
          <button @click.prevent="agregarComentario(ticket.id)">Comentar</button>
          <button class="btn-cerrar" v-if="ticket.estado === 'Abierto'" @click.prevent="cerrarTicket(ticket.id)">Cerrar</button>
          <button class="btn-eliminar" @click.prevent="eliminarTicket(ticket.id)">Eliminar</button>
        </div>
        
        <div class="acciones-usuario" v-else>
          <p class="nota-usuario"><em>Tu ticket está siendo revisado por un administrador.</em></p>
        </div>

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
</style>