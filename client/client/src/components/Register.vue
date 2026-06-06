<template>
  <div class="register-container">
    <h2>Crear Cuenta</h2>
    <form @submit.prevent="registrarUsuario">
      <div>
        <label for="nombre">Nombre:</label>
        <input type="text" id="nombre" v-model="form.nombre" required />
      </div>
      <div>
        <label for="email">Correo Electrónico:</label>
        <input type="email" id="email" v-model="form.email" required />
      </div>
      <div>
        <label for="password">Contraseña:</label>
        <input type="password" id="password" v-model="form.password" required />
      </div>
      
      <button type="submit">Registrarse</button>
    </form>

    <div v-if="errorMsg" class="error-alert">
      {{ errorMsg }}
    </div>
    
    <div v-if="successMsg" class="success-alert">
      {{ successMsg }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const form = ref({
  nombre: '',
  email: '',
  password: ''
});

const errorMsg = ref(null);
const successMsg = ref(null);

const registrarUsuario = async () => {
  errorMsg.value = null;
  successMsg.value = null;

  try {
    // Apunta a la variable de entorno de Vite o a localhost si no está configurada
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    
    const response = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    });

    const data = await response.json();

    if (!response.ok) {
      // Captura el error (400 o 409) y lo muestra en UI
      throw new Error(data.message || 'Error al registrar');
    }

    // Registro exitoso
    successMsg.value = '¡Registro exitoso! Ya puedes iniciar sesión.';
    form.value = { nombre: '', email: '', password: '' };

  } catch (error) {
    errorMsg.value = error.message;
  }
};
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.error-alert {
  color: red;
  margin-top: 15px;
  background-color: #fee;
  padding: 10px;
  border-radius: 4px;
}
.success-alert {
  color: green;
  margin-top: 15px;
  background-color: #efe;
  padding: 10px;
  border-radius: 4px;
}
div {
  margin-bottom: 10px;
}
label {
  display: block;
  margin-bottom: 5px;
}
input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
</style>