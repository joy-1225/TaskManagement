# Task Management REST API

A **production-grade RESTful Task Management API** built with Node.js, Express.js, Prisma, and MySQL.
Built for the Chaintech on-campus internship drive at LJ University.

**Author:** Joy Patel

---

## Features

- ✅ Full **CRUD** operations on tasks
- ✅ **Zod** schema validation with structured error responses
- ✅ **Filtering** by `status` and `category`
- ✅ **Sorting** by `created_at`, `due_date`, or `title` (asc/desc)
- ✅ **Pagination** via `page` and `limit` query params
- ✅ Bonus fields: `due_date` and `category`
- ✅ `PATCH /tasks/:id/complete` — rejects already-completed tasks with `400`
- ✅ **Prisma ORM** — type-safe queries, trackable migrations
- ✅ **Global error handler** + custom `ApiError` class
- ✅ **Swagger UI** at `/api-docs` — interactive API docs
- ✅ **Jest + Supertest** — full API test coverage (13 test cases)
- ✅ **Docker + docker-compose** — one-command setup
- ✅ **GitHub Actions CI** — auto-runs tests on every push to `main`
- ✅ Health check endpoint at `/health`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v20 LTS |
| Framework | Express.js |
| Database | MySQL 8.0 |
| ORM | Prisma |
| Validation | Zod |
| Testing | Jest + Supertest |
| API Docs | Swagger (swagger-ui-express + swagger-jsdoc) |
| Environment | dotenv |
| Dev Tools | Nodemon |
| Containerization | Docker + docker-compose |
| CI/CD | GitHub Actions |

---

## Prerequisites

- Node.js v20+
- MySQL 8.0 (or Docker)
- Git

---

## Installation (Standard)

```bash
# 1. Clone the repo
git clone https://github.com/joy-1225/chaintech-task-api.git
cd chaintech-task-api

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your DATABASE_URL

# 4. Run the first migration (creates the tasks table)
npx prisma migrate dev --name init

# 5. Start the development server
npm run dev
```

---

## Installation (Docker — one command)

```bash
docker-compose up --build
```

This starts both the MySQL container and the API server. No local MySQL installation needed.

---

## Environment Variables (.env.example)

Create a `.env` file in the root directory. It should look like this:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/taskdb"
PORT=3000
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

---

## API Endpoints

### Base URL: `http://localhost:3000/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/tasks` | Create a new task |
| `GET` | `/tasks` | Get all tasks (filtering, sorting, pagination) |
| `GET` | `/tasks/:id` | Get a single task by ID |
| `PUT` | `/tasks/:id` | Update task details |
| `PATCH` | `/tasks/:id/complete` | Mark a task as completed |
| `DELETE` | `/tasks/:id` | Delete a task |

### Query Parameters for `GET /tasks`

| Param | Type | Example | Description |
|---|---|---|---|
| `status` | string | `pending` / `completed` | Filter by status |
| `category` | string | `Work` | Filter by category |
| `sortBy` | string | `due_date` / `created_at` | Sort field |
| `order` | string | `asc` / `desc` | Sort direction |
| `page` | number | `1` | Page number (default: 1) |
| `limit` | number | `10` | Items per page (default: 10) |

**Example:**
```
GET /api/v1/tasks?status=pending&category=Work&sortBy=due_date&order=asc&page=1&limit=5
```

---

## API Documentation

Interactive Swagger UI is available at:

```
http://localhost:3000/api-docs
```

Raw OpenAPI JSON spec:
```
http://localhost:3000/api-docs.json
```

---

## Running Tests

```bash
npm test
```

Runs 13 test cases covering all endpoints including edge cases (missing title, already-completed task, non-existent IDs).

> **Note:** Ensure your `DATABASE_URL` in `.env` points to a running MySQL instance before running tests.

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `npm start` | `node server.js` | Start production server |
| `npm run dev` | `nodemon server.js` | Start dev server with hot reload |
| `npm test` | `jest --forceExit --detectOpenHandles` | Run all tests |
| `npm run migrate` | `prisma migrate dev` | Run a new DB migration |
| `npm run studio` | `prisma studio` | Open Prisma Studio (DB GUI) |

---

## Project Structure

```
chaintech-task-api/
├── prisma/
│   └── schema.prisma            # Prisma schema — Task model + Status enum
├── src/
│   ├── config/
│   │   └── prisma.js            # Prisma Client singleton
│   ├── controllers/
│   │   └── taskController.js    # Request handlers (with Swagger JSDoc)
│   ├── routes/
│   │   └── taskRoutes.js        # Express router + Swagger component schemas
│   ├── middlewares/
│   │   ├── validate.js          # Zod validation middleware factory
│   │   └── errorHandler.js      # Global error handler
│   ├── validators/
│   │   └── taskValidator.js     # Zod schemas for create/update
│   ├── utils/
│   │   └── ApiError.js          # Custom error class with HTTP status code
│   └── app.js                   # Express app (middlewares, routes, Swagger)
├── tests/
│   └── task.test.js             # Jest + Supertest — 13 test cases
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI pipeline
├── .env.example                 # Environment variable template
├── .gitignore
├── Dockerfile                   # Multi-stage production Docker build
├── docker-compose.yml           # App + MySQL services
├── server.js                    # Entry point — DB connect → HTTP listen
└── package.json
```

---

## Architecture Decisions

- **MySQL** — Fixed relational schema with a well-defined `tasks` table; ideal for structured task data with status transitions.
- **Prisma** — Auto-generates a fully type-safe client from `schema.prisma`. Migrations are version-controlled. The schema file is the single source of truth for the database.
- **Zod** — Schema-based, type-safe validation at the boundary layer. Produces structured, field-level error messages rather than opaque 500s.
- **Global Error Handler** — All controllers delegate errors via `next(err)`, ensuring a single consistent JSON error format across the entire API.
- **Docker multi-stage build** — Builder stage generates the Prisma client; production stage copies only the compiled artifacts, keeping the final image lean.
