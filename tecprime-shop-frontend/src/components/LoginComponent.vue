<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";

const props = defineProps<{
  highlight?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const showPassword = ref(false);

// Limpa o erro ao desmontar o componente (fechar o modal)
onUnmounted(() => {
  authStore.error = null;
});

const handleLogin = async () => {
  if (!email.value || !password.value) return;

  try {
    await authStore.login({ email: email.value, password: password.value });
    emit("close");
  } catch {
    // erro já está em authStore.error
  }
};
</script>

<template>
  <div
    :class="[
      'absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl z-50 p-4 border-2 transition-colors duration-300',
      props.highlight ? 'border-red-500' : 'border-gray-100',
    ]"
  >
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-base font-bold text-gray-800">Entrar na sua conta</h2>
      <button
        @click="emit('close')"
        class="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Fechar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <!-- Formulário -->
    <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
      <!-- E-mail -->
      <div class="flex flex-col gap-1">
        <label for="login-email" class="text-xs font-medium text-gray-600">E-mail</label>
        <input
          id="login-email"
          v-model="email"
          type="email"
          placeholder="seu@email.com"
          autocomplete="email"
          required
          :disabled="authStore.loading"
          class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-gray-400 focus:bg-white disabled:opacity-50"
        />
      </div>

      <!-- Senha -->
      <div class="flex flex-col gap-1">
        <label for="login-password" class="text-xs font-medium text-gray-600">Senha</label>
        <div class="relative">
          <input
            id="login-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="current-password"
            required
            :disabled="authStore.loading"
            class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 pr-10 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-gray-400 focus:bg-white disabled:opacity-50"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            tabindex="-1"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
          >
            <!-- Olho aberto -->
            <svg
              v-if="!showPassword"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <!-- Olho fechado -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
              />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Erro -->
      <p v-if="authStore.error" class="text-xs text-red-500 -mt-1">
        {{ authStore.error }}
      </p>

      <!-- Botão entrar -->
      <button
        type="submit"
        :disabled="authStore.loading || !email || !password"
        class="w-full rounded-lg bg-green-500 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        <svg
          v-if="authStore.loading"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="animate-spin"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        {{ authStore.loading ? "Entrando..." : "Entrar" }}
      </button>
    </form>
  </div>
</template>
