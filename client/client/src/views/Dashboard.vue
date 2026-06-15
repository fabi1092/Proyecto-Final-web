<template>
  <div class="dashboard">
    <header class="panel-header">
      <h2>🎫 Panel de Soporte Avanzado</h2>
      <button @click="logout" class="btn logout-btn">Cerrar Sesión</button>
    </header>

    <div class="metricas-grid" v-if="metricas">
      <div class="metrica-card">
        <h4>Tickets Activos</h4>
        <span class="numero">{{ metricas.totalActivos }}</span>
      </div>
      <div class="metrica-card">
        <h4>Prioridad Alta</h4>
        <span class="numero peligro">{{ metricas.porPrioridad?.altas || 0 }}</span>
      </div>
      <div class="metrica-card">
        <h4>SLA Vencido (>24h)</h4>
        <span class="numero alerta">{{ metricas.slaVencidos }}</span>
      </div>
    </div>

    <div class="panel-grid">
      <div class="card create-ticket">
        <h3>Abrir Nuevo Ticket</h3>
        <form @submit.prevent="crearTicket">
          <div class="form-group">
            <label>Asunto del problema:</label>
            <input type="text" v-model="nuevoTitulo" placeholder="Ej: Falla en el sistema" required />
          </div>
          <div class="form-group">
            <label>Prioridad:</label>
            <select v-model="nuevaPrioridad">
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
          <div class="form-group">
            <label>Descripción detallada:</label>
            <textarea v-model="nuevaDesc" placeholder="Explica qué ocurrió..." rows="4" required></textarea>
          </div>
          <button type="submit" class="btn primary-btn">Crear Ticket</button>
        </form>
      </div>

      <div class="card tickets-list">
        <div class="header-bandeja">
          <h3>Mi Bandeja</h3>
          <div class="filtros">
            <select v-model="filtroEstado" @change="obtenerTickets">
              <option value="">Todos los Estados</option>
              <option value="Abierto">Abiertos</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Cerrado">Cerrados</option>
            </select>
            <select v-model="filtroPrioridad" @change="obtenerTickets">
              <option value="">Todas las Prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>
        
        <p v-if="errorMensaje" class="alerta-error">{{ errorMensaje }}</p>

        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Asunto</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="tickets.length === 0">
                <td colspan="5" style="text-align: center;">No hay tickets que coincidan con la búsqueda.</td>
              </tr>
              
              <template v-for="ticket in tickets" :key="ticket.id">
                <tr :class="{ 'fila-expandida': ticketsExpandidos[ticket.id] }">
                  <td>#{{ ticket.id }}</td>
                  <td @click="toggleTicket(ticket.id)" class="celda-asunto">
                    <span class="flecha-icono">{{ ticketsExpandidos[ticket.id] ? '▼' : '▶' }}</span>
                    <strong>{{ ticket.titulo }}</strong>
                  </td>
                  <td>
                    <span :class="['badge-prio', ticket.prioridad.toLowerCase()]">{{ ticket.prioridad }}</span>
                  </td>
                  <td>
                    <span :class="['badge', ticket.estado.toLowerCase().replace(' ', '-')]">{{ ticket.estado }}</span>
                  </td>
                  <td class="acciones" @click.stop>
                    <button v-if="ticket.estado !== 'Cerrado'" @click="cerrarTicket(ticket.id)" class="btn btn-sm success-btn">✔ Cerrar</button>
                    <button @click="eliminarTicket(ticket.id)" class="btn btn-sm danger-btn">🗑️</button>
                  </td>
                </tr>

                <tr v-if="ticketsExpandidos[ticket.id]" class="fila-detalles">
                  <td colspan="5">
                    <div class="detalle-contenido">
                      <div class="descripcion-box">
                        <strong>Descripción original:</strong>
                        <p>{{ ticket.descripcion }}</p>
                        <small v-if="ticket.tiempoResolucion" style="color: green;">⏱️ Resuelto en: {{ ticket.tiempoResolucion }} horas</small>
                      </div>
                      
                      <div class="comentarios-seccion">
                        <h4>Hilo de Comentarios</h4>
                        <div class="comentarios-lista">
                          <p v-if="!ticket.comentarios || ticket.comentarios.length === 0" style="color: gray; font-size: 0.9em;">No hay comentarios aún.</p>
                          <div v-for="com in ticket.comentarios" :key="com.id" class="comentario-item">
                            <strong>{{ com.autor.nombre }}:</strong> {{ com.texto }}
                          </div>
                        </div>
                        
                        <div class="nuevo-comentario" v-if="ticket.estado !== 'Cerrado'">
                          <input type="text" v-model="nuevosComentarios[ticket.id]" placeholder="Escribe una respuesta..." @keyup.enter="enviarComentario(ticket.id)" />
                          <button @click="enviarComentario(ticket.id)" class="btn btn-sm primary-btn">Enviar</button>
                        </div>
                        <p v-else style="color: red; font-size: 0.85em;">🔒 Ticket cerrado. No se admiten más comentarios.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
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
const metricas = ref(null);
const errorMensaje = ref('');

// Formularios y Filtros
const nuevoTitulo = ref('');
const nuevaDesc = ref('');
const nuevaPrioridad = ref('Media');
const filtroEstado = ref('');
const filtroPrioridad = ref('');

// Controladores de UI
const ticketsExpandidos = ref({});
const nuevosComentarios = ref({});

const toggleTicket = (id) => {
  ticketsExpandidos.value[id] = !ticketsExpandidos.value[id];
};

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
};

// [rq-10] Cargar Métricas
const obtenerMetricas = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/v1/tickets/metricas', { headers: getHeaders() });
    if (res.ok) metricas.value = await res.json();
  } catch (error) { console.error('Error cargando métricas'); }
};

// [rq-07] Obtener tickets con filtros
const obtenerTickets = async () => {
  errorMensaje.value = '';
  try {
    const query = new URLSearchParams();
    if (filtroEstado.value) query.append('estado', filtroEstado.value);
    if (filtroPrioridad.value) query.append('prioridad', filtroPrioridad.value);

    const res = await fetch(`http://localhost:3000/api/v1/tickets?${query.toString()}`, { headers: getHeaders() });
    
    if (res.ok) {
      tickets.value = await res.json();
    } else if (res.status === 401) {
      logout();
    }
  } catch (error) { console.error('Error obteniendo tickets'); }
};


// Crear Ticket con manejo de errores
const crearTicket = async () => {
  errorMensaje.value = ''; // Limpiamos mensajes anteriores

  try {
    const res = await fetch('http://localhost:3000/api/v1/tickets', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        titulo: nuevoTitulo.value, 
        descripcion: nuevaDesc.value, 
        prioridad: nuevaPrioridad.value 
      })
    });
    
    if (res.ok) {
      // Éxito: Limpiamos el formulario y recargamos la tabla
      nuevoTitulo.value = ''; 
      nuevaDesc.value = ''; 
      nuevaPrioridad.value = 'Media';
      recargarTodo();
    } else {
      // El backend rechazó la petición (GEN-08 y GEN-10)
      const data = await res.json();
      errorMensaje.value = `❌ No se pudo crear: ${data.message || 'Error desconocido'}`;
    }
  } catch (error) {
    console.error(error);
    errorMensaje.value = '❌ Error de red: No se pudo contactar al servidor.';
  }
};

// [rq-06] Cerrar con tiempo de resolución
const cerrarTicket = async (id) => {
  const horasStr = prompt('¿Cuántas horas tomó resolver este ticket? (Ingresa un número)');
  if (horasStr === null) return; // Canceló
  
  const tiempoResolucion = parseInt(horasStr);
  if (isNaN(tiempoResolucion)) {
    errorMensaje.value = 'El tiempo de resolución debe ser un número válido.';
    return;
  }

  const res = await fetch(`http://localhost:3000/api/v1/tickets/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ estado: 'Cerrado', tiempoResolucion })
  });

  if (res.ok) recargarTodo();
  else {
    const data = await res.json();
    errorMensaje.value = data.message;
  }
};

const eliminarTicket = async (id) => {
  if (!confirm('¿Seguro de eliminar?')) return;
  const res = await fetch(`http://localhost:3000/api/v1/tickets/${id}`, {
    method: 'DELETE', headers: getHeaders()
  });
  if (res.ok) recargarTodo();
};

// [rq-04] Enviar Comentario
const enviarComentario = async (ticketId) => {
  const texto = nuevosComentarios.value[ticketId];
  if (!texto || texto.trim() === '') return;

  const res = await fetch(`http://localhost:3000/api/v1/tickets/${ticketId}/comentarios`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ texto })
  });

  if (res.ok) {
    nuevosComentarios.value[ticketId] = ''; // Limpiar input
    obtenerTickets(); // Recargar para ver el comentario
  }
};

const recargarTodo = () => {
  obtenerTickets();
  obtenerMetricas();
};

const logout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};

onMounted(() => {
  recargarTodo();
});
</script>

<style scoped>
.dashboard { max-width: 1200px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
.panel-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 15px; margin-bottom: 20px; }

/* Métricas */
.metricas-grid { display: flex; gap: 15px; margin-bottom: 25px; }
.metrica-card { flex: 1; background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.metrica-card h4 { margin: 0 0 10px 0; color: #555; font-size: 0.9em; text-transform: uppercase; }
.numero { font-size: 2em; font-weight: bold; color: #007bff; }
.numero.peligro { color: #dc3545; }
.numero.alerta { color: #fd7e14; }

/* Layout Principal */
.panel-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; }
.card { background: #fdfdfd; padding: 20px; border-radius: 10px; border: 1px solid #eaeaea; }

.header-bandeja { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.filtros select { padding: 5px; margin-left: 10px; border-radius: 5px; border: 1px solid #ccc; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }

.btn { padding: 8px 12px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-sm { padding: 5px 8px; font-size: 0.8em; margin-right: 5px; }
.primary-btn { background: #007bff; color: white; width: 100%; }
.logout-btn { background: #6c757d; color: white; }
.success-btn { background: #28a745; color: white; }
.danger-btn { background: #dc3545; color: white; }

table { width: 100%; border-collapse: collapse; margin-top: 10px; }
th, td { border-bottom: 1px solid #eee; padding: 12px; text-align: left; }
th { background-color: #f8f9fa; }

.celda-asunto { cursor: pointer; color: #007bff; }
.fila-detalles { background-color: #f9f9fc; }
.detalle-contenido { padding: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.descripcion-box { background: #fff; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff; }

/* Comentarios */
.comentarios-seccion { background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #eee; }
.comentarios-seccion h4 { margin-top: 0; margin-bottom: 10px; font-size: 0.9em; border-bottom: 1px solid #eee; padding-bottom: 5px; }
.comentarios-lista { max-height: 150px; overflow-y: auto; margin-bottom: 10px; }
.comentario-item { background: #f1f3f5; padding: 8px; border-radius: 5px; margin-bottom: 5px; font-size: 0.9em; }
.nuevo-comentario { display: flex; gap: 5px; }
.nuevo-comentario input { flex: 1; padding: 5px; border: 1px solid #ccc; border-radius: 3px; }

.badge { padding: 4px 8px; border-radius: 12px; font-size: 0.75em; font-weight: bold; }
.badge.abierto { background: #ffeeba; color: #856404; }
.badge.cerrado { background: #d4edda; color: #155724; }
.badge.en-progreso { background: #b8daff; color: #004085; }

.badge-prio { padding: 3px 6px; border-radius: 5px; font-size: 0.75em; }
.badge-prio.alta { background: #f8d7da; color: #721c24; }
.badge-prio.media { background: #e2e3e5; color: #383d41; }
.badge-prio.baja { background: #d4edda; color: #155724; }

.alerta-error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; font-size: 0.9em; margin-bottom: 10px; }
</style>