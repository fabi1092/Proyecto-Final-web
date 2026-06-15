<script setup>
import { ref } from 'vue';

const email = ref('');
const password = ref('');
const mensaje = ref('');

const login = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      mensaje.value = "¡Inicio de sesión exitoso!";
      // Descomenta la siguiente línea si quieres que te redirija automáticamente
      // window.location.href = '/dashboard'; 
    } else {
      mensaje.value = data.message || "Error al iniciar sesión";
    }
  } catch (error) {
    console.error(error);
    mensaje.value = "Error al conectar con el servidor";
  }
};
</script>

<template>
  <div class="contenedor">
    <h2>Iniciar Sesión</h2>
    <div class="formulario">
      <input v-model="email" type="email" placeholder="Correo electrónico" />
      <input v-model="password" type="password" placeholder="Contraseña" />
      <button @click="login">Entrar al Sistema</button>
      <p class="mensaje" v-if="mensaje">{{ mensaje }}</p>
    </div>
  </div>
</template>

<style scoped>
.contenedor { max-width: 400px; margin: 50px auto; text-align: center; font-family: sans-serif; }
.formulario { display: flex; flex-direction: column; gap: 15px; }
input { padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
button { padding: 10px; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; }
button:hover { background-color: #218838; }
.mensaje { color: #d9534f; font-weight: bold; }
</style>