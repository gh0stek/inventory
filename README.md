# Inventory Management System

A full-stack inventory management application with Store and Product resources, featuring filtering, pagination, aggregation statistics, and Docker deployment.

## Quick Start

```bash
# Start all services with Docker
docker compose up --build -d

# Run database migrations and seed data
cd server
npm install
npm run db:migrate       # Run migrations
npm run db:seed          # Seed initial data
```

# Access the application

# Frontend: http://localhost:3000

# Backend API: http://localhost:8080/api/v1

# Swagger Docs: http://localhost:8080/api/v1/docs

```

## Technology Stack

| Layer         | Technology          |
| ------------- | ------------------- |
| Backend       | NestJS + TypeScript |
| ORM           | Drizzle ORM         |
| Database      | PostgreSQL          |
| Validation    | Zod + nestjs-zod    |
| Cache         | Redis               |
| Frontend      | React + Vite        |
| Data Fetching | TanStack Query      |
| Styling       | Tailwind CSS        |

## Project Structure

```

├── docker-compose.yml # Infrastructure orchestration
├── server/ # NestJS Backend
│ ├── src/
│ │ ├── database/ # Drizzle schema, migrations, seed
│ │ ├── stores/ # Store CRUD module
│ │ ├── products/ # Product CRUD + filtering module
│ │ ├── inventory/ # Aggregation stats module
│ │ └── common/ # Shared utilities
│ └── Dockerfile
└── web/ # React Frontend
├── src/
│ ├── api/ # Axios API client
│ ├── components/ # UI components
│ ├── hooks/ # TanStack Query hooks
│ ├── pages/ # Route pages
│ └── context/ # Toast notifications
└── Dockerfile

```

## API Endpoints

### Stores

| Method | Endpoint                   | Description              |
| ------ | -------------------------- | ------------------------ |
| GET    | `/api/v1/stores`           | List all stores          |
| GET    | `/api/v1/stores/:id`       | Get store by ID          |
| POST   | `/api/v1/stores`           | Create store             |
| PUT    | `/api/v1/stores/:id`       | Update store             |
| DELETE | `/api/v1/stores/:id`       | Delete store (cascades)  |
| GET    | `/api/v1/stores/:id/stats` | Get inventory statistics |

### Products

| Method | Endpoint                           | Description                      |
| ------ | ---------------------------------- | -------------------------------- |
| GET    | `/api/v1/stores/:storeId/products` | List with filtering & pagination |
| GET    | `/api/v1/products/:id`             | Get product                      |
| POST   | `/api/v1/stores/:storeId/products` | Create product                   |
| PUT    | `/api/v1/products/:id`             | Update product                   |
| DELETE | `/api/v1/products/:id`             | Delete product                   |
| PATCH  | `/api/v1/products/:id/stock`       | Update stock quantity            |

### Product Filtering

```

GET /api/v1/stores/:storeId/products
?page=1&limit=20 # Pagination
&category=Electronics # Filter by category
&minPrice=10&maxPrice=100 # Price range
&inStock=true # Only in-stock items
&lowStock=5 # Items with quantity <= N
&search=phone # Search name/description
&sortBy=price&sortOrder=asc

````

## Development

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Local Development (without Docker)

```bash
# Start PostgreSQL and Redis
docker compose up postgres redis -d

# Backend
cd server
npm install
npm run db:migrate       # Run migrations
npm run start:dev        # Start in watch mode

# Frontend (in another terminal)
cd web
npm install
npm run dev              # Start Vite dev server
````

### Running Tests

```bash
cd server
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:cov         # With coverage
```

## Design Decisions & Trade-offs

### 1. Drizzle ORM over Prisma/TypeORM

**Decision:** Use Drizzle ORM for database access.

**Rationale:**

- Lightweight with no code generation step
- SQL-like syntax provides predictable query behavior
- Excellent TypeScript inference from schema definitions
- Better control over query optimization

**Trade-off:** Poor migrations (no reverts).

### 2. Zod for Validation (Frontend & Backend)

**Decision:** Use Zod schemas with nestjs-zod for backend DTOs.

**Rationale:**

- TypeScript-first validation with inferred types
- Schemas can be shared between frontend and backend
- Better error messages compared to class-validator
- Used by many modern TypeScript projects (AI SDK, Drizzle, etc.)

**Trade-off:** Slightly different pattern from NestJS's default class-validator approach, but provides stronger type safety.

### 2. Deletes witn transactions

**Decision:** Products are deleted when a store is deleted.

**Rationale:**

- Showcases transaction management using custom decorators in NestJS.
- Reduces boilerplate code for manual transaction handling in services.
- Ensures atomicity: when the `@Transactional()` decorator is applied, all database operations within the method share a single transaction context, automatically rolling back on failure to maintain data integrity.

**Trade-off:** Could be done with foreign keys and ON DELETE CASCADE, but this way we have more control over the deletion process and can add additional logic if needed in the future.

### 3. Aggregation Statistics Module

**Decision:** Separate module for inventory statistics.

**Rationale:**

- Encapsulates complex aggregation logic
- Keeps Store and Product services focused on CRUD
- Easier to maintain and extend stats functionality

**Trade-off:** Slightly more overhead with additional service calls, but improves code organization. First pplan was to aggregate stats in the Store service, updateing amounts on every product change using transactions, but there was not enough time to implement it. It wold improve performance for stores with large product catalogs.

## Environment Variables

| Variable       | Default     | Description                  |
| -------------- | ----------- | ---------------------------- |
| `DATABASE_URL` | -           | PostgreSQL connection string |
| `REDIS_URL`    | -           | Redis connection string      |
| `NODE_ENV`     | development | Environment mode             |
| `PORT`         | 8080        | Backend server port          |

## Test Coverage

The backend test suite comprises 38 unit tests that verify business logic across services and controllers. The tests primarily focus on:

- **CRUD Operations**: Ensuring integrity for Store and Product lifecycles.
- **Filtering Logic**: Validating complex product queries (price ranges, categories, stock levels).
- **Statistics**: Correctness of inventory aggregation and calculations.
- **Transactional Integrity**: Testing custom decorators for cascade deletions.

Given the application's heavy reliance on declarative database interactions via Drizzle ORM, the tests are lightweight and focused on the service layer orchestration rather than low-level implementation details.

```bash


## Future Improvements

1. Aggregated stats in Store entity for faster access
2. Use redis locking for stock updates
3. Adding e2e tests
4. Creatin separate folder for DTOs and mappers to share between server and web
5. Run migrations automatically on server start
```
