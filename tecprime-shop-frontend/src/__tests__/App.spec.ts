import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import App from "../App.vue";

vi.mock("@/services/api", () => ({
  getMe: vi.fn().mockResolvedValue(null),
  login: vi.fn(),
  logout: vi.fn(),
  getProducts: vi.fn(),
  createOrder: vi.fn(),
  getOrder: vi.fn(),
  default: {},
}));

vi.mock("@/router", () => ({
  default: {
    push: vi.fn(),
    beforeEach: vi.fn(),
    currentRoute: { value: { meta: {} } },
  },
}));

vi.mock("@/components/NavbarMenu.vue", () => ({
  default: { template: '<nav data-testid="navbar" />' },
}));

describe("App", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("deve renderizar o componente NavbarMenu", () => {
    const wrapper = mount(App, {
      global: {
        stubs: { RouterView: true },
      },
    });

    expect(wrapper.find('[data-testid="navbar"]').exists()).toBe(true);
  });

  it("deve ter uma estrutura com header e main", () => {
    const wrapper = mount(App, {
      global: {
        stubs: { RouterView: true },
      },
    });

    expect(wrapper.find("header").exists()).toBe(true);
    expect(wrapper.find("main").exists()).toBe(true);
  });
});
