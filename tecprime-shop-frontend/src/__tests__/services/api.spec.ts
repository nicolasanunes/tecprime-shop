import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";

// Mocks devem ser declarados antes dos imports que dependem deles
vi.mock("@/router", () => ({
  default: { push: vi.fn() },
}));

import api, { getMe, login, logout, getProducts, createOrder, getOrder } from "@/services/api";
import type { Product, PaginatedProducts } from "@/types/product";
import type { MeResponse, LoginResponse } from "@/types/auth";
import type { ListOrder, ListOrderDetail, PaymentMethod } from "@/types/order";

// Helper para montar um AxiosResponse fake
function axiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
}

const mockProduct: Product = {
  id: 1,
  name: "Notebook Gamer",
  description: "Ótimo para jogos",
  price: 4999.99,
  stock: 5,
  image: "https://img.example.com/1.jpg",
};

const mockPaginatedProducts: PaginatedProducts = {
  data: [mockProduct],
  total: 1,
  page: 1,
  limit: 5,
  totalPages: 1,
};

const mockMeResponse: MeResponse = {
  id: 1,
  name: "Nicolas",
  email: "nicolas@email.com",
  addresses: [],
};

const mockLoginResponse: LoginResponse = {
  user: { ...mockMeResponse },
};

const mockListOrder: ListOrder = {
  orderId: 1,
  status: "pending",
  totalAmount: 4999.99,
  paymentMethod: "Pix",
  createdAt: "2024-01-01T00:00:00.000Z",
};

describe("services/api", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getMe", () => {
    it("deve chamar GET /auth/me e retornar os dados do usuário", async () => {
      vi.spyOn(api, "get").mockResolvedValue(axiosResponse(mockMeResponse));

      const result = await getMe();

      expect(api.get).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(mockMeResponse);
    });
  });

  describe("login", () => {
    it("deve chamar POST /auth com as credenciais e retornar o usuário", async () => {
      vi.spyOn(api, "post").mockResolvedValue(axiosResponse(mockLoginResponse));
      const credentials = { email: "nicolas@email.com", password: "senha123" };

      const result = await login(credentials);

      expect(api.post).toHaveBeenCalledWith("/auth", credentials);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe("logout", () => {
    it("deve chamar POST /auth/logout", async () => {
      vi.spyOn(api, "post").mockResolvedValue(axiosResponse(undefined));

      await logout();

      expect(api.post).toHaveBeenCalledWith("/auth/logout");
    });
  });

  describe("getProducts", () => {
    it("deve chamar GET /products sem parâmetros quando nenhum é fornecido", async () => {
      vi.spyOn(api, "get").mockResolvedValue(axiosResponse(mockPaginatedProducts));

      const result = await getProducts();

      expect(api.get).toHaveBeenCalledWith("/products", { params: undefined });
      expect(result).toEqual(mockPaginatedProducts);
    });

    it("deve chamar GET /products com os parâmetros de paginação e busca", async () => {
      vi.spyOn(api, "get").mockResolvedValue(axiosResponse(mockPaginatedProducts));
      const params = { page: 2, limit: 10, search: "notebook" };

      await getProducts(params);

      expect(api.get).toHaveBeenCalledWith("/products", { params });
    });
  });

  describe("createOrder", () => {
    it("deve chamar POST /orders com o payload do pedido", async () => {
      vi.spyOn(api, "post").mockResolvedValue(axiosResponse(mockListOrder));
      const orderPayload = {
        paymentMethod: "Pix" as unknown as PaymentMethod,
        shippingAddress: {
          street: "Rua das Flores",
          number: "123",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
          zipCode: "01001-000",
          country: "Brasil",
        },
        items: [
          {
            productId: 1,
            productName: "Notebook Gamer",
            productDescription: "Ótimo para jogos",
            productImage: "https://img.example.com/1.jpg",
            productUnitPrice: 4999.99,
            quantity: 1,
          },
        ],
      };

      const result = await createOrder(orderPayload);

      expect(api.post).toHaveBeenCalledWith("/orders", orderPayload);
      expect(result).toEqual(mockListOrder);
    });
  });

  describe("getOrder", () => {
    it("deve chamar GET /orders/:id e retornar os detalhes do pedido", async () => {
      const mockOrderDetail = {
        ...mockListOrder,
        shippingStreet: "Rua das Flores",
        shippingNumber: "123",
        shippingComplement: null,
        shippingNeighborhood: "Centro",
        shippingCity: "São Paulo",
        shippingState: "SP",
        shippingZipCode: "01001-000",
        shippingCountry: "Brasil",
        items: [],
        updatedAt: "2024-01-01T00:00:00.000Z",
      } as ListOrderDetail;
      vi.spyOn(api, "get").mockResolvedValue(axiosResponse(mockOrderDetail));

      const result = await getOrder(1);

      expect(api.get).toHaveBeenCalledWith("/orders/1");
      expect(result).toEqual(mockOrderDetail);
    });
  });
});
