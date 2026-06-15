<script setup>
import { ref } from 'vue';

const email = ref('');
const token = ref('');
const nuevaPassword = ref('');
const mensaje = ref('');
const paso = ref(1); 

const solicitarCodigo = async () => {
  try {
    // 1. Apuntamos a la ruta exacta del backend que ya existe
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/solicitar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    });
    const data = await res.json();
    
    if (res.ok) {
      // 2. EL TRUCO NINJA: Mostramos el código generado por el servidor
      alert(`SIMULACIÓN DE CORREO: Tu código de recuperación es ${data.codigoSimulado}`);
      mensaje.value = "Código enviado. Revisa tu bandeja (o el pop-up).";
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
    // 3. Apuntamos a la ruta PUT de reset que ya está en tu servidor
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        codigo: token.value, // Le enviamos la variable como "codigo" para que el backend la entienda
        nuevaPassword: nuevaPassword.value
      })
    });
    const data = await res.json();
    
    if (res.ok) {
      mensaje.value = "¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.";
      paso.value = 1;
      // Limpiamos los campos para mayor seguridad
      email.value = '';
      token.value = '';
      nuevaPassword.value = '';
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
      <input v-model="email" type="email" placeholder="Tu correo electrónico" required />
      <button @click="solicitarCodigo">Solicitar Código</button>
    </div>

    <div v-if="paso === 2" class="formulario">
      <input v-model="token" type="text" placeholder="Pega el código de 6 dígitos aquí" maxlength="6" required />
      <input v-model="nuevaPassword" type="password" placeholder="Escribe tu nueva contraseña" required />
      <button @click="confirmarNuevaClave">Guardar Nueva Contraseña</button>
    </div>

    <p class="mensaje" :style="{ color: mensaje.includes('éxito') ? '#28a745' : '#dc3545' }" v-if="mensaje">{{ mensaje }}</p>
    
    <p style="margin-top: 15px; font-size: 14px;"><a href="/">Volver a Iniciar Sesión</a></p>
  </div>
</template>

<style scoped>
.contenedor { max-width: 400px; margin: 50px auto; text-align: center; font-family: sans-serif; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
h2 { color: #333; margin-bottom: 10px; }
.formulario { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
input { padding: 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 15px; }
button { padding: 12px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; transition: 0.2s; }
button:hover { background-color: #0056b3; }
.mensaje { font-weight: bold; margin-top: 20px; padding: 10px; border-radius: 5px; background-color: #f8f9fa; }
a { color: #007bff; text-decoration: none; }
a:hover { text-decoration: underline; }
</style>