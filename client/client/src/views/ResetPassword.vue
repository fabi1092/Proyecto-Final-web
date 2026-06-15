<template>
  <div class="reset-container">
    <div class="card">
      <h2>Restablecer Contraseña</h2>
      
      <p v-if="mensaje" class="alerta-exito">{{ mensaje }}</p>
      <p v-if="errorMsg" class="alerta-error">{{ errorMsg }}</p>

      <form v-if="paso === 1" @submit.prevent="solicitarCodigo">
        <p class="instrucciones">Ingresa tu correo electrónico y te enviaremos un código de recuperación.</p>
        <div class="form-group">
          <label>Correo Electrónico:</label>
          <input type="email" v-model="email" placeholder="ejemplo@correo.com" required />
        </div>
        <button type="submit" class="btn primary-btn" :disabled="cargando">
          {{ cargando ? 'Enviando...' : 'Enviar Código' }}
        </button>
      </form>

      <form v-if="paso === 2" @submit.prevent="confirmarCodigo">
        <p class="instrucciones">Revisa tu correo (o la terminal) e ingresa el código de 6 dígitos.</p>
        <div class="form-group">
          <label>Código de Recuperación:</label>
          <input type="text" v-model="token" placeholder="Ej: 123456" required />
        </div>
        <div class="form-group">
          <label>Nueva Contraseña:</label>
          <input type="password" v-model="nuevaPassword" placeholder="Mínimo 6 caracteres" required />
        </div>
        <button type="submit" class="btn success-btn" :disabled="cargando">
          {{ cargando ? 'Guardando...' : 'Cambiar Contraseña' }}
        </button>
      </form>

      <div class="links">
        <router-link to="/login">Volver al Inicio de Sesión</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Variables de estado
const paso = ref(1);
const email = ref('');
const token = ref('');
const nuevaPassword = ref('');
const mensaje = ref('');
const errorMsg = ref('');
const cargando = ref(false);

const solicitarCodigo = async () => {
  errorMsg.value = ''; mensaje.value = ''; cargando.value = true;
  try {
    const res = await fetch('http://localhost:3000/api/v1/reset/solicitar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    });
    const data = await res.json();
    
    if (res.ok) {
      mensaje.value = data.message;
      paso.value = 2; // Avanzamos a la siguiente pantalla
    } else {
      errorMsg.value = data.message;
    }
  } catch (error) {
    errorMsg.value = 'Error de red al intentar contactar al servidor.';
  } finally {
    cargando.value = false;
  }
};

const confirmarCodigo = async () => {
  errorMsg.value = ''; mensaje.value = ''; cargando.value = true;
  try {
    const res = await fetch('http://localhost:3000/api/v1/reset/confirmar', {
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
      mensaje.value = data.message;
      // Esperamos 2 segundos y lo mandamos al login
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      errorMsg.value = data.message;
    }
  } catch (error) {
    errorMsg.value = 'Error de red al intentar cambiar la contraseña.';
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
.reset-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f4f7f6; }
.card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; }
h2 { color: #333; margin-bottom: 10px; }
.instrucciones { font-size: 0.9em; color: #666; margin-bottom: 20px; }

.form-group { margin-bottom: 15px; text-align: left; }
.form-group label { display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; }
.form-group input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }

.btn { width: 100%; padding: 10px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; transition: 0.2s; margin-top: 10px; }
.primary-btn { background: #007bff; color: white; }
.success-btn { background: #28a745; color: white; }
.btn:disabled { background: #ccc; cursor: not-allowed; }

.alerta-exito { background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin-bottom: 15px; font-size: 0.9em; }
.alerta-error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin-bottom: 15px; font-size: 0.9em; }

.links { margin-top: 20px; font-size: 0.9em; }
.links a { color: #007bff; text-decoration: none; }
</style>