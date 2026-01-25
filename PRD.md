# Inventory Management System - Implementation Plan

## Overview

Build a full-stack inventory management app with Store and Product resources, filtering/pagination, aggregation stats, and Docker deployment.

---

## Technology Stack

| Layer             | Choice                    | Rationale                                                                                         |
| ----------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| **Backend**       | NestJS + TypeScript       | Structured architecture, dependency injection, decorator-based routing, production-ready patterns |
| **ORM**           | Drizzle ORM               | Lightweight, SQL-like syntax, excellent TypeScript inference, no code generation                  |
| **Database**      | PostgreSQL                | Production-grade, robust, excellent Drizzle support via drizzle-orm/postgres-js                   |
| **Validation**    | Zod + nestjs-zod          | TypeScript-first validation, shared schemas frontend/backend, better type inference               |
| **Cache**         | Redis                     | Available for future caching, sessions, rate limiting                                             |
| **Frontend**      | React + Vite + TypeScript | Fast builds, industry standard                                                                    |
| **Data Fetching** | TanStack Query            | Declarative caching, loading/error states                                                         |
| **Forms**         | React Hook Form + Zod     | Performant with schema validation, same schemas as backend                                        |
| **Styling**       | Tailwind CSS              | Utility-first, rapid development                                                                  |

---

## Data Model

### Store

```typescript
{
  id: number(PK);
  name: string(unique, required);
  address: string(optional);
  phone: string(optional);
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Product

```typescript
{
  id: number (PK)
  storeId: number (FK -> stores.id, cascade delete)
  name: string (required)
  category: string (required)
  price: number (required, positive)
  quantity: number (required, default 0)
  sku: string (optional, unique)
  description: string (optional)
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## API Design

### Stores

| Method | Endpoint                   | Description                                          |
| ------ | -------------------------- | ---------------------------------------------------- |
| GET    | `/api/v1/stores`           | List all stores                                      |
| GET    | `/api/v1/stores/:id`       | Get store details                                    |
| POST   | `/api/v1/stores`           | Create store                                         |
| PUT    | `/api/v1/stores/:id`       | Update store                                         |
| DELETE | `/api/v1/stores/:id`       | Delete store (cascades)                              |
| GET    | `/api/v1/stores/:id/stats` | **Aggregation**: inventory value, category breakdown |

### Products

| Method | Endpoint                           | Description                      |
| ------ | ---------------------------------- | -------------------------------- |
| GET    | `/api/v1/stores/:storeId/products` | List with filtering & pagination |
| GET    | `/api/v1/products/:id`             | Get product                      |
| POST   | `/api/v1/stores/:storeId/products` | Create product                   |
| PUT    | `/api/v1/products/:id`             | Update product                   |
| DELETE | `/api/v1/products/:id`             | Delete product                   |
| PATCH  | `/api/v1/products/:id/stock`       | Update stock quantity            |

### Product Filtering & Pagination

```
GET /api/v1/stores/:storeId/products
  ?page=1&limit=20           // Pagination
  &category=Electronics      // Filter by category
  &minPrice=10&maxPrice=100  // Price range
  &inStock=true              // Only in-stock items
  &lowStock=5                // Items with quantity <= N
  &search=phone              // Search name/description
  &sortBy=price&sortOrder=asc
```

### Non-Trivial Operation: Store Stats

Returns total inventory value, product count, category breakdown, low/out-of-stock counts.

---

## Frontend Screens

### 1. Store List (`/stores`)

- Grid of store cards with name, product count, total value
- "Add Store" button
- Loading skeletons, empty state

### 2. Store Detail (`/stores/:id`)

- Store info header (editable)
- Stats dashboard (total value, product count, alerts)
- Product table with:
  - Filter bar (category, price, stock)
  - Search input
  - Pagination controls
  - Inline stock adjustment
- "Add Product" button
- Product edit modal

---

## Project Structure

```
knostic task/
├── docker-compose.yml
├── README.md
├── .gitignore
│
├── server/                          # NestJS Backend
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── drizzle.config.ts            # Drizzle Kit config for migrations
│   └── src/
│       ├── main.ts                  # Bootstrap NestJS app
│       ├── app.module.ts            # Root module
│       │
│       ├── database/
│       │   ├── database.module.ts   # Drizzle provider setup
│       │   ├── database.provider.ts # Drizzle instance injection
│       │   ├── schema.ts            # Drizzle table definitions (stores, products)
│       │   ├── migrations/          # Generated SQL migrations
│       │   └── seed.service.ts      # Seed data on startup
│       │
│       ├── stores/                  # Store module
│       │   ├── stores.module.ts
│       │   ├── stores.controller.ts
│       │   ├── stores.service.ts
│       │   └── schemas/
│       │       └── store.schema.ts  # Zod validation schemas + DTOs
│       │
│       ├── products/                # Product module
│       │   ├── products.module.ts
│       │   ├── products.controller.ts
│       │   ├── products.service.ts
│       │   └── schemas/
│       │       ├── product.schema.ts
│       │       └── product-filters.schema.ts
│       │
│       ├── inventory/               # Aggregation module
│       │   ├── inventory.module.ts
│       │   ├── inventory.controller.ts
│       │   └── inventory.service.ts
│       │
│       └── common/                  # Shared utilities
│           ├── schemas/
│           │   └── pagination.schema.ts
│           ├── interceptors/
│           │   └── transform.interceptor.ts
│           └── filters/
│               └── http-exception.filter.ts
│
└── web/                             # React Frontend
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── api/                     # API client (axios/fetch)
        ├── schemas/                 # Zod schemas (can mirror backend)
        ├── components/
        │   ├── common/              # Button, Input, Modal, etc.
        │   ├── stores/              # StoreCard, StoreForm
        │   └── products/            # ProductTable, ProductForm, Filters
        ├── hooks/                   # useStores, useProducts
        ├── pages/
        │   ├── StoreListPage.tsx
        │   └── StoreDetailPage.tsx
        └── types/
```

---

## Docker Setup

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: inventory
      POSTGRES_PASSWORD: inventory_secret
      POSTGRES_DB: inventory
    ports: ["5432:5432"]
    volumes: [postgres-data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U inventory"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: [redis-data:/data]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./server
    ports: ["8080:8080"]
    environment:
      DATABASE_URL: postgres://inventory:inventory_secret@postgres:5432/inventory
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./web
    ports: ["3000:80"]
    depends_on:
      backend:
        condition: service_healthy

volumes:
  postgres-data:
  redis-data:
```

Single command: `docker compose up --build`

---

## NestJS Patterns

### Global Configuration (main.ts)

- **ZodValidationPipe**: Auto-validate all incoming DTOs with Zod schemas (from nestjs-zod)
- **TransformInterceptor**: Wrap all responses in `{ success: true, data: ... }` format
- **HttpExceptionFilter**: Standardize error responses with `{ success: false, error: ... }`
- **CORS**: Enable for frontend access

### Zod Schemas (shared between frontend/backend)

```typescript
// schemas/product.schema.ts
import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().nonnegative("Quantity cannot be negative"),
  sku: z.string().optional(),
  description: z.string().optional(),
});

// Auto-generate DTO class for NestJS
export class CreateProductDto extends createZodDto(createProductSchema) {}
```

### Drizzle Schema Definition

```typescript
// database/schema.ts
import {
  pgTable,
  serial,
  text,
  integer,
  decimal,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  address: text("address"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  sku: text("sku").unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const storesRelations = relations(stores, ({ many }) => ({
  products: many(products),
}));
```

### Drizzle Queries for Filtering

```typescript
// products.service.ts - dynamic filtering with Drizzle
import { and, eq, gte, lte, gt, like, sql } from "drizzle-orm";

const conditions = [eq(products.storeId, storeId)];
if (filters.category) conditions.push(eq(products.category, filters.category));
if (filters.minPrice) conditions.push(gte(products.price, filters.minPrice));
if (filters.maxPrice) conditions.push(lte(products.price, filters.maxPrice));
if (filters.inStock) conditions.push(gt(products.quantity, 0));

const result = await db
  .select()
  .from(products)
  .where(and(...conditions))
  .limit(filters.limit)
  .offset((filters.page - 1) * filters.limit);
```

---

## Seed Data

3 stores with 30+ products each across categories (Electronics, Clothing, Food). Auto-seeds on first startup if database is empty.

---

## Testing Strategy

### Backend (Jest - NestJS built-in)

- Unit tests: services with mocked repositories
- Integration tests: controllers with test module, in-memory SQLite
- E2E tests: full API testing with supertest
- Key cases: CRUD, filtering edge cases, aggregation accuracy, cascade delete

### Frontend (Vitest + React Testing Library)

- Component tests: rendering states (loading, error, empty)
- Hook tests: data fetching behavior
- Integration: form validation, filter interactions

---

## Implementation Order

1. ~~**Project Setup**: Initialize NestJS project, Docker compose with Postgres + Redis~~ **DONE**
2. ~~**Database Setup**: Configure Drizzle ORM with PostgreSQL, create schema.ts with tables~~ **DONE**
3. ~~**Drizzle Integration**: Create database module/provider for NestJS dependency injection~~ **DONE**
4. ~~**Backend Modules**: Create stores, products, inventory modules with controllers/services~~ **DONE**
5. ~~**Zod Validation**: Create Zod schemas with nestjs-zod DTOs, configure global validation pipe~~ **DONE** (implemented in modules)
6. ~~**Backend Features**: Filtering, pagination (Drizzle queries), aggregation endpoints~~ **DONE**
7. ~~**Seed Data**: Create seed service to populate initial data on startup~~ **DONE**
8. ~~**Frontend Core**: Vite + React setup, Router, TanStack Query, Store List page~~ **DONE**
9. **Frontend Features**: Store Detail page, filters, forms with Zod validation
10. **Polish**: Loading states, error handling, validation feedback
11. **Docker & Tests**: Finalize Dockerfiles, write Jest tests for backend
12. **Documentation**: README with decisions and trade-offs

---

## Critical Files to Create

1. `server/src/database/schema.ts` - Drizzle table definitions for stores and products
2. `server/src/database/database.provider.ts` - Drizzle instance with NestJS injection
3. `server/src/products/products.service.ts` - Filtering/pagination with Drizzle queries
4. `server/src/inventory/inventory.service.ts` - Aggregation calculations (SQL aggregates)
5. `web/src/pages/StoreDetailPage.tsx` - Main UI with products
6. `docker-compose.yml` - Infrastructure orchestration (Postgres, Redis, backend, frontend)

---

## Verification Plan

1. **Backend API**: Test endpoints with curl/httpie
   - Create store and products
   - Test filtering combinations
   - Verify aggregation calculations
2. **Frontend**: Manual testing in browser
   - Navigate store list -> detail
   - Apply filters, verify results
   - Test form validation
3. **Docker**: `docker compose up --build` from clean state
   - Verify seed data appears
   - Test full user flow
4. **Automated Tests**: `npm test` in both server/ and web/

## Commit Guidelines

- also include changes of PRD.md file and progress.txt file in every commit
- use `[ROBOT]` prefix in commit messages
