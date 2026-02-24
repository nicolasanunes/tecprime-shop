<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { createOrder } from "@/services/api";
import ApiMessage from "@/components/ApiMessage.vue";
import { PaymentMethod } from "@/types/order";
import type { CreateOrder } from "@/types/order";

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const selectedAddressId = ref<number | null>(
  authStore.user?.addresses?.find((a) => a.isDefault)?.id ??
    authStore.user?.addresses?.[0]?.id ??
    null,
);
const selectedPayment = ref<PaymentMethod | null>(null);

const loading = ref(false);
const error = ref<string | null>(null);

onMounted(() => {
  if (cartStore.items.length === 0) {
    router.replace({ name: 'cart' });
  }
});

const paymentOptions: { label: string; value: PaymentMethod }[] = [
  { label: "Pix", value: PaymentMethod.PIX },
  { label: "Boleto", value: PaymentMethod.BOLETO },
  { label: "Cartão de crédito", value: PaymentMethod.CARTAO },
];

const handleConfirm = async () => {
  if (!selectedAddressId.value || !selectedPayment.value) {
    error.value = "Selecione um endereço e uma forma de pagamento.";
    setTimeout(() => (error.value = null), 3000);
    return;
  }

  const address = authStore.user!.addresses.find((a) => a.id === selectedAddressId.value)!;

  const payload: CreateOrder = {
    paymentMethod: selectedPayment.value,
    shippingAddress: {
      street: address.street,
      number: address.number,
      complement: address.complement ?? undefined,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    },
    items: cartStore.items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      productDescription: item.product.description,
      productImage: item.product.image,
      productUnitPrice: item.product.price,
      quantity: item.quantity,
    })),
  };

  loading.value = true;
  error.value = null;

  try {
    const order = await createOrder(payload);
    cartStore.clearCart();
    router.push({ name: "confirmation", params: { orderId: order.orderId } });
  } catch (err: any) {
    error.value = err.response?.data?.message || "Erro ao confirmar pedido.";
    setTimeout(() => (error.value = null), 3000);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <ApiMessage
    :error-message="error ?? undefined"
    :loading-message="loading ? 'Confirmando pedido...' : undefined"
  />

  <div class="flex flex-col gap-6">
    <h1 class="font-bold text-2xl">Checkout</h1>

    <!-- Endereços -->
    <section class="flex flex-col gap-3">
      <h2 class="font-semibold text-lg">Selecionar endereço</h2>

      <div v-if="authStore.user?.addresses?.length" class="grid grid-cols-1 gap-3">
        <button
          v-for="address in authStore.user.addresses"
          :key="address.id"
          @click="selectedAddressId = address.id"
          :class="[
            'w-full text-left p-4 rounded-xl border-2 transition-colors cursor-pointer',
            selectedAddressId === address.id
              ? 'border-primary-color bg-gray-50'
              : 'border-gray-200 bg-gray-50 md:bg-transparent hover:border-gray-400',
          ]"
        >
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-0.5">
              <p class="font-semibold text-sm">
                {{ address.street }}, {{ address.number }}
                <span v-if="address.complement"> — {{ address.complement }}</span>
              </p>
              <p class="text-gray-600 text-sm">
                {{ address.neighborhood }}, {{ address.city }} — {{ address.state }}
              </p>
              <p class="text-gray-500 text-xs">CEP {{ address.zipCode }}, {{ address.country }}</p>
            </div>
            <!-- Indicador de seleção -->
            <div
              :class="[
                'mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                selectedAddressId === address.id
                  ? 'border-primary-color bg-primary-color'
                  : 'border-gray-300',
              ]"
            >
              <svg
                v-if="selectedAddressId === address.id"
                xmlns="http://www.w3.org/2000/svg"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      <div
        v-else
        class="text-center text-gray-600 flex flex-col items-center py-6 rounded-xl bg-gray-50"
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
          class="lucide lucide-map-pin mb-2"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        Nenhum endereço cadastrado
      </div>
    </section>

    <!-- Forma de pagamento -->
    <section class="flex flex-col gap-3">
      <h2 class="font-semibold text-lg">Forma de pagamento</h2>

      <div class="grid grid-cols-1 gap-3">
        <button
          v-for="option in paymentOptions"
          :key="option.value"
          @click="selectedPayment = option.value"
          :class="[
            'w-full text-left p-4 rounded-xl border-2 transition-colors cursor-pointer flex items-center justify-between',
            selectedPayment === option.value
              ? 'border-primary-color bg-gray-50'
              : 'border-gray-200 bg-gray-50 md:bg-transparent hover:border-gray-400',
          ]"
        >
          <span class="font-semibold text-sm">{{ option.label }}</span>
          <div
            :class="[
              'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
              selectedPayment === option.value
                ? 'border-primary-color bg-primary-color'
                : 'border-gray-300',
            ]"
          >
            <svg
              v-if="selectedPayment === option.value"
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        </button>
      </div>
    </section>

    <!-- Resumo e confirmação -->
    <section class="flex flex-col gap-3">
      <div class="flex justify-between text-sm text-gray-600">
        <span>{{ cartStore.totalItems }} {{ cartStore.totalItems === 1 ? "item" : "itens" }}</span>
        <span class="font-bold text-green-500 text-base">
          R$ {{ cartStore.totalPrice.toFixed(2) }}
        </span>
      </div>

      <button
        @click="handleConfirm"
        :disabled="loading || !selectedAddressId || !selectedPayment"
        class="w-full bg-green-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Confirmar pedido
      </button>
    </section>
  </div>
</template>
