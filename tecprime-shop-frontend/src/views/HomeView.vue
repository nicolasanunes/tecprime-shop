<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { getProducts } from "@/services/api";
import { useCartStore } from "@/stores/cart";
import ApiMessage from "@/components/ApiMessage.vue";
import type { Product, PaginatedProducts } from "@/types/product";

const cartStore = useCartStore();

const productsArray = ref<PaginatedProducts | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const currentPage = ref(1);
const searchTitle = ref("");
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const fetchProducts = async () => {
  loading.value = true;
  error.value = null;

  try {
    const searchParams: { page: number; search?: string } = {
      page: currentPage.value,
    };

    if (searchTitle.value.trim()) {
      searchParams.search = searchTitle.value.trim();
    }

    productsArray.value = await getProducts(searchParams);
  } catch (err: any) {
    error.value = err.response?.data?.message || "Erro ao carregar produtos";
    console.error("Erro ao buscar produtos:", err);
    setTimeout(() => {
      error.value = null;
    }, 3000);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProducts();
});

watch(searchTitle, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchProducts();
  }, 1000);
});

const changePage = (pageNum: number) => {
  currentPage.value = pageNum;
  fetchProducts();
};

const isCurrentPage = (pageNum: number) => {
  return currentPage.value === pageNum;
};

const addedProductIds = ref<Set<number>>(new Set());

const handleAddToCart = (product: Product) => {
  cartStore.addProduct(product);
  addedProductIds.value = new Set(addedProductIds.value).add(product.id);
  setTimeout(() => {
    const updated = new Set(addedProductIds.value);
    updated.delete(product.id);
    addedProductIds.value = updated;
  }, 2000);
};
</script>

<template>
  <ApiMessage
    :error-message="error ?? undefined"
    :loading-message="loading ? 'Carregando produtos...' : undefined"
  />
  <div class="flex flex-col lg:relative">
    <input
      type="text"
      v-model="searchTitle"
      class="bg-gray-200 rounded-lg px-4 py-2 text-gray-900 mb-2 lg:mb-4"
      placeholder="Pesquisar..."
    />

    <div class="grid grid-cols-1 gap-4">
      <div
        v-for="product in productsArray?.data"
        :key="product.id"
        class="relative p-4 w-full rounded-xl hover:shadow-lg bg-gray-50 md:bg-transparent hover:transition-shadow hover:bg-gray-50"
      >
        <div class="flex flex-row w-full">
          <div class="flex-shrink-0 w-22 h-22 mr-4">
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.name"
              class="w-full h-full object-contain rounded-xl"
            />
            <img
              v-else
              src="https://plus.unsplash.com/premium_vector-1718631069909-d1a5091a56ae?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              :alt="product.name"
              class="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div class="flex flex-col flex-1">
            <p class="font-bold block mr-10">{{ product.name }}</p>

            <p class="text-gray-600 text-sm line-clamp-1 lg:line-clamp-2 lg:mb-1 mr-10">
              {{ product.description }}
            </p>
            <div class="flex w-full justify-between mt-auto">
              <div class="flex">
                <p class="text-green-500">Em estoque: {{ product.stock }}</p>
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
                  class="pl-1 lucide lucide-badge-check-icon lucide-badge-check text-green-500"
                >
                  <path
                    d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
                  />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>

              <p class="text-green-500 font-bold text-lg">R$ {{ product.price.toFixed(2) }}</p>
            </div>
          </div>
        </div>
        <!-- Botão adicionar ao carrinho -->
        <button
          :class="[
            'group absolute top-4 right-4 p-1 rounded-lg text-white transition-colors cursor-pointer',
            addedProductIds.has(product.id)
              ? 'bg-green-500'
              : 'bg-primary-color hover:bg-green-600',
          ]"
          title="Adicionar ao carrinho"
          @click="handleAddToCart(product)"
        >
          <!-- Feedback de sucesso -->
          <svg
            v-if="addedProductIds.has(product.id)"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-check-icon lucide-check"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <!-- Mobile: sempre plus | Desktop: carrinho por padrão, plus no hover -->
          <template v-else>
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
              class="block lg:hidden"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
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
              class="hidden lg:block lg:group-hover:hidden"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path
                d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"
              />
            </svg>
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
              class="hidden lg:group-hover:block"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </template>
        </button>
      </div>
      <div
        v-if="productsArray?.total === 0"
        class="text-center text-gray-600 flex flex-col items-center"
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
          class="lucide lucide-frown-icon lucide-frown mb-2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
          <line x1="9" x2="9.01" y1="9" y2="9" />
          <line x1="15" x2="15.01" y1="9" y2="9" />
        </svg>
        Nenhum produto encontrado
      </div>
    </div>
    <nav v-if="productsArray" class="flex justify-center items-center gap-2 mt-4 order-4">
      <span v-for="pageNum in productsArray.totalPages" :key="pageNum">
        <button
          @click="changePage(pageNum)"
          :class="[
            'px-3 py-1 rounded-full cursor-pointer hover:opacity-80 transition-colors',
            isCurrentPage(pageNum) ? 'bg-primary-color font-bold text-white' : '',
          ]"
        >
          {{ pageNum }}
        </button>
      </span>
    </nav>
  </div>
</template>

<style></style>
