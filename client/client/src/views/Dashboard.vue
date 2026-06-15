<script setup>
import { ref, onMounted } from 'vue';

const tickets = ref([]);
const metricas = ref(null);
const nuevoTitulo = ref('');
const nuevaDescripcion = ref('');
const nuevaPrioridad = ref('Media');
const nuevoComentario = ref('');

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const obtenerTickets = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets`, { headers: getAuthHeaders() });
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
      nuevoTitulo.value = ''; nuevaDescripcion.value = ''; // Limpiar campos
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

onMounted(() => {
  obtenerTickets();
  obtenerMetricas();
});
</script>

<template>
  <div class="dashboard">
    <h1>Panel de Soporte Técnico</h1>

    <div class="metricas" v-if="metricas">
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
      <button class="btn-crear" @click="crearTicket">Enviar Ticket</button>
    </div>

    <h3>Tus Tickets</h3>
    <div class="lista-tickets">
      <div class="ticket-card" v-for="ticket in tickets" :key="ticket.id">
        <h4>#{{ ticket.id }} - {{ ticket.titulo }}</h4>
        <p><b>Estado:</b> {{ ticket.estado }} | <b>Prioridad:</b> {{ ticket.prioridad }}</p>
        <p>{{ ticket.descripcion }}</p>
        
        <div class="acciones">
          <input v-model="nuevoComentario" placeholder="Añadir comentario..." />
          <button @click="agregarComentario(ticket.id)">Comentar</button>
          <button class="btn-cerrar" v-if="ticket.estado === 'Abierto'" @click="cerrarTicket(ticket.id)">Cerrar Ticket</button>
          <button class="btn-eliminar" @click="eliminarTicket(ticket.id)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard { max-width: 800px; margin: 20px auto; font-family: sans-serif; }
h1, h3 { color: #333; }
.metricas { display: flex; gap: 15px; margin-bottom: 20px; }
.tarjeta { background: #f8f9fa; padding: 15px; border-radius: 8px; flex: 1; text-align: center; border: 1px solid #ddd; }
.crear-ticket { display: flex; flex-direction: column; gap: 10px; background: #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
input, select { padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
button { padding: 8px 12px; border: none; border-radius: 5px; cursor: pointer; color: white; background: #007bff; }
button:hover { background: #0056b3; }
.btn-crear { background: #28a745; font-size: 16px; padding: 12px; }
.ticket-card { background: white; padding: 15px; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.acciones { display: flex; gap: 10px; margin-top: 15px; }
.btn-cerrar { background: #ffc107; color: black; }
.btn-eliminar { background: #dc3545; }
</style>