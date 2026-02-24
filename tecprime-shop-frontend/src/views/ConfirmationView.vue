<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getOrder } from "@/services/api";
import ApiMessage from "@/components/ApiMessage.vue";
import type { ListOrderDetail } from "@/types/order";

const route = useRoute();
const router = useRouter();
const order = ref<ListOrderDetail | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    order.value = await getOrder(Number(route.params.orderId));
  } catch (err: any) {
    error.value = err.response?.data?.message || "Erro ao carregar pedido.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <ApiMessage
    :error-message="error ?? undefined"
    :loading-message="loading ? 'Carregando pedido...' : undefined"
  />

  <div v-if="order" class="flex flex-col gap-6">
    <!-- Cabeçalho de agradecimento -->
    <div class="flex flex-col items-center gap-2 py-4">
      <div class="flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-green-500"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h1 class="font-bold text-2xl text-green-500 text-center">Pedido confirmado!</h1>
      <p class="text-gray-600 text-sm text-center">
        Obrigado pela sua compra. Seu pedido <span class="font-semibold">#{{ order.orderId }}</span>
        foi recebido com sucesso.
      </p>
    </div>

    <!-- Itens do pedido -->
    <section class="flex flex-col gap-3">
      <h2 class="font-semibold text-lg">Itens do pedido</h2>

      <div class="grid grid-cols-1 gap-3">
        <div
          v-for="item in order.items"
          :key="item.id"
          class="flex flex-row items-center gap-4 p-4 rounded-xl bg-gray-50 md:bg-transparent hover:bg-gray-50 hover:shadow-lg hover:transition-shadow"
        >
          <!-- Imagem -->
          <div class="flex-shrink-0 w-14 h-14">
            <img
              v-if="item.productImage"
              :src="item.productImage"
              :alt="item.productName"
              class="w-full h-full object-contain rounded-xl"
            />
            <img
              v-else
              src="https://plus.unsplash.com/premium_vector-1718631069909-d1a5091a56ae?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              :alt="item.productName"
              class="w-full h-full object-contain rounded-xl"
            />
          </div>

          <!-- Nome e quantidade -->
          <div class="flex flex-col flex-1 min-w-0">
            <p class="font-semibold text-sm truncate">{{ item.productName }}</p>
            <p class="text-gray-500 text-xs mt-0.5">Quantidade: {{ item.quantity }}</p>
          </div>

          <!-- Subtotal -->
          <p class="text-green-500 font-bold text-sm flex-shrink-0">
            R$ {{ Number(item.totalPrice).toFixed(2) }}
          </p>
        </div>
      </div>

      <!-- Total -->
      <div class="flex justify-end pt-1">
        <p class="text-gray-700 font-semibold">
          Total:
          <span class="text-green-500 font-bold text-lg">
            R$ {{ Number(order.totalAmount).toFixed(2) }}
          </span>
        </p>
      </div>
    </section>

    <!-- Detalhes da entrega e pagamento -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Endereço de entrega -->
      <div class="p-4 rounded-xl bg-gray-50 flex flex-col gap-1">
        <div class="flex items-center gap-2 mb-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-primary-color"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <h3 class="font-semibold text-sm">Endereço de entrega</h3>
        </div>
        <p class="text-sm text-gray-700">
          {{ order.shippingStreet }}, {{ order.shippingNumber }}
          <span v-if="order.shippingComplement"> — {{ order.shippingComplement }}</span>
        </p>
        <p class="text-sm text-gray-600">
          {{ order.shippingNeighborhood }}, {{ order.shippingCity }} — {{ order.shippingState }}
        </p>
        <p class="text-xs text-gray-500">
          CEP {{ order.shippingZipCode }}, {{ order.shippingCountry }}
        </p>
      </div>

      <!-- Forma de pagamento -->
      <div class="p-4 rounded-xl bg-gray-50 flex flex-col gap-1">
        <div class="flex items-center gap-2 mb-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-primary-color"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
          <h3 class="font-semibold text-sm">Forma de pagamento</h3>
        </div>
        <p class="text-sm text-gray-700">{{ order.paymentMethod }}</p>
      </div>
    </section>
    <div class="flex justify-center pt-4">
      <button
        @click="router.push('/')"
        class="text-primary-color font-semibold text-sm underline hover:opacity-80 transition-opacity cursor-pointer"
      >
        Retornar à página inicial
      </button>
    </div>
  </div>
</template>
