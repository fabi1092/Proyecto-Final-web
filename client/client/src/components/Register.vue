<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const nombre = ref('');
const email = ref('');
const password = ref('');
const mensaje = ref('');

const registrar = async () => {
  if (!nombre.value || !email.value || !password.value) {
    mensaje.value = "Por favor, llena todos los campos.";
    return;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: nombre.value,
        email: email.value,
        password: password.value
      })
    });

    const data = await res.json();

    if (res.ok) {
      mensaje.value = "¡Registro exitoso! Redirigiendo al Login...";
      nombre.value = '';
      email.value = '';
      password.value = '';
      
      // Magia de redirección después de 1.5 segundos
      setTimeout(() => {
        router.push('/'); // Cámbiarlo por '/login' si tu ruta de inicio de sesión se llama así
      }, 1500);

    } else {
      mensaje.value = data.message || "Error al crear la cuenta";
    }
  } catch (error) {
    console.error(error);
    mensaje.value = "Error al conectar con el servidor en la nube";
  }
};
</script>

<template>
  <div class="contenedor">
    <h2>Crear Cuenta Nueva</h2>
    <div class="formulario">
      <input v-model="nombre" type="text" placeholder="Tu nombre completo" />
      <input v-model="email" type="email" placeholder="Correo electrónico" />
      <input v-model="password" type="password" placeholder="Contraseña segura" />
      <button @click="registrar">Registrarse</button>
      <p class="mensaje" v-if="mensaje">{{ mensaje }}</p>
    </div>
  </div>
</template>

<style scoped>
.contenedor { max-width: 400px; margin: 50px auto; text-align: center; font-family: sans-serif; }
.formulario { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
input { padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
button { padding: 10px; background-color: #17a2b8; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
button:hover { background-color: #138496; }
.mensaje { color: #28a745; font-weight: bold; margin-top: 15px; }
</style>