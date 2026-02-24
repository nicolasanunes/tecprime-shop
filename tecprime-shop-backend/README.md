# tecprime-shop-backend

API REST do projeto **TecPrime Shop**, uma loja virtual de produtos de tecnologia. Desenvolvida com [NestJS](https://nestjs.com/) e TypeScript, a aplicação expõe endpoints para autenticação de usuários, consulta de produtos e gerenciamento de pedidos.

---

## Visão Geral

O backend é responsável por:

- **Autenticação** — login, logout e renovação de sessão via JWT armazenado em cookies HttpOnly.
- **Usuários** — consulta de dados do usuário autenticado, incluindo endereços.
- **Produtos** — busca e paginação de produtos obtidos de uma API externa, com cache em memória de 5 minutos para reduzir chamadas externas.
- **Pedidos** — criação e consulta de pedidos vinculados ao usuário autenticado, com validação de estoque e cálculo de totais.

---

## Estrutura de Pastas

```
src/
├── app.module.ts               # Módulo raiz; registra todos os módulos e middlewares globais
├── main.ts                     # Bootstrap da aplicação
│
├── auth/                       # Autenticação JWT
│   ├── auth.controller.ts      # POST /auth, POST /auth/refresh-token, POST /auth/logout, GET /auth/me
│   ├── auth.service.ts         # Lógica de login, refresh e logout
│   ├── jwt.strategy.ts         # Estratégia Passport para validação do JWT
│   └── dtos/                   # DTOs de entrada e saída do módulo de auth
│
├── users/                      # Gerenciamento de usuários
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── entities/               # Entidade User (TypeORM)
│
├── products/                   # Catálogo de produtos
│   ├── products.controller.ts  # GET /products
│   ├── products.service.ts     # Integração com API externa + cache em memória
│   └── dtos/
│
├── orders/                     # Pedidos
│   ├── orders.controller.ts    # POST /orders, GET /orders/:id
│   ├── orders.service.ts       # Orquestração: validação → cálculo → persistência
│   ├── entities/               # Entidades Order e OrderItem (TypeORM)
│   ├── repositories/           # OrdersRepository (abstração das queries TypeORM)
│   ├── mappers/                # Conversão de entidades para DTOs de resposta
│   ├── validators/             # OrderValidator (regras de negócio, ex.: estoque)
│   └── dtos/
│
├── addresses/                  # Endereços do usuário
│   ├── entities/
│   └── dtos/
│
├── db/                         # Configuração do banco de dados
│   ├── data-source.ts          # DataSource do TypeORM (usado pelo CLI de migrations)
│   ├── db-config.service.ts    # Serviço que fornece as opções de conexão ao TypeOrmModule
│   └── migrations/             # Migrations versionadas (schema inicial + seeds)
│
├── common/
│   └── middlewares/
│       └── http-logger.middleware.ts  # Log de todas as requisições HTTP
│
└── utils/
    ├── cookies.ts              # Helpers para escrita de cookies HttpOnly
    └── password.ts             # Hash e comparação de senhas com bcrypt
```

---

## Decisões Arquiteturais

### NestJS com módulos independentes

Cada domínio (auth, users, products, orders) é encapsulado em seu próprio módulo NestJS com controller, service, module e DTOs próprios. Isso mantém o código coeso, facilita testes isolados e torna simples adicionar ou remover funcionalidades sem afetar outros módulos.

### JWT em cookies HttpOnly

Os tokens de acesso (`accessToken`, 15 min) e de renovação (`refreshToken`, 7 dias) são enviados em cookies `HttpOnly` em vez de serem retornados no corpo da resposta. Essa abordagem evita que scripts no frontend acessem os tokens diretamente, mitigando ataques XSS.

### Refresh Token para renovação de sessão

O fluxo de autenticação usa dois tokens: o `accessToken` de curta duração para autorizar requisições e o `refreshToken` de longa duração para emitir novos `accessToken`s sem exigir novo login, equilibrando segurança e experiência do usuário.

### Rate Limiting no endpoint de login

O `ThrottlerModule` limita o endpoint `POST /auth` a **5 tentativas por minuto por IP**, protegendo contra ataques de força bruta. Os demais endpoints respeitam o limite global de 10 req/min, e rotas que não necessitam de proteção utilizam `@SkipThrottle()`.

### Cache em memória para produtos externos

Os produtos são fornecidos por uma API externa (FakeStore API). Para evitar latência excessiva a cada requisição, o `ProductsService` mantém um cache em memória com TTL de 5 minutos. É uma solução simples e eficaz para o volume atual.

### Repository Pattern no módulo de pedidos

O módulo de orders utiliza um `OrdersRepository` dedicado que encapsula as queries do TypeORM, incluindo a criação transacional de `Order` + `OrderItems`. Isso separa a lógica de acesso a dados da orquestração de negócio no `OrdersService`, tornando o código mais testável e fácil de manter.

### Mapper e Validator como classes utilitárias

`OrderMapper` e `OrderValidator` são classes com métodos estáticos que realizam, respectivamente, a conversão de entidades para DTOs e a validação de regras de negócio (como verificação de estoque). Separar essas responsabilidades do service reduz o tamanho das classes e facilita reutilização e testes unitários.

### Migrations com TypeORM CLI

A evolução do schema do banco de dados é controlada por migrations versionadas em `src/db/migrations/`. Isso garante rastreabilidade das mudanças estruturais e facilita a reprodução do ambiente em qualquer máquina ou pipeline de CI/CD.

### Banco de dados via Docker Compose

O MySQL é provisionado localmente via `docker-compose.yaml`, isolando o ambiente de desenvolvimento e evitando dependências de instalações locais do banco.

---

## Configuração e Execução

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de dados
MYSQL_CONTAINER_NAME=tecprime-mysql
MYSQL_PORT=3306
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=tecprime
MYSQL_USER=tecprime
MYSQL_PASSWORD=tecprime

# TypeORM
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=tecprime
DB_PASSWORD=tecprime
DB_DATABASE=tecprime

# JWT
JWT_SECRET=sua_chave_secreta

# API externa de produtos
EXTERNAL_PRODUCTS_API_URL=https://fakestoreapi.com/products
```

### Subindo o banco de dados

```bash
docker compose up -d
```

### Instalando dependências

```bash
npm install
```

### Executando migrations

```bash
npm run migration:run
```

### Rodando a aplicação

```bash
# desenvolvimento (watch mode)
npm run start:dev

# produção
npm run start:prod
```

---

## Testes

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# cobertura
npm run test:cov
```
