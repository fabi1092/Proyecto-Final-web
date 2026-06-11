<template>
  <div class="dashboard">
    <header class="panel-header">
      <h2>🎫 Panel de Tickets de Soporte</h2>
      <button @click="logout" class="btn logout-btn">Cerrar Sesión</button>
    </header>

    <div class="panel-grid">
      <div class="card create-ticket">
        <h3>Abrir Nuevo Ticket</h3>
        <form @submit.prevent="crearTicket">
          <div class="form-group">
            <label>Asunto del problema:</label>
            <input type="text" v-model="nuevoTitulo" placeholder="Ej: No funciona el sistema" required />
          </div>
          <div class="form-group">
            <label>Descripción detallada:</label>
            <textarea v-model="nuevaDesc" placeholder="Explica detalladamente qué ocurrió..." rows="5" required></textarea>
          </div>
          <button type="submit" class="btn primary-btn">Crear Ticket</button>
        </form>
      </div>

      <div class="card tickets-list">
        <h3>Mis Tickets Creados ({{ tickets.length }})</h3>
        <p class="ayuda-texto"><small>💡 Haz clic sobre el asunto de un ticket para expandir o contraer su descripción.</small></p>
        
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Asunto / Problema (Haz clic)</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="tickets.length === 0">
                <td colspan="4" style="text-align: center; color: #888;">No tienes tickets creados.</td>
              </tr>
              
              <tr v-for="ticket in tickets" :key="ticket.id" :class="{ 'fila-expandida': ticketsExpandidos[ticket.id] }">
                <td>#{{ ticket.id }}</td>
                
                <td @click="toggleTicket(ticket.id)" class="celda-asunto">
                  <div class="titulo-contenedor">
                    <span class="flecha-icono">{{ ticketsExpandidos[ticket.id] ? '▼' : '▶' }}</span>
                    <strong class="ticket-titulo">{{ ticket.titulo }}</strong>
                  </div>
                  
                  <div class="descripcion-contenedor">
                    <p v-if="ticketsExpandidos[ticket.id]" class="texto-completo">
                      {{ ticket.descripcion }}
                    </p>
                    <p v-else class="texto-recortado">
                      {{ ticket.descripcion.substring(0, 40) }}{{ ticket.descripcion.length > 40 ? '...' : '' }}
                    </p>
                  </div>
                </td>
                
                <td>
                  <span :class="['badge', ticket.estado.toLowerCase().replace(' ', '-')]">
                    {{ ticket.estado }}
                  </span>
                </td>
                
                <td class="acciones" @click.stop> <button 
                    v-if="ticket.estado !== 'Cerrado'" 
                    @click="cerrarTicket(ticket.id)" 
                    class="btn btn-sm success-btn"
                    title="Marcar como resuelto"
                  >✔ Cerrar</button>
                  
                  <button 
                    @click="eliminarTicket(ticket.id)" 
                    class="btn btn-sm danger-btn"
                    title="Borrar ticket"
                  >🗑️ Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const tickets = ref([]);
const nuevoTitulo = ref('');
const nuevaDesc = ref('');

// Diccionario reactivo para controlar qué filas están abiertas { idTicket: true/false }
const ticketsExpandidos = ref({});

const toggleTicket = (id) => {
  ticketsExpandidos.value[id] = !ticketsExpandidos.value[id];
};

const obtenerTickets = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:3000/api/v1/tickets', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.ok) {
    tickets.value = await res.json();
  } else if (res.status === 401) {
    logout();
  }
};

const crearTicket = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:3000/api/v1/tickets', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ titulo: nuevoTitulo.value, descripcion: nuevaDesc.value })
  });
  
  if (res.ok) {
    nuevoTitulo.value = '';
    nuevaDesc.value = '';
    obtenerTickets();
  }
};

const cerrarTicket = async (id) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:3000/api/v1/tickets/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.ok) obtenerTickets();
};

const eliminarTicket = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este ticket?')) return;
  
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:3000/api/v1/tickets/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.ok) obtenerTickets();
};

const logout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};

onMounted(() => {
  obtenerTickets();
});
</script>

<style scoped>
.dashboard { max-width: 1100px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
.panel-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 15px; margin-bottom: 20px; }
.panel-grid { display: grid; grid-template-columns: 1fr 1.8fr; gap: 25px; }
.card { background: #fdfdfd; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #eaeaea; }

.ayuda-texto { margin: -5px 0 15px 0; color: #666; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; }
.form-group input, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; font-family: inherit; }

.btn { padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-sm { padding: 5px 10px; font-size: 0.8em; margin-right: 5px; }
.primary-btn { background: #007bff; color: white; width: 100%; }
.primary-btn:hover { background: #0056b3; }
.logout-btn { background: #dc3545; color: white; }
.success-btn { background: #28a745; color: white; }
.danger-btn { background: #dc3545; color: white; }

table { width: 100%; border-collapse: collapse; margin-top: 10px; }
th, td { border-bottom: 1px solid #eee; padding: 12px; text-align: left; vertical-align: top; }
th { background-color: #f8f9fa; color: #333; }

/* Estilos dinámicos para la celda expandible */
.celda-asunto { cursor: pointer; transition: background 0.2s; }
.celda-asunto:hover { background-color: #f5f9ff; }
.titulo-contenedor { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.flecha-icono { font-size: 0.8em; color: #007bff; transition: transform 0.2s; }
.ticket-titulo { color: #222; }

.descripcion-contenedor { padding-left: 18px; }
.texto-recortado { color: #666; margin: 0; font-size: 0.9em; }
.texto-completo { color: #333; margin: 5px 0 0 0; font-size: 0.95em; line-height: 1.4; white-space: pre-wrap; background: #f9f9f9; padding: 10px; border-radius: 5px; border-left: 3px solid #007bff; }

.fila-expandida { background-color: #fafcfe; }

.acciones { display: flex; gap: 5px; }

.badge { padding: 5px 10px; border-radius: 15px; font-size: 0.8em; font-weight: bold; display: inline-block; }
.badge.abierto { background: #ffeeba; color: #856404; }
.badge.cerrado { background: #d4edda; color: #155724; }

@media (max-width: 850px) {
  .panel-grid { grid-template-columns: 1fr; }
}
</style>