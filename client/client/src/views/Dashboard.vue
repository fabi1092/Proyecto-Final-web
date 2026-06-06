<template>
  <div class="dashboard">
    <header>
      <h2>Bandeja de Tickets de Soporte</h2>
      <button @click="logout" class="logout-btn">Cerrar Sesión</button>
    </header>

    <div class="create-ticket">
      <h3>Nuevo Ticket</h3>
      <form @submit.prevent="crearTicket">
        <input type="text" v-model="nuevoTitulo" placeholder="Título del problema" required />
        <textarea v-model="nuevaDesc" placeholder="Describe el problema..." required></textarea>
        <button type="submit">Crear Ticket</button>
      </form>
    </div>

    <div class="tickets-list">
      <h3>Mis Tickets</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in tickets" :key="ticket.id">
            <td>#{{ ticket.id }}</td>
            <td>{{ ticket.titulo }}</td>
            <td><strong>{{ ticket.estado }}</strong></td>
          </tr>
        </tbody>
      </table>
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

const obtenerTickets = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:3000/api/v1/tickets', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.ok) {
    tickets.value = await res.json();
  } else if (res.status === 401) {
    logout(); // Si el token expira, lo echamos
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
    obtenerTickets(); // Recargar la tabla
  }
};

const logout = () => {
  localStorage.removeItem('token'); // GEN-05: Logout limpia sesión
  router.push('/login');
};

onMounted(() => {
  obtenerTickets();
});
</script>

<style scoped>
.dashboard { max-width: 800px; margin: 0 auto; padding: 20px; }
header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
.logout-btn { background: red; color: white; border: none; padding: 8px 15px; cursor: pointer; }
.create-ticket { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; }
.create-ticket input, .create-ticket textarea { width: 100%; margin-bottom: 10px; padding: 8px; }
table { width: 100%; border-collapse: collapse; margin-top: 10px; }
th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
th { background-color: #f2f2f2; }
</style>