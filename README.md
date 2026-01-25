# Inventory Management System

A full-stack inventory management application with Store and Product resources, featuring filtering, pagination, aggregation statistics, and Docker deployment.

## Quick Start

```bash
# Start all services with Docker
docker compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080/api/v1
```

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Backend | NestJS + TypeScript | 10.4.x |
| ORM | Drizzle ORM | 0.33.x |
| Database | PostgreSQL | 16 |
| Validation | Zod + nestjs-zod | 3.x |
| Cache | Redis | 7 |
| Frontend | React + Vite | 19.x / 7.x |
| Data Fetching | TanStack Query | 5.x |
| Styling | Tailwind CSS | 4.x |

## Project Structure

```
├── docker-compose.yml      # Infrastructure orchestration
├── server/                 # NestJS Backend
│   ├── src/
│   │   ├── database/       # Drizzle schema, migrations, seed
│   │   ├── stores/         # Store CRUD module
│   │   ├── products/       # Product CRUD + filtering module
│   │   ├── inventory/      # Aggregation stats module
│   │   └── common/         # Shared utilities
│   └── Dockerfile
└── web/                    # React Frontend
    ├── src/
    │   ├── api/            # Axios API client
    │   ├── components/     # UI components
    │   ├── hooks/          # TanStack Query hooks
    │   ├── pages/          # Route pages
    │   └── context/        # Toast notifications
    └── Dockerfile
```

## API Endpoints

### Stores
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/stores` | List all stores |
| GET | `/api/v1/stores/:id` | Get store by ID |
| POST | `/api/v1/stores` | Create store |
| PUT | `/api/v1/stores/:id` | Update store |
| DELETE | `/api/v1/stores/:id` | Delete store (cascades) |
| GET | `/api/v1/stores/:id/stats` | Get inventory statistics |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/stores/:storeId/products` | List with filtering & pagination |
| GET | `/api/v1/products/:id` | Get product |
| POST | `/api/v1/stores/:storeId/products` | Create product |
| PUT | `/api/v1/products/:id` | Update product |
| DELETE | `/api/v1/products/:id` | Delete product |
| PATCH | `/api/v1/products/:id/stock` | Update stock quantity |

### Product Filtering

```
GET /api/v1/stores/:storeId/products
  ?page=1&limit=20           # Pagination
  &category=Electronics      # Filter by category
  &minPrice=10&maxPrice=100  # Price range
  &inStock=true              # Only in-stock items
  &lowStock=5                # Items with quantity <= N
  &search=phone              # Search name/description
  &sortBy=price&sortOrder=asc
```

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
npm run db:push          # Push schema to database
npm run start:dev        # Start in watch mode

# Frontend (in another terminal)
cd web
npm install
npm run dev              # Start Vite dev server
```

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

**Trade-off:** Less abstraction means writing more explicit queries, but provides better performance visibility.

### 2. Zod for Validation (Frontend & Backend)

**Decision:** Use Zod schemas with nestjs-zod for backend DTOs.

**Rationale:**
- TypeScript-first validation with inferred types
- Schemas can be shared between frontend and backend
- Better error messages compared to class-validator
- Composable schema definitions

**Trade-off:** Slightly different pattern from NestJS's default class-validator approach, but provides stronger type safety.

### 3. Nested Routes for Products

**Decision:** Products are nested under stores (`/stores/:storeId/products`).

**Rationale:**
- Reflects the domain relationship (products belong to stores)
- Simplifies authorization and scoping
- Clear API hierarchy

**Trade-off:** Requires store context for product listing, but standalone endpoints exist for individual product operations.

### 4. Decimal Type for Prices

**Decision:** Use `decimal(10, 2)` for price storage.

**Rationale:**
- Avoids floating-point precision issues
- Industry standard for monetary values
- Supports accurate aggregation calculations

**Trade-off:** Requires string-to-number conversion at API boundaries, but prevents currency calculation errors.

### 5. Cascade Deletes

**Decision:** Products are cascade deleted when a store is deleted.

**Rationale:**
- Maintains referential integrity automatically
- Simplifies store deletion logic
- Matches typical business requirement

**Trade-off:** Deleting a store is a destructive operation. In production, consider soft deletes or confirmation workflows.

### 6. Client-Side Filtering State

**Decision:** Filter state is managed in React component state, not URL params.

**Rationale:**
- Simpler implementation for MVP
- Debounced search prevents excessive API calls
- Filter changes trigger immediate refetch

**Trade-off:** Filters are not shareable via URL. For production, consider syncing filters to URL search params.

### 7. Inline Stock Editing

**Decision:** Stock quantity can be edited inline in the product table.

**Rationale:**
- Common operation for inventory management
- Reduces friction for quick updates
- Dedicated PATCH endpoint for atomic operation

**Trade-off:** Less validation context than full edit form, but optimized for speed.

### 8. No Authentication

**Decision:** No authentication/authorization implemented.

**Rationale:**
- Reduces scope for MVP demonstration
- Focuses on core inventory features
- Redis available for future session management

**Trade-off:** Not production-ready without adding auth layer.

## Database Schema

### Stores Table
```sql
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  sku TEXT UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Seed Data

On startup, the application seeds the database with sample data if empty:
- 3 stores (Electronics, Clothing, Grocery)
- 95 products across various categories
- Mix of stock levels (normal, low, out-of-stock) for testing

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | - | PostgreSQL connection string |
| `REDIS_URL` | - | Redis connection string |
| `NODE_ENV` | development | Environment mode |
| `PORT` | 8080 | Backend server port |

## Test Coverage

The backend includes 38 unit tests covering:
- **StoresService:** CRUD operations, error handling (12 tests)
- **ProductsService:** CRUD, filtering, pagination (16 tests)
- **InventoryService:** Aggregation stats, edge cases (10 tests)

## Future Improvements

1. **Authentication:** Add JWT-based auth with role-based access
2. **URL-synced filters:** Persist filter state in URL params
3. **Soft deletes:** Archive instead of permanently delete
4. **Audit logging:** Track changes to inventory
5. **Bulk operations:** Import/export products via CSV
6. **Redis caching:** Cache frequently accessed store stats
7. **Pagination metadata:** Add cursor-based pagination option
