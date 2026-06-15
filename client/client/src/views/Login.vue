<script setup>
import { ref } from 'vue';

const email = ref('');
const password = ref('');
const mensajeError = ref('');
const mensajeExito = ref('');

// Variable mágica para cambiar entre "Login" y "Recuperar"
const mostrarReset = ref(false);
const nuevaPassword = ref('');

const iniciarSesion = async () => {
  mensajeError.value = '';
  mensajeExito.value = '';

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', email.value); 
      mensajeExito.value = "¡Inicio de sesión exitoso! Entrando...";
      setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
    } else {
      mensajeError.value = data.message || "Credenciales incorrectas";
    }
  } catch (error) {
    mensajeError.value = "Error al conectar con el servidor";
  }
};

const restablecerPassword = async () => {
  mensajeError.value = '';
  mensajeExito.value = '';

  if (!email.value || !nuevaPassword.value) {
    mensajeError.value = "Por favor ingresa tu correo y la nueva contraseña.";
    return;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, nuevaPassword: nuevaPassword.value })
    });

    const data = await res.json();

    if (res.ok) {
      mensajeExito.value = "Contraseña actualizada correctamente.";
      mostrarReset.value = false; // Volvemos a la pantalla de Login
      password.value = ''; // Limpiamos la clave antigua
    } else {
      mensajeError.value = data.message || "Error al actualizar la contraseña";
    }
  } catch (error) {
    mensajeError.value = "Error al conectar con el servidor";
  }
};
</script>

<template>
  <div class="login-container">
    <h2>{{ mostrarReset ? 'Recuperar Contraseña' : 'Iniciar Sesión' }}</h2>
    
    <p v-if="mensajeError" class="alerta-error">{{ mensajeError }}</p>
    <p v-if="mensajeExito" class="alerta-exito">{{ mensajeExito }}</p>

    <div class="formulario">
      <input type="email" v-model="email" placeholder="Correo electrónico" required />
      
      <input v-if="!mostrarReset" type="password" v-model="password" placeholder="Contraseña" required />
      
      <input v-if="mostrarReset" type="password" v-model="nuevaPassword" placeholder="Escribe tu NUEVA contraseña" required />
      
      <button class="btn-ingresar" v-if="!mostrarReset" @click.prevent="iniciarSesion">Entrar</button>
      <button class="btn-recuperar" v-if="mostrarReset" @click.prevent="restablecerPassword">Actualizar Contraseña</button>
    </div>
    
    <div class="opciones-extra">
      <a href="#" v-if="!mostrarReset" @click.prevent="mostrarReset = true">¿Olvidaste tu contraseña?</a>
      <a href="#" v-if="mostrarReset" @click.prevent="mostrarReset = false">Volver al inicio de sesión</a>
      <p class="nota">¿No tienes cuenta? <a href="/register">Regístrate aquí</a></p>
    </div>
  </div>
</template>

<style scoped>
.login-container { max-width: 400px; margin: 50px auto; font-family: sans-serif; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
h2 { color: #333; margin-bottom: 20px; }
.formulario { display: flex; flex-direction: column; gap: 15px; }
input { padding: 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; }
.btn-ingresar { background-color: #007bff; color: white; border: none; padding: 12px; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; transition: 0.2s; }
.btn-ingresar:hover { background-color: #0056b3; }
.btn-recuperar { background-color: #ffc107; color: black; border: none; padding: 12px; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; transition: 0.2s; }
.btn-recuperar:hover { background-color: #e0a800; }

.alerta-error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; padding: 10px; border-radius: 5px; margin-bottom: 15px; font-weight: bold; font-size: 14px; }
.alerta-exito { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; padding: 10px; border-radius: 5px; margin-bottom: 15px; font-weight: bold; font-size: 14px; }

.opciones-extra { margin-top: 20px; display: flex; flex-direction: column; gap: 10px; font-size: 14px; color: #666; }
.opciones-extra a { color: #007bff; text-decoration: none; cursor: pointer; }
.opciones-extra a:hover { text-decoration: underline; }
</style>