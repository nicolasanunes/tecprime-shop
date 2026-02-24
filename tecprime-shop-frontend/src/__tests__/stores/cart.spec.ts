import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCartStore } from "@/stores/cart";
import type { Product } from "@/types/product";

const makeProduct = (id: number, stock = 10, price = 100): Product => ({
  id,
  name: `Produto ${id}`,
  description: "Descrição",
  price,
  stock,
  image: `https://img.example.com/${id}.jpg`,
});

describe("cartStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("estado inicial", () => {
    it("deve iniciar com lista de itens vazia", () => {
      const store = useCartStore();
      expect(store.items).toEqual([]);
    });

    it("deve iniciar com totalItems igual a 0", () => {
      const store = useCartStore();
      expect(store.totalItems).toBe(0);
    });

    it("deve iniciar com totalPrice igual a 0", () => {
      const store = useCartStore();
      expect(store.totalPrice).toBe(0);
    });
  });

  describe("addProduct", () => {
    it("deve adicionar um produto com quantidade 1 quando não está no carrinho", () => {
      const store = useCartStore();
      const product = makeProduct(1);

      store.addProduct(product);

      expect(store.items).toHaveLength(1);
      expect(store.items[0].product).toEqual(product);
      expect(store.items[0].quantity).toBe(1);
    });

    it("deve incrementar a quantidade quando o produto já está no carrinho", () => {
      const store = useCartStore();
      const product = makeProduct(1);

      store.addProduct(product);
      store.addProduct(product);

      expect(store.items).toHaveLength(1);
      expect(store.items[0].quantity).toBe(2);
    });

    it("não deve adicionar produto quando estoque é 0", () => {
      const store = useCartStore();
      const product = makeProduct(1, 0);

      store.addProduct(product);

      expect(store.items).toHaveLength(0);
    });

    it("não deve ultrapassar o estoque disponível ao incrementar", () => {
      const store = useCartStore();
      const product = makeProduct(1, 2);

      store.addProduct(product); // qty = 1
      store.addProduct(product); // qty = 2
      store.addProduct(product); // deve ser ignorada (stock = 2)

      expect(store.items[0].quantity).toBe(2);
    });

    it("deve permitir adicionar múltiplos produtos diferentes", () => {
      const store = useCartStore();

      store.addProduct(makeProduct(1));
      store.addProduct(makeProduct(2));
      store.addProduct(makeProduct(3));

      expect(store.items).toHaveLength(3);
    });
  });

  describe("removeProduct", () => {
    it("deve remover o produto do carrinho pelo id", () => {
      const store = useCartStore();
      store.addProduct(makeProduct(1));
      store.addProduct(makeProduct(2));

      store.removeProduct(1);

      expect(store.items).toHaveLength(1);
      expect(store.items[0].product.id).toBe(2);
    });

    it("não deve alterar o carrinho se o produto não existe", () => {
      const store = useCartStore();
      store.addProduct(makeProduct(1));

      store.removeProduct(999);

      expect(store.items).toHaveLength(1);
    });
  });

  describe("decrementProduct", () => {
    it("deve decrementar a quantidade do produto", () => {
      const store = useCartStore();
      const product = makeProduct(1, 10);
      store.addProduct(product);
      store.addProduct(product); // qty = 2

      store.decrementProduct(1);

      expect(store.items[0].quantity).toBe(1);
    });

    it("deve remover o produto quando quantidade chega a 1 e é decrementado", () => {
      const store = useCartStore();
      store.addProduct(makeProduct(1));

      store.decrementProduct(1);

      expect(store.items).toHaveLength(0);
    });

    it("não deve alterar o carrinho se o produto não existe", () => {
      const store = useCartStore();
      store.addProduct(makeProduct(1));

      store.decrementProduct(999);

      expect(store.items).toHaveLength(1);
    });
  });

  describe("clearCart", () => {
    it("deve esvaziar o carrinho", () => {
      const store = useCartStore();
      store.addProduct(makeProduct(1));
      store.addProduct(makeProduct(2));

      store.clearCart();

      expect(store.items).toHaveLength(0);
    });
  });

  describe("totalItems (computed)", () => {
    it("deve somar todas as quantidades dos itens", () => {
      const store = useCartStore();
      const p1 = makeProduct(1, 10);
      const p2 = makeProduct(2, 10);

      store.addProduct(p1);
      store.addProduct(p1); // qty=2
      store.addProduct(p2); // qty=1

      expect(store.totalItems).toBe(3);
    });
  });

  describe("totalPrice (computed)", () => {
    it("deve calcular o total corretamente (preço × quantidade)", () => {
      const store = useCartStore();
      const p1 = makeProduct(1, 10, 100);
      const p2 = makeProduct(2, 10, 50);

      store.addProduct(p1);
      store.addProduct(p1); // p1: 2 × 100 = 200
      store.addProduct(p2); // p2: 1 × 50 = 50

      expect(store.totalPrice).toBe(250);
    });

    it("deve ser 0 quando o carrinho está vazio", () => {
      const store = useCartStore();
      expect(store.totalPrice).toBe(0);
    });
  });
});
