# tecprime-shop-frontend

Interface do projeto **TecPrime Shop**, uma loja virtual de produtos de tecnologia. Desenvolvida com [Vue 3](https://vuejs.org/), [TypeScript](https://www.typescriptlang.org/) e [Vite](https://vitejs.dev/), a aplicação consome a API do backend para exibir produtos, gerenciar o carrinho e realizar pedidos.

---

## Visão Geral

O frontend é responsável por:

- **Home** — listagem paginada de produtos com busca em tempo real e opção de adicionar ao carrinho.
- **Carrinho** — visualização dos itens selecionados, controle de quantidade e cálculo do total.
- **Checkout** — formulário de endereço de entrega, seleção de método de pagamento e envio do pedido (rota protegida).
- **Confirmação** — exibição do resumo do pedido após a finalização (rota protegida).
- **Autenticação** — login via modal com feedback de erro, renovação automática de sessão via refresh token e logout.

---

## Estrutura de Pastas

```
src/
├── App.vue                     # Componente raiz; ativa a verificação de sessão no mount
├── main.ts                     # Bootstrap: cria a app Vue, registra Pinia e Router
│
├── views/                      # Páginas da aplicação (mapeadas no router)
│   ├── HomeView.vue            # Listagem de produtos com paginação e busca
│   ├── CartView.vue            # Carrinho de compras
│   ├── CheckoutView.vue        # Finalização do pedido (requer autenticação)
│   └── ConfirmationView.vue    # Confirmação com resumo do pedido (requer autenticação)
│
├── components/                 # Componentes reutilizáveis
│   ├── NavbarMenu.vue          # Barra de navegação com ícone de carrinho e login/logout
│   ├── LoginComponent.vue      # Modal de login (e-mail + senha)
│   └── ApiMessage.vue          # Exibição de mensagens de erro/sucesso da API
│
├── stores/                     # Estado global com Pinia
│   ├── auth.ts                 # Usuário autenticado, login, logout e checkAuth
│   └── cart.ts                 # Itens do carrinho, totais e manipulação de quantidades
│
├── services/
│   └── api.ts                  # Instância Axios + interceptor de refresh token + funções de API
│
├── router/
│   └── index.ts                # Rotas e navigation guard global (requiresAuth)
│
├── types/                      # Interfaces TypeScript compartilhadas
│   ├── auth.ts                 # User, LoginCredentials, LoginResponse, MeResponse
│   ├── product.ts              # Product, PaginateProductsParams, PaginatedProducts
│   ├── order.ts                # CreateOrder, ListOrder, ListOrderDetail
│   └── address.ts              # Address
│
├── constants/
│   └── images.ts               # Caminhos de imagens e assets estáticos
│
└── assets/
    └── css/                    # Estilos globais (Tailwind CSS v4)
```

---

## Decisões Arquiteturais

### Vue 3 com Composition API e `<script setup>`

Todos os componentes e stores usam a Composition API com `<script setup>`, aproveitando ao máximo a inferência de tipos do TypeScript, melhor legibilidade e reutilização de lógica sem os problemas do Options API (como a perda de contexto de `this`).

### Pinia para gerenciamento de estado

O estado global é dividido em duas stores coesas: `authStore` (sessão do usuário) e `cartStore` (carrinho de compras). O Pinia, em relação ao Vuex, oferece uma API mais simples, suporte nativo a TypeScript e melhor integração com o DevTools do Vue.

### Sessão reidratada via cookie HttpOnly

O `App.vue` chama `authStore.checkAuth()` no `onMounted` para verificar a sessão a partir do cookie `accessToken` definido pelo backend. Isso garante que, ao recarregar a página, o usuário permaneça autenticado sem armazenar tokens no `localStorage`, mitigando ataques XSS.

### Interceptor de refresh token automático

O `services/api.ts` configura um interceptor de resposta no Axios que, ao detectar um erro `401`, tenta automaticamente renovar o `accessToken` via `POST /auth/refresh-token` antes de reenviar a requisição original. Uma fila (`failedQueue`) evita múltiplas tentativas simultâneas de refresh, garantindo que requisições paralelas aguardem o resultado antes de serem reprocessadas.

### Navigation guard com verificação lazy de autenticação

O `router/index.ts` protege rotas com `meta: { requiresAuth: true }` via um `beforeEach` global. Caso o usuário ainda não esteja carregado na store (ex.: primeiro acesso), o guard chama `checkAuth()` para verificar a sessão via cookie antes de decidir redirecionar ou não, evitando redirecionamentos desnecessários por carregamento assíncrono.

### Carrinho 100% client-side

O carrinho é gerenciado exclusivamente no frontend via `cartStore` (Pinia). Isso simplifica a arquitetura, evita rotas de carrinho no backend e é suficiente para o fluxo atual: o usuário adiciona produtos, finaliza o checkout e o pedido é enviado ao backend em uma única requisição.

### Axios centralizado em `services/api.ts`

Toda comunicação com a API passa por uma única instância Axios com `baseURL` lida de `VITE_API_URL` e `withCredentials: true` (para enviar cookies automaticamente). Isso centraliza configuração, autenticação e tratamento de erros, evitando duplicação nos componentes.

### Tailwind CSS v4 via plugin Vite

Os estilos são feitos com Tailwind CSS integrado diretamente ao Vite via `@tailwindcss/vite`, eliminando a necessidade de um arquivo `tailwind.config.js` separado e aproveitando o suporte nativo da v4 ao CSS moderno.

---

## Configuração e Execução

### Pré-requisitos

- Node.js 20+

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3000

# Opcional: host e porta do servidor de desenvolvimento
HOST=0.0.0.0
PORT=5173
```

### Instalando dependências

```bash
npm install
```

### Rodando em desenvolvimento

```bash
npm run dev
```

### Build de produção

```bash
npm run build
```

### Preview do build

```bash
npm run preview
```

---

## Testes

```bash
# unit tests (Vitest)
npm run test:unit
```

---

## Lint e Formatação

```bash
# lint (oxlint + eslint)
npm run lint

# formatação (oxfmt)
npm run format
```
