const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

// Clean up tasks table before all tests run
beforeAll(async () => {
  await prisma.task.deleteMany({});
});

// Disconnect Prisma after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// ─── Shared state ──────────────────────────────────────────────────────────────
let createdTaskId;
let completedTaskId;

// ─── POST /tasks ──────────────────────────────────────────────────────────────
describe('POST /api/v1/tasks', () => {
  it('should create a task with valid data', async () => {
    const res = await request(app).post('/api/v1/tasks').send({
      title: 'Buy groceries',
      description: 'Milk, Eggs, Bread',
      category: 'Personal',
      due_date: '2026-05-10',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.title).toBe('Buy groceries');
    expect(res.body.data.status).toBe('pending');

    createdTaskId = res.body.data.id;
  });

  it('should return 400 if title is missing', async () => {
    const res = await request(app).post('/api/v1/tasks').send({
      description: 'No title here',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed.');
  });

  it('should return 400 if title is empty string', async () => {
    const res = await request(app).post('/api/v1/tasks').send({
      title: '',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed.');
  });
});

// ─── GET /tasks ───────────────────────────────────────────────────────────────
describe('GET /api/v1/tasks', () => {
  it('should return a list of tasks with pagination metadata', async () => {
    const res = await request(app).get('/api/v1/tasks');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
    expect(res.body.pagination).toHaveProperty('totalPages');
  });

  it('should filter tasks by status=pending', async () => {
    const res = await request(app).get('/api/v1/tasks?status=pending');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach((task) => {
      expect(task.status).toBe('pending');
    });
  });
});

// ─── GET /tasks/:id ───────────────────────────────────────────────────────────
describe('GET /api/v1/tasks/:id', () => {
  it('should return a single task by ID', async () => {
    const res = await request(app).get(`/api/v1/tasks/${createdTaskId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdTaskId);
  });

  it('should return 404 for a non-existent task ID', async () => {
    const res = await request(app).get('/api/v1/tasks/999999');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /tasks/:id ───────────────────────────────────────────────────────────
describe('PUT /api/v1/tasks/:id', () => {
  it('should update task details', async () => {
    const res = await request(app).put(`/api/v1/tasks/${createdTaskId}`).send({
      title: 'Buy groceries (updated)',
      category: 'Errands',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Buy groceries (updated)');
    expect(res.body.data.category).toBe('Errands');
  });

  it('should return 400 if title is updated to an empty string', async () => {
    const res = await request(app).put(`/api/v1/tasks/${createdTaskId}`).send({
      title: '',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── PATCH /tasks/:id/complete ────────────────────────────────────────────────
describe('PATCH /api/v1/tasks/:id/complete', () => {
  it('should mark a pending task as completed', async () => {
    const res = await request(app).patch(`/api/v1/tasks/${createdTaskId}/complete`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('completed');

    completedTaskId = createdTaskId;
  });

  it('should return 400 if task is already completed', async () => {
    const res = await request(app).patch(`/api/v1/tasks/${completedTaskId}/complete`);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Task is already marked as completed.');
  });
});

// ─── DELETE /tasks/:id ────────────────────────────────────────────────────────
describe('DELETE /api/v1/tasks/:id', () => {
  it('should delete an existing task', async () => {
    const res = await request(app).delete(`/api/v1/tasks/${createdTaskId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Task deleted successfully.');
  });

  it('should return 404 when deleting a non-existent task', async () => {
    const res = await request(app).delete('/api/v1/tasks/999999');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
