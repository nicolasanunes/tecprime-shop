import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getMe, login as loginService, logout as logoutService } from "@/services/api";
import type { User, LoginCredentials, LoginResponse } from "@/types/auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);

  const loginHighlight = ref(false);

  const openLoginWithHighlight = () => {
    loginHighlight.value = true;
  };

  const closeLoginHighlight = () => {
    loginHighlight.value = false;
  };

  /**
   * Verifica se o usuário está autenticado chamando GET /auth/me.
   * O backend lê o accessToken do cookie httpOnly automaticamente.
   * Se suppressError for true, não loga o erro no console (ideal para rotas públicas).
   */
  const checkAuth = async (suppressError = false): Promise<boolean> => {
    try {
      const data = await getMe();
      if (data) {
        // Preserva endereços já carregados, complementando com dados básicos do /me
        user.value = {
          ...user.value,
          id: data.id,
          name: data.name,
          email: data.email,
          addresses: data.addresses ?? [],
        };
        return true;
      }
      return false;
    } catch (err) {
      if (!suppressError) {
        console.error("Erro ao verificar autenticação:", err);
      }
      user.value = null;
      return false;
    }
  };

  /**
   * Login via POST /auth.
   * O backend seta os cookies accessToken e refreshToken (ambos httpOnly).
   * A resposta retorna o usuário completo com endereços.
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const data = await loginService(credentials);
      user.value = data.user;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Erro ao fazer login";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Logout via POST /auth/logout.
   * O backend limpa os cookies accessToken e refreshToken.
   */
  const logout = async (): Promise<void> => {
    try {
      await logoutService();
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    } finally {
      user.value = null;
      error.value = null;
    }
  };

  return {
    user,
    loading,
    error,

    isAuthenticated,
    loginHighlight,
    openLoginWithHighlight,
    closeLoginHighlight,

    login,
    logout,
    checkAuth,
  };
});
