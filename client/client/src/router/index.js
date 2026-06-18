import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Register from '../components/Register.vue';
import ResetPassword from '../views/ResetPassword.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/reset', component: ResetPassword },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guardián de navegación: protege las rutas en el frontend
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  let isExpired = true;

  if (token) {
    try {
      // Decodificar el payload del JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Verificar si el tiempo actual es mayor que el tiempo de expiración
      isExpired = payload.exp * 1000 < Date.now();
    } catch (error) {
      isExpired = true; // Si hay error al decodificar, asumimos que es inválido/expirado
    }
  }

  if (to.meta.requiresAuth && (!token || isExpired)) {
    // Si expira, limpiamos el localStorage para no dejar basura
    if (isExpired && token) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
    }
    next('/login');
  } else {
    next();
  }
});

export default router;