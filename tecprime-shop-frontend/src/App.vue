<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import NavbarMenu from './components/NavbarMenu.vue'

const authStore = useAuthStore()

// A cada carregamento da página, tenta reidratar a store a partir do cookie httpOnly.
// suppressError=true para não logar erro quando o usuário não está autenticado.
onMounted(() => authStore.checkAuth(true))
</script>

<template>
  <div class="flex flex-col h-screen">
    <header>
      <NavbarMenu />
    </header>
    <main class="flex-1 px-4 py-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
      <RouterView />
    </main>
  </div>
</template>
