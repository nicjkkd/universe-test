# Products App

Full-stack product management system built with two NestJS microservices, a Next.js frontend, and AWS SQS for async event communication.

## Architecture

```
Browser
  │
  ▼
web (Next.js 16)  :3000
  │  HTTP
  ▼
products-service (NestJS)  :3001
  │  SQL              │  SQS publish
  ▼                   ▼
PostgreSQL         LocalStack (SQS queue)
                        │
                        │  SQS consume
                        ▼
             notifications-service (NestJS)  :3002
```

**products-service** — REST API for product CRUD. Persists to PostgreSQL via Prisma, publishes `product.created` / `product.deleted` events to SQS.

**notifications-service** — Stateless SQS consumer. Long-polls the queue and logs incoming events. No HTTP server, no database.

**web** — Next.js frontend. Fetches and mutates products via React Query, validates forms with React Hook Form + Zod, UI built with shadcn/ui.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TanStack Query 5, shadcn/ui (Base UI), Tailwind CSS 4 |
| Backend | NestJS 11, TypeScript, Prisma 7 (pg adapter) |
| Messaging | AWS SQS via LocalStack |
| Database | PostgreSQL 16 |
| Runtime | Node.js 22 |

## Prerequisites

- Node.js 22.12+
- Yarn 1.22+
- Docker + Docker Compose

## Running with Docker

The quickest way to run everything:

```bash
docker compose up --build
```

Services will be available at:
- **Web UI** → http://localhost:3000
- **Products API** → http://localhost:3001
- **Notifications** → http://localhost:3002 (no UI, check logs)

> Postgres and LocalStack include health checks. The app services start only after infrastructure is ready. Database migrations run automatically on products-service startup.

## Local Development

### 1. Start infrastructure

```bash
docker compose up psql localstack
```

### 2. products-service

```bash
cd products-service
cp .env.example .env       # already filled with correct defaults
yarn install
yarn prisma migrate deploy
yarn start:dev
```

### 3. notifications-service

```bash
cd notifications-service
cp .env.example .env
yarn install
yarn start:dev
```

### 4. web

```bash
cd web
cp .env.local.example .env.local
yarn install
yarn dev
```

## Environment Variables

### products-service

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:root@localhost:5432/legaltech_test` | Postgres connection string |
| `SQS_ENDPOINT` | `http://localhost:4566` | LocalStack endpoint |
| `SQS_REGION` | `us-east-1` | AWS region |
| `SQS_QUEUE_URL` | `http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/test-queue` | Queue URL |
| `PORT` | `3001` | HTTP port |

### notifications-service

Same SQS variables as products-service, no `DATABASE_URL`. `PORT` defaults to `3002`.

### web

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Products service base URL |

## API Reference

### Products — `http://localhost:3001`

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/products` | — | List products. Query: `?page=1&limit=10` |
| `POST` | `/products` | `{ name, description, price }` | Create a product |
| `DELETE` | `/products/:id` | — | Delete by UUID |

### Response — `GET /products`

```json
{
  "items": [{ "id": "uuid", "name": "...", "description": "...", "price": "9.99", "createdAt": "..." }],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

## Project Structure

```
.
├── docker-compose.yml
├── products-service/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── products/          # controller, service, DTOs
│   │   ├── sqs/               # SQS publisher
│   │   └── prisma/            # Prisma service
│   └── Dockerfile
├── notifications-service/
│   ├── src/
│   │   └── consumer/          # SQS long-poll consumer
│   └── Dockerfile
└── web/
    ├── src/
    │   ├── app/               # Next.js App Router
    │   ├── components/
    │   │   ├── ui/            # shadcn primitives
    │   │   └── products/      # feature components
    │   └── lib/               # api client, schemas, providers
    └── Dockerfile
```
