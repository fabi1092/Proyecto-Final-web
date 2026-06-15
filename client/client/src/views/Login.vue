<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
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

      localStorage.setItem('email', email.value);

      
      mensaje.value = "¡Inicio de sesión exitoso! Entrando...";
      
      // Le damos 1 segundo al navegador para asimilar el token antes de saltar
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
      
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
      <button class="btn-principal" @click.prevent="login">Entrar al Sistema</button>
      <p class="mensaje" v-if="mensaje">{{ mensaje }}</p>
      
      <div class="opciones-extra">
        <p>¿No tienes una cuenta?</p>
        <router-link to="/register" class="btn-secundario">Regístrate aquí</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contenedor { max-width: 400px; margin: 50px auto; text-align: center; font-family: sans-serif; }
.formulario { display: flex; flex-direction: column; gap: 15px; }
input { padding: 10px; border: 1px solid #ccc; border-radius: 5px; }

.btn-principal { padding: 10px; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 16px; }
.btn-principal:hover { background-color: #218838; }

.mensaje { color: #d9534f; font-weight: bold; }

.opciones-extra { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
.opciones-extra p { margin-bottom: 10px; color: #555; }
.btn-secundario { display: inline-block; padding: 8px 15px; background-color: #f8f9fa; color: #007bff; text-decoration: none; border: 1px solid #007bff; border-radius: 5px; font-weight: bold; transition: all 0.3s ease; }
.btn-secundario:hover { background-color: #007bff; color: white; }
</style>