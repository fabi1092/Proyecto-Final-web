<script setup>
import { ref } from 'vue';

const email = ref('');
const password = ref('');
const mensajeError = ref('');
const mensajeExito = ref('');

// Fases de recuperación: 0 = Login normal, 1 = Pedir correo, 2 = Escribir código
const faseReset = ref(0); 
const codigoVerificacion = ref('');
const nuevaPassword = ref('');

const iniciarSesion = async () => {
  mensajeError.value = ''; mensajeExito.value = '';
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
  } catch (error) { mensajeError.value = "Error de servidor"; }
};

const pedirCodigo = async () => {
  if (!email.value) return mensajeError.value = "Ingresa tu correo primero.";
  mensajeError.value = ''; mensajeExito.value = '';

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/solicitar-codigo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    });
    const data = await res.json();

    if (res.ok) {
      // MAGIA DE LA DEMO: Mostramos el código simulando que llegó al celular/correo
      alert(`SIMULACIÓN DE CORREO: Tu código de verificación es ${data.codigoSimulado}`);
      faseReset.value = 2; // Pasamos a la fase de escribir el código
      mensajeExito.value = "Código enviado. Revisa tu bandeja.";
    } else {
      mensajeError.value = data.message;
    }
  } catch (error) { mensajeError.value = "Error al conectar con el servidor"; }
};

const restablecerPassword = async () => {
  if (!codigoVerificacion.value || !nuevaPassword.value) {
    return mensajeError.value = "Llena todos los campos.";
  }
  mensajeError.value = ''; mensajeExito.value = '';

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: email.value, 
        codigo: codigoVerificacion.value, 
        nuevaPassword: nuevaPassword.value 
      })
    });
    const data = await res.json();

    if (res.ok) {
      alert("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
      faseReset.value = 0; // Volvemos al login normal
      password.value = ''; codigoVerificacion.value = ''; nuevaPassword.value = '';
    } else {
      mensajeError.value = data.message;
    }
  } catch (error) { mensajeError.value = "Error al actualizar."; }
};
</script>

<template>
  <div class="login-container">
    <h2>
      <span v-if="faseReset === 0">Iniciar Sesión</span>
      <span v-if="faseReset === 1">Recuperar Cuenta</span>
      <span v-if="faseReset === 2">Código de Verificación</span>
    </h2>
    
    <p v-if="mensajeError" class="alerta-error">{{ mensajeError }}</p>
    <p v-if="mensajeExito" class="alerta-exito">{{ mensajeExito }}</p>

    <div class="formulario">
      <input type="email" v-model="email" placeholder="Correo electrónico" :disabled="faseReset === 2" required />
      
      <input v-if="faseReset === 0" type="password" v-model="password" placeholder="Contraseña" required />
      <button class="btn-ingresar" v-if="faseReset === 0" @click.prevent="iniciarSesion">Entrar</button>
      
      <button class="btn-recuperar" v-if="faseReset === 1" @click.prevent="pedirCodigo">Enviar Código</button>

      <input v-if="faseReset === 2" type="text" v-model="codigoVerificacion" placeholder="Código de 6 dígitos" maxlength="6" required />
      <input v-if="faseReset === 2" type="password" v-model="nuevaPassword" placeholder="Nueva contraseña" required />
      <button class="btn-ingresar" v-if="faseReset === 2" @click.prevent="restablecerPassword">Actualizar Contraseña</button>
    </div>
    
    <div class="opciones-extra">
      <a href="#" v-if="faseReset === 0" @click.prevent="faseReset = 1">¿Olvidaste tu contraseña?</a>
      <a href="#" v-if="faseReset !== 0" @click.prevent="faseReset = 0">Volver al inicio de sesión</a>
      <p class="nota">¿No tienes cuenta? <a href="/register">Regístrate aquí</a></p>
    </div>
  </div>
</template>

<style scoped>
.login-container { max-width: 400px; margin: 50px auto; font-family: sans-serif; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
h2 { color: #333; margin-bottom: 20px; }
.formulario { display: flex; flex-direction: column; gap: 15px; }
input { padding: 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; }
input:disabled { background-color: #e9ecef; cursor: not-allowed; }
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