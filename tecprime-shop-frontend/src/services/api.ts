import axios, { type AxiosInstance } from "axios";
import router from "@/router";
import type { PaginateProductsParams, PaginatedProducts } from "@/types/product";
import type { CreateOrder, ListOrder, ListOrderDetail } from "@/types/order";
import type { LoginCredentials, LoginResponse, MeResponse } from "@/types/auth";

// Instância do axios com configuração base
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Envia cookies automaticamente (accessToken e refreshToken httpOnly)
});

// Flag para prevenir múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Interceptor de resposta: se erro 401, tenta refresh automático do token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // O refresh token está no cookie httpOnly, o backend lê automaticamente
        await api.post("/auth/refresh-token");
        processQueue(null);
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        isRefreshing = false;
        router.push("/");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// ---- Autenticação ----

// GET /auth/me
export const getMe = async (): Promise<MeResponse> => {
  const response = await api.get<MeResponse>("/auth/me");
  return response.data;
};

// POST /auth (login)
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth", credentials);
  return response.data;
};

// POST /auth/logout
export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

// ---- Produtos ----

// GET /products?page=1&limit=10
export const getProducts = async (params?: PaginateProductsParams): Promise<PaginatedProducts> => {
  const response = await api.get<PaginatedProducts>("/products", { params });
  return response.data;
};

// ---- Pedidos ----

// POST /orders (requer autenticação)
export const createOrder = async (data: CreateOrder): Promise<ListOrder> => {
  const response = await api.post<ListOrder>("/orders", data);
  return response.data;
};

// GET /orders/:id (requer autenticação)
export const getOrder = async (id: number): Promise<ListOrderDetail> => {
  const response = await api.get<ListOrderDetail>(`/orders/${id}`);
  return response.data;
};

export default api;
