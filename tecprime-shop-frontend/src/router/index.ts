import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/CartView.vue'),
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/CheckoutView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/confirmation/:orderId',
      name: 'confirmation',
      component: () => import('@/views/ConfirmationView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Guard global: redireciona para home se a rota requer autenticação e o usuário não está autenticado
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()

    // Se ainda não há usuário carregado, tenta verificar via cookie
    if (!authStore.isAuthenticated) {
      const isAuth = await authStore.checkAuth(true)
      if (!isAuth) {
        return { name: 'home' }
      }
    }
  }
  return true
})

export default router
