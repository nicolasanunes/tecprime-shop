<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import LoginComponent from "@/components/LoginComponent.vue";

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const showLogin = ref(false);
const loginAnchor = ref<HTMLElement | null>(null);

// Abre o modal com destaque quando acionado externamente (ex: tentativa de checkout sem login)
watch(
  () => authStore.loginHighlight,
  (val) => {
    if (val) showLogin.value = true;
  },
);

const handleCloseLogin = () => {
  showLogin.value = false;
  authStore.closeLoginHighlight();
};

// Fecha o modal ao clicar fora da âncora
const handleClickOutside = (event: MouseEvent) => {
  if (loginAnchor.value && !loginAnchor.value.contains(event.target as Node)) {
    showLogin.value = false;
  }
};

onMounted(() => document.addEventListener("mousedown", handleClickOutside));
onUnmounted(() => document.removeEventListener("mousedown", handleClickOutside));

const handleLogout = async () => {
  await authStore.logout();
  router.push("/");
};
</script>

<template>
  <div
    class="flex justify-between text-primary-color items-center px-4 py-2 border-b-2 border-primary-color md:px-8 lg:px-16 xl:px-32 2xl:px-64"
  >
    <RouterLink to="/" class="font-bold text-xl">TecPrime Shop</RouterLink>

    <!-- Área de autenticação -->
    <div ref="loginAnchor" class="relative flex items-center gap-8">
      <!-- Botão de logout (autenticado) -->
      <button
        v-if="authStore.isAuthenticated"
        @click="handleLogout"
        class="text-primary-color rounded-lg p-1 text-sm cursor-pointer hover:opacity-80 transition-colors"
        title="Sair"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>

      <!-- Botão de login (não autenticado) -->
      <button
        v-else
        @click="showLogin = !showLogin"
        class="font-semibold text-primary-color text-sm hover:opacity-80 transition-opacity underline cursor-pointer"
      >
        Entrar
      </button>

      <!-- Modal de login (dropdown abaixo do botão) -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <LoginComponent
          v-if="showLogin"
          :highlight="authStore.loginHighlight"
          @close="handleCloseLogin"
        />
      </Transition>

      <RouterLink
        to="/cart"
        class="relative bg-green-500 rounded-lg p-1 text-sm text-white cursor-pointer hover:opacity-80 transition-colors"
        title="Carrinho"
      >
        <span
          v-if="cartStore.totalItems > 0"
          class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1"
        >
          {{ cartStore.totalItems }}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-shopping-cart-icon lucide-shopping-cart"
        >
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path
            d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"
          />
        </svg>
      </RouterLink>
    </div>
  </div>
</template>

<style></style>
