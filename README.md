# TecPrime Shop

Aplicação fullstack TecPrime Shop simula um e-commerce de produtos para o desafio técnico da empresa TecPrie, composta por um backend REST em NestJS e um frontend SPA em Vue 3. O usuário pode navegar pelo catálogo, adicionar produtos ao carrinho e finalizar pedidos com autenticação via JWT.

---

## Como Executar o Projeto

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

### 1. Backend

```bash
cd tecprime-shop-backend
```

Crie o arquivo `.env`:

```env
MYSQL_CONTAINER_NAME=tecprime-mysql
MYSQL_PORT=3306
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=tecprime
MYSQL_USER=tecprime
MYSQL_PASSWORD=tecprime

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=tecprime
DB_PASSWORD=tecprime
DB_DATABASE=tecprime

JWT_SECRET=minha_chave_secreta

EXTERNAL_PRODUCTS_API_URL=https://fakestoreapi.com/products
```

Suba o banco e inicie a aplicação:

```bash
docker compose up -d        # sobe o MySQL
npm install
npm run migration:run       # executa as migrations
npm run start:dev           # inicia em modo watch (porta 3000)
```

### 2. Frontend

```bash
cd tecprime-shop-frontend
```

Crie o arquivo `.env`:

```env
VITE_API_URL=http://localhost:3000
```

```bash
npm install
npm run dev                 # inicia em modo desenvolvimento (porta 5173)
```

### Testes

```bash
# Backend (Jest)
cd tecprime-shop-backend && npm test

# Frontend (Vitest)
cd tecprime-shop-frontend && npm run test:unit
```

---

## Tecnologias Utilizadas

### Backend

| Tecnologia        | Uso                                                    |
| ----------------- | ------------------------------------------------------ |
| NestJS 11         | Framework principal (módulos, DI, controllers, guards) |
| TypeScript        | Tipagem estática em toda a camada de aplicação         |
| TypeORM           | ORM com migrations versionadas para MySQL              |
| MySQL 8           | Banco de dados relacional                              |
| JWT + Passport    | Autenticação stateless via token                       |
| bcrypt            | Hash e validação de senhas                             |
| @nestjs/throttler | Rate limiting para proteção contra força bruta         |
| @nestjs/axios     | Integração com API externa de produtos                 |
| Docker Compose    | Provisionamento local do banco de dados                |
| Jest              | Testes unitários                                       |

### Frontend

| Tecnologia               | Uso                                                |
| ------------------------ | -------------------------------------------------- |
| Vue 3                    | Framework principal com Composition API            |
| TypeScript               | Tipagem estática em componentes, stores e serviços |
| Vite                     | Bundler e servidor de desenvolvimento              |
| Pinia                    | Gerenciamento de estado global (auth e carrinho)   |
| Vue Router 5             | Roteamento SPA com navigation guards               |
| Axios                    | Comunicação HTTP com o backend                     |
| Tailwind CSS v4          | Estilização utilitária via plugin Vite             |
| Vitest + @vue/test-utils | Testes unitários                                   |

---

## Principais Decisões Técnicas

### Autenticação com JWT em cookies HttpOnly

Os tokens de acesso (15 min) e de renovação (7 dias) são armazenados em cookies `HttpOnly`, nunca expostos ao JavaScript. O frontend nunca acessa os tokens diretamente — o browser os envia automaticamente em cada requisição. Isso mitiga ataques XSS em comparação ao `localStorage`.

### Refresh token automático no frontend

O `services/api.ts` registra um interceptor de resposta no Axios que, ao detectar um `401`, dispara automaticamente `POST /auth/refresh-token` e reprocessa a fila de requisições que falharam, garantindo sessão fluida sem interromper o usuário.

### Rate limiting no endpoint de login

O `ThrottlerModule` limita `POST /auth` a **5 tentativas por minuto por IP**, protegendo contra ataques de força bruta sem impactar rotas que não necessitam de proteção via `@SkipThrottle()`.

### Produtos via API externa com cache em memória

Os produtos são consumidos da [FakeStore API](https://fakestoreapi.com) e mantidos em cache in-process por 5 minutos no `ProductsService`. Isso reduz a latência percebida e o número de chamadas externas sem introduzir dependências externas de cache.

### Repository Pattern e separação de responsabilidades no backend

O módulo de pedidos usa um `OrdersRepository` dedicado (persistência transacional), `OrderValidator` (validação de negócio como estoque) e `OrderMapper` (conversão de entidades para DTOs) — cada classe com uma única responsabilidade, facilitando testes unitários isolados.

### Migrations versionadas com TypeORM CLI

Toda a evolução do schema é controlada por migrations rastreadas em `src/db/migrations/`, garantindo reprodutibilidade em qualquer ambiente (local, CI/CD, staging).

### Carrinho 100% client-side com Pinia

O carrinho é gerenciado exclusivamente no frontend, simplificando a arquitetura e evitando rotas extras no backend. A store Pinia persiste enquanto a sessão está ativa e é enviada em uma única requisição `POST /orders` na finalização do pedido.

### Modularização no NestJS

Cada domínio (auth, users, products, orders) é encapsulado em seu próprio módulo com dependências explícitas, facilitando manutenção, refatoração e adição de novas features sem efeitos colaterais.

---

## Melhorias que Faria com Mais Tempo

### Backend

- **Persistência de produtos no banco**: a solução atual com cache em memória perde os dados a cada restart. Uma tabela `products` com sincronização periódica com a API externa garantiria consistência e permitiria gerenciar estoque real.
- **Refresh token com rotação e revogação**: armazenar o refresh token no banco (com hash) e invalidá-lo após o uso ou ao fazer logout, prevenindo reutilização de tokens vazados.
- **Paginação de pedidos**: expor `GET /orders` com paginação para que o usuário acesse seu histórico completo.
- **Cache distribuído (Redis)**: substituir o cache in-process de produtos por Redis, suportando múltiplas instâncias e TTL configurável.
- **Testes de integração e e2e**: cobrir fluxos completos (login → checkout → confirmação) com banco de dados em memória ou contêiner descartável.
- **Documentação OpenAPI (Swagger)**: gerar a documentação da API automaticamente via decorators do NestJS.
- **Fila de e-mails**: enviar confirmação de pedido por e-mail usando uma fila (BullMQ + Redis) para não bloquear a resposta.

### Frontend

- **Persistência do carrinho**: salvar o estado do carrinho em `localStorage` para que o usuário não perca os itens ao recarregar a página.
- **Histórico de pedidos**: página de perfil com listagem paginada dos pedidos realizados.
- **Gerenciamento de endereços**: CRUD de endereços salvos para facilitar pedidos futuros.
- **Feedback visual mais rico**: skeleton loaders, toasts de sucesso/erro e animações de transição de rotas.
- **Testes de componentes**: cobrir componentes como `NavbarMenu`, `LoginComponent` e as views com `@vue/test-utils`, além de testes de integração das stores com o serviço de API.
- **Aprimorar design**: aplicar técnicas de design modernas.
- **Implementar métodos de pagamentos reais**: continuar o fluxo de pagamento de usuário exibindo as opções de pagamento de acordo com a opção selecionada.
