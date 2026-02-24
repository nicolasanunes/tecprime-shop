import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Product } from "@/types/product";

export interface CartItem {
  product: Product;
  quantity: number;
}

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);

  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0));

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );

  const addProduct = (product: Product) => {
    const existing = items.value.find((item) => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return;
      existing.quantity++;
    } else {
      if (product.stock < 1) return;
      items.value.push({ product, quantity: 1 });
    }
  };

  const removeProduct = (productId: number) => {
    items.value = items.value.filter((item) => item.product.id !== productId);
  };

  const decrementProduct = (productId: number) => {
    const existing = items.value.find((item) => item.product.id === productId);
    if (!existing) return;
    if (existing.quantity <= 1) {
      removeProduct(productId);
    } else {
      existing.quantity--;
    }
  };

  const clearCart = () => {
    items.value = [];
  };

  return {
    items,
    totalItems,
    totalPrice,
    addProduct,
    removeProduct,
    decrementProduct,
    clearCart,
  };
});
