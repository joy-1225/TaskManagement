# Task Management API

![CI](https://github.com/joy-1225/TaskManagement/actions/workflows/ci.yml/badge.svg)

A production-grade RESTful Task Management API built with Node.js, Express, Prisma, and MySQL. It allows users to seamlessly create, read, update, complete, and delete tasks with comprehensive input validation, dynamic sorting, filtering, and pagination capabilities.

## Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Runtime | Node.js | Execution environment |
| Web Framework | Express | Routing and HTTP server |
| Database | MySQL | Relational data storage |
| ORM | Prisma | Type-safe database queries and migrations |
| Validation | Zod | Request body schema validation |
| Documentation | Swagger | Interactive API documentation (`swagger-jsdoc`, `swagger-ui-express`) |
| Environment | dotenv | Managing environment variables |
| Testing | Jest & Supertest | Unit and integration testing |
| Development | Nodemon | Hot-reloading development server |

## Features

- Full CRUD operations (Create, Read, Update, Delete) on tasks.
- Support for bonus task fields: `due_date` and `category`.
- Pagination implemented natively via `page` and `limit` query parameters.
- Robust filtering of tasks by `status` and `category`.
- Dynamic sorting by `created_at`, `due_date`, or `title` in `asc` or `desc` order.
- Dedicated `PATCH /api/v1/tasks/:id/complete` endpoint to securely mark tasks as completed.
- Strict request body validation producing precise, developer-friendly error messages using Zod.
- Centralized global error handling ensuring consistent JSON error responses across the entire API.
- Fully interactive API documentation served automatically via Swagger UI.
- Containerized development and deployment pipeline using Docker and Docker Compose.
- Automated CI/CD testing pipeline configured via GitHub Actions.
- Comprehensive integration test suite built with Jest and Supertest.

## Project Structure

```text
chaintech-task-api/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI pipeline configuration
├── prisma/
│   ├── migrations/            # Auto-generated database migration files
│   └── schema.prisma          # Database schema and model definitions
├── src/
│   ├── config/
│   │   └── prisma.js          # Prisma Client initialization
│   ├── controllers/
│   │   └── taskController.js  # Core logic and database interactions for tasks
│   ├── middlewares/
│   │   ├── errorHandler.js    # Global error handling middleware
│   │   └── validate.js        # Zod validation middleware factory
│   ├── routes/
│   │   └── taskRoutes.js      # Express router and Swagger schema definitions
│   ├── utils/
│   │   └── ApiError.js        # Custom error class for standardizing HTTP errors
│   ├── validators/
│   │   └── taskValidator.js   # Zod schemas for task creation and updates
│   └── app.js                 # Express application setup
├── tests/
│   └── task.test.js           # Integration tests using Jest and Supertest
├── .env.example               # Template for environment variables
├── .gitignore                 # Files and folders to ignore in Git
├── docker-compose.yml         # Docker Compose configuration for app and DB
├── Dockerfile                 # Multi-stage Docker build instructions
├── package-lock.json          # Dependency lockfile
├── package.json               # Project metadata and npm scripts
└── server.js                  # Application entry point
```

## Prerequisites

- Node.js v20+
- Docker Desktop (for MySQL)
- Git

## Getting Started

**Step 1:** Clone the repo
```bash
git clone https://github.com/joy-1225/TaskManagement.git
cd TaskManagement
```

**Step 2:** Install dependencies
```bash
npm install
```

**Step 3:** Copy `.env.example` to `.env` and fill in values
```bash
cp .env.example .env
```

**Step 4:** Start MySQL with Docker
```bash
docker-compose up -d db
```

**Step 5:** Run migration
```bash
npx prisma migrate dev --name init
```

**Step 6:** Start server
```bash
npm run dev
```

## Environment Variables

| Variable | Description | Example Value |
| --- | --- | --- |
| `DATABASE_URL` | MySQL connection string | `mysql://root:YOUR_PASSWORD@localhost:3306/taskdb` |
| `PORT` | The port the Express server runs on | `3000` |
| `NODE_ENV` | Application environment | `development` |

## API Documentation

Interactive Swagger documentation is available at `http://localhost:3000/api-docs` when the server is running.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/tasks` | Create a new task |
| `GET` | `/api/v1/tasks` | Get all tasks with optional filtering, sorting, and pagination |
| `GET` | `/api/v1/tasks/:id` | Get a single task by ID |
| `PUT` | `/api/v1/tasks/:id` | Update task details |
| `PATCH` | `/api/v1/tasks/:id/complete` | Mark a task as completed |
| `DELETE` | `/api/v1/tasks/:id` | Delete a task |

## Running Tests

```bash
npm test
```
Runs the Jest test suite covering all API endpoints, including valid operations, missing required fields, invalid data submissions, and not-found entity scenarios.

## Docker

You can run the entire application stack using Docker Compose:

```bash
docker-compose up --build -d
```
The compose file sets up two services: a MySQL 8.0 database container and the Node.js API container. It automatically links the database to the API via an internal Docker network, fully containerizing both the application and its dependencies.

## Architecture Decisions

- **Node.js + Express:** Provides a fast, unopinionated, and highly scalable foundation for building RESTful APIs using JavaScript.
- **MySQL:** Selected for its robust relational data model, ensuring structured storage, data integrity, and reliable performance for predictable task records.
- **Prisma:** Used as the ORM to provide full type safety, a clear schema-first database design, and automated version-controlled migrations.
- **Zod:** Implemented at the API boundary to guarantee strict request validation, producing clean error messages and preventing malformed data from reaching the controllers.
- **Swagger:** Integrates living, interactive API documentation directly into the project, offering a professional interface for developers to explore and test endpoints without external HTTP clients.
