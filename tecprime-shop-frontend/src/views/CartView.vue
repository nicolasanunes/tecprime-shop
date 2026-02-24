<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import ApiMessage from "@/components/ApiMessage.vue";
import { PLACEHOLDER_IMAGE } from "@/constants/images";

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const authError = ref<string | null>(null);

const handleCheckout = () => {
  if (!authStore.isAuthenticated) {
    authError.value = "Você precisa estar logado para finalizar a compra.";
    setTimeout(() => (authError.value = null), 3000);
    authStore.openLoginWithHighlight();
    return;
  }
  router.push("/checkout");
};
</script>

<template>
  <ApiMessage :error-message="authError ?? undefined" />
  <div class="flex flex-col">
    <h1 class="font-bold text-2xl mb-4">Carrinho de compras</h1>

    <div class="grid grid-cols-1 gap-4">
      <!-- Item do carrinho -->
      <div
        v-for="item in cartStore.items"
        :key="item.product.id"
        class="relative p-4 w-full rounded-xl hover:shadow-lg bg-gray-50 md:bg-transparent hover:transition-shadow hover:bg-gray-50"
      >
        <div class="flex flex-row w-full">
          <!-- Imagem -->
          <div class="flex-shrink-0 w-22 h-22 mr-4">
            <img
              v-if="item.product.image"
              :src="item.product.image"
              :alt="item.product.name"
              class="w-full h-full object-contain rounded-xl"
            />
            <img
              v-else
              :src="PLACEHOLDER_IMAGE"
              :alt="item.product.name"
              class="w-full h-full object-contain rounded-xl"
            />
          </div>

          <!-- Informações -->
          <div class="flex flex-col flex-1">
            <p class="font-bold block mr-10">{{ item.product.name }}</p>
            <p class="text-gray-600 text-sm line-clamp-1 lg:line-clamp-2 lg:mb-1 mr-10">
              {{ item.product.description }}
            </p>

            <div class="flex w-full justify-between mt-auto">
              <!-- Controle de quantidade -->
              <div class="flex items-center gap-2">
                <button
                  @click="cartStore.decrementProduct(item.product.id)"
                  class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer font-bold text-gray-700"
                  title="Diminuir quantidade"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <span class="font-semibold text-sm w-5 text-center">{{ item.quantity }}</span>
                <button
                  @click="cartStore.addProduct(item.product)"
                  :disabled="item.quantity >= item.product.stock"
                  class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer font-bold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Aumentar quantidade"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </button>
              </div>

              <p class="text-green-500 font-bold text-lg">
                R$ {{ (item.product.price * item.quantity).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Botão remover -->
        <button
          class="absolute top-4 right-4 p-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
          title="Remover produto"
          @click="cartStore.removeProduct(item.product.id)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-trash-2"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
          </svg>
        </button>
      </div>

      <!-- Estado vazio -->
      <div
        v-if="cartStore.items.length === 0"
        class="text-center text-gray-600 flex flex-col items-center py-8"
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
          class="lucide lucide-shopping-cart mb-2"
        >
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path
            d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"
          />
        </svg>
        Seu carrinho está vazio
      </div>
    </div>

    <!-- Botão adicionar produtos (alinhado à direita) -->
    <div class="flex justify-end pt-2">
      <button
        @click="router.push('/')"
        class="text-green-500 font-semibold text-sm hover:opacity-80 transition-opacity underline cursor-pointer"
      >
        + Adicionar produtos
      </button>
    </div>

    <!-- Ações -->
    <div v-if="cartStore.items.length > 0" class="mt-6 flex flex-col gap-3 pt-4">
      <!-- Total -->
      <div class="flex justify-end">
        <p class="text-gray-700 font-semibold text-lg">
          Subtotal:
          <span class="text-green-500 font-bold">R$ {{ cartStore.totalPrice.toFixed(2) }}</span>
        </p>
      </div>

      <!-- Botão ir para checkout (centralizado) -->
      <button
        @click="handleCheckout"
        class="bg-primary-color text-white font-semibold py-2 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
      >
        Ir para checkout
      </button>
    </div>

    <!-- Adicionar produtos quando carrinho vazio -->
    <div v-else class="mt-4 flex justify-center">
      <button
        @click="router.push('/')"
        class="text-green-500 font-semibold text-sm hover:opacity-80 transition-opacity underline cursor-pointer"
      >
        + Adicionar produtos
      </button>
    </div>
  </div>
</template>
