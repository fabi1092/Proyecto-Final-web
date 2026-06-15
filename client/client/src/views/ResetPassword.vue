<script setup>
import { ref } from 'vue';

const email = ref('');
const token = ref('');
const nuevaPassword = ref('');
const mensaje = ref('');
const paso = ref(1); 

const solicitarCodigo = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/reset/solicitar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    });
    const data = await res.json();
    
    if (res.ok) {
      mensaje.value = "Código enviado. Revisa la consola o tu correo.";
      paso.value = 2; 
    } else {
      mensaje.value = data.message || "Error al solicitar el código";
    }
  } catch (error) {
    mensaje.value = "Error de conexión con el servidor";
  }
};

const confirmarNuevaClave = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/reset/confirmar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        token: token.value,
        nuevaPassword: nuevaPassword.value
      })
    });
    const data = await res.json();
    
    if (res.ok) {
      mensaje.value = "¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.";
      paso.value = 1;
    } else {
      mensaje.value = data.message || "Error al cambiar la contraseña";
    }
  } catch (error) {
    mensaje.value = "Error de conexión con el servidor";
  }
};
</script>

<template>
  <div class="contenedor">
    <h2>Recuperar Contraseña</h2>
    
    <div v-if="paso === 1" class="formulario">
      <p>Ingresa tu correo para recibir el código de recuperación.</p>
      <input v-model="email" type="email" placeholder="Tu correo electrónico" />
      <button @click="solicitarCodigo">Solicitar Código</button>
    </div>

    <div v-if="paso === 2" class="formulario">
      <input v-model="token" type="text" placeholder="Pega el código aquí" />
      <input v-model="nuevaPassword" type="password" placeholder="Escribe tu nueva contraseña" />
      <button @click="confirmarNuevaClave">Guardar Nueva Contraseña</button>
    </div>

    <p class="mensaje" v-if="mensaje">{{ mensaje }}</p>
  </div>
</template>

<style scoped>
.contenedor { max-width: 400px; margin: 50px auto; text-align: center; font-family: sans-serif; }
.formulario { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
input { padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
button { padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
button:hover { background-color: #0056b3; }
.mensaje { color: #28a745; font-weight: bold; margin-top: 20px;}
</style>