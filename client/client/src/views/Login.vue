<template>
  <div class="login-container">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="login">
      <div>
        <label>Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label>Contraseña:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Ingresar</button>
    </form>
    <p v-if="errorMsg" style="color: red;">{{ errorMsg }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const errorMsg = ref('');
const router = useRouter();

const login = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    // GEN-05: Cliente almacena token y redirige
    localStorage.setItem('token', data.token);
    router.push('/dashboard');
  } catch (error) {
    errorMsg.value = error.message;
  }
};
</script>

<style scoped>
.login-container { max-width: 300px; margin: 50px auto; text-align: center; }
input { width: 100%; margin-bottom: 10px; padding: 8px; }
button { width: 100%; padding: 10px; cursor: pointer; }
</style>