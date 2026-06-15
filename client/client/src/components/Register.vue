<script setup>
import { ref } from 'vue';

const nombre = ref('');
const email = ref('');
const password = ref('');
const mensaje = ref('');

const registrar = async () => {
  // Limpiamos el error cada vez que el usuario intenta de nuevo
  mensajeError.value = ''; 

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

    const data = await res.json(); // Leemos lo que nos responde el servidor

    if (!res.ok) {
      // SI FALLA: Capturamos el mensaje del backend (ej: "El correo ya existe" o "Correo inválido")
      // Si el backend no manda un 'message', ponemos uno genérico.
      mensajeError.value = data.message || "Error al registrarse. Revisa tus datos.";
      return; // Detenemos la ejecución aquí
    }

    // SI TODO SALE BIEN: Redirigimos al login (o donde lo tengas configurado)
    alert("¡Registro exitoso!");
    window.location.href = '/login'; 

  } catch (error) {
    console.error("Error en la petición:", error);
    mensajeError.value = "Error de conexión con el servidor.";
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
      
      <p v-if="mensajeError" class="alerta-error">{{ mensajeError }}</p>
      <button class="btn-principal" @click.prevent="registrar">Registrarse</button>
      
      <p class="mensaje" v-if="mensaje">{{ mensaje }}</p>
    </div>
  </div>
</template>

<style scoped>
.contenedor { max-width: 400px; margin: 50px auto; text-align: center; font-family: sans-serif; }
.formulario { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
input { padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
.btn-principal { padding: 10px; background-color: #17a2b8; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
.btn-principal:hover { background-color: #138496; }
.mensaje { color: #28a745; font-weight: bold; margin-top: 15px; }
.alerta-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 15px;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
}
</style>