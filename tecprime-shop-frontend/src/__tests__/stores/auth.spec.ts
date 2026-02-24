import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "@/stores/auth";
import type { MeResponse, LoginResponse } from "@/types/auth";

// Mocka o módulo de API para isolar a store de chamadas HTTP
vi.mock("@/services/api", () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

import * as api from "@/services/api";

const mockUser = {
  id: 1,
  name: "Nicolas",
  email: "nicolas@email.com",
  addresses: [],
};

const mockMeResponse: MeResponse = { ...mockUser };
const mockLoginResponse: LoginResponse = { user: mockUser };

describe("authStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("estado inicial", () => {
    it("deve iniciar com user nulo", () => {
      const store = useAuthStore();
      expect(store.user).toBeNull();
    });

    it("deve iniciar com loading false", () => {
      const store = useAuthStore();
      expect(store.loading).toBe(false);
    });

    it("deve iniciar com error nulo", () => {
      const store = useAuthStore();
      expect(store.error).toBeNull();
    });

    it("isAuthenticated deve ser false quando user é nulo", () => {
      const store = useAuthStore();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe("checkAuth", () => {
    it("deve retornar true e popular user quando getMe tem sucesso", async () => {
      vi.mocked(api.getMe).mockResolvedValue(mockMeResponse);
      const store = useAuthStore();

      const result = await store.checkAuth();

      expect(result).toBe(true);
      expect(store.user?.id).toBe(mockUser.id);
      expect(store.user?.email).toBe(mockUser.email);
      expect(store.isAuthenticated).toBe(true);
    });

    it("deve retornar false e limpar user quando getMe lança erro", async () => {
      vi.mocked(api.getMe).mockRejectedValue(new Error("Unauthorized"));
      const store = useAuthStore();
      store.user = mockUser;

      const result = await store.checkAuth(true);

      expect(result).toBe(false);
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });

    it("não deve logar erro no console quando suppressError=true", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(api.getMe).mockRejectedValue(new Error("Unauthorized"));
      const store = useAuthStore();

      await store.checkAuth(true);

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("deve logar erro no console quando suppressError=false (padrão)", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(api.getMe).mockRejectedValue(new Error("Unauthorized"));
      const store = useAuthStore();

      await store.checkAuth(false);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("login", () => {
    it("deve popular user e limpar error após login bem-sucedido", async () => {
      vi.mocked(api.login).mockResolvedValue(mockLoginResponse);
      const store = useAuthStore();

      await store.login({ email: "nicolas@email.com", password: "senha123" });

      expect(store.user).toEqual(mockUser);
      expect(store.error).toBeNull();
      expect(store.loading).toBe(false);
    });

    it("deve definir loading=true durante o login e false após", async () => {
      let resolveLogin!: (value: LoginResponse) => void;
      vi.mocked(api.login).mockReturnValue(
        new Promise<LoginResponse>((res) => {
          resolveLogin = res;
        }),
      );
      const store = useAuthStore();

      const loginPromise = store.login({ email: "nicolas@email.com", password: "senha123" });
      expect(store.loading).toBe(true);

      resolveLogin(mockLoginResponse);
      await loginPromise;
      expect(store.loading).toBe(false);
    });

    it("deve definir error e relançar exceção quando login falha", async () => {
      const apiError = {
        response: { data: { message: "E-mail e/ou senha inválidos!" } },
      };
      vi.mocked(api.login).mockRejectedValue(apiError);
      const store = useAuthStore();

      await expect(
        store.login({ email: "errado@email.com", password: "senha_errada" }),
      ).rejects.toEqual(apiError);

      expect(store.error).toBe("E-mail e/ou senha inválidos!");
      expect(store.loading).toBe(false);
    });

    it("deve usar mensagem genérica quando o erro não tem response.data.message", async () => {
      vi.mocked(api.login).mockRejectedValue(new Error("Network Error"));
      const store = useAuthStore();

      await expect(store.login({ email: "teste@email.com", password: "123" })).rejects.toThrow();

      expect(store.error).toBe("Erro ao fazer login");
    });
  });

  describe("logout", () => {
    it("deve limpar user e error após logout bem-sucedido", async () => {
      vi.mocked(api.logout).mockResolvedValue(undefined);
      const store = useAuthStore();
      store.user = mockUser;
      store.error = "algum erro";

      await store.logout();

      expect(store.user).toBeNull();
      expect(store.error).toBeNull();
    });

    it("deve limpar user mesmo quando o serviço de logout lança erro", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(api.logout).mockRejectedValue(new Error("Server error"));
      const store = useAuthStore();
      store.user = mockUser;

      await store.logout();

      expect(store.user).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe("loginHighlight", () => {
    it("openLoginWithHighlight deve definir loginHighlight como true", () => {
      const store = useAuthStore();
      expect(store.loginHighlight).toBe(false);

      store.openLoginWithHighlight();

      expect(store.loginHighlight).toBe(true);
    });

    it("closeLoginHighlight deve definir loginHighlight como false", () => {
      const store = useAuthStore();
      store.openLoginWithHighlight();

      store.closeLoginHighlight();

      expect(store.loginHighlight).toBe(false);
    });
  });
});
