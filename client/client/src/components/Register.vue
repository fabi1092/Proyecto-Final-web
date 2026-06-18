<script setup>
import { ref } from 'vue';

// 1. Variables del formulario
const nombre = ref('');
const email = ref('');
const password = ref('');

// 2. AQUÍ ESTÁ LA VARIABLE MÁGICA (Debe estar suelta, fuera de cualquier función)
const mensajeError = ref('');

const registrarUsuario = async () => {
  // Limpiamos el error cada vez que el usuario hace clic
  mensajeError.value = '';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    mensajeError.value = "Por favor, ingresa un correo electrónico válido.";
    return; // Detenemos todo aquí, no enviamos nada al servidor
   }

  if (password.value.length < 6) {
    mensajeError.value = "La contraseña debe tener mínimo 6 caracteres.";
    return;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre.value,
        email: email.value,
        password: password.value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      // Si el backend se queja, guardamos el mensaje aquí
      mensajeError.value = data.message || "Error al registrarse. Revisa tus datos.";
      return; 
    }

    // Si todo sale perfecto
    alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
    window.location.href = '/'; // O la ruta que uses para tu Login

  } catch (error) {
    console.error("Error en la petición:", error);
    mensajeError.value = "Error de conexión con el servidor.";
  }
};
</script>

<template>
  <div class="registro-container">
    <h2>Crear Cuenta</h2>
    
    <p v-if="mensajeError" class="alerta-error">{{ mensajeError }}</p>

    <div class="formulario">
      <input type="text" v-model="nombre" placeholder="Nombre completo" required />
      <input type="email" v-model="email" placeholder="Correo electrónico" required />
      <input type="password" v-model="password" placeholder="Contraseña" required />
      
      <button class="btn-registrar" @click.prevent="registrarUsuario">Registrarse</button>
    </div>
    
    <p class="nota">¿Ya tienes cuenta? <a href="/">Inicia sesión aquí</a></p>
  </div>
</template>

<style scoped>
.registro-container { max-width: 400px; margin: 50px auto; font-family: sans-serif; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
h2 { color: #333; margin-bottom: 20px; }
.formulario { display: flex; flex-direction: column; gap: 15px; }
input { padding: 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; }
.btn-registrar { background-color: #28a745; color: white; border: none; padding: 12px; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; transition: 0.2s; }
.btn-registrar:hover { background-color: #218838; }
.nota { margin-top: 20px; font-size: 14px; color: #666; }
.nota a { color: #007bff; text-decoration: none; }
.nota a:hover { text-decoration: underline; }

/* ESTILOS DEL ERROR */
.alerta-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
}
</style>