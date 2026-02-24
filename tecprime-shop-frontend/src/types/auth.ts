import type { Address } from "./address";

// Usuário completo retornado no login (com endereços)
export interface User {
  id: number;
  name: string;
  email: string;
  addresses: Address[];
}

// Dados retornados em GET /auth/me
export interface MeResponse {
  id: number;
  email: string;
  name: string;
  addresses: Address[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Resposta de POST /auth (login)
export interface LoginResponse {
  user: User;
}
