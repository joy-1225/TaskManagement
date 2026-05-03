const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const formatTask = (task) => ({
  ...task,
  due_date: task.due_date ? task.due_date.toISOString().split('T')[0] : null,
  created_at: task.created_at.toISOString().replace('T', ' ').split('.')[0],
  updated_at: task.updated_at.toISOString().replace('T', ' ').split('.')[0],
});

// ─── POST /tasks ────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Buy groceries
 *               description:
 *                 type: string
 *                 example: Milk, Eggs, Bread
 *               category:
 *                 type: string
 *                 example: Personal
 *               due_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-10"
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, category, due_date } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        category,
        due_date: due_date ? new Date(due_date) : undefined,
      },
    });

    return res.status(201).json({ success: true, data: formatTask(task) });
  } catch (err) {
    next(err);
  }
};

// ─── GET /tasks ──────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks with optional filtering, sorting, and pagination
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed]
 *         description: Filter by task status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, due_date, title]
 *           default: created_at
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of tasks with pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskListResponse'
 */
const getAllTasks = async (req, res, next) => {
  try {
    const {
      status,
      category,
      sortBy = 'created_at',
      order = 'desc',
      page = '1',
      limit = '10',
    } = req.query;

    const allowedStatuses = ['pending', 'completed'];
    if (status && !allowedStatuses.includes(status)) {
      throw new ApiError(400, "Invalid status. Must be 'pending' or 'completed'.");
    }

    // Build dynamic where clause
    const where = {};
    if (status) where.status = status;
    if (category) where.category = { contains: category };

    // Whitelist sortable fields to prevent injection
    const allowedSortFields = ['created_at', 'due_date', 'title', 'status'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limitNum,
      }),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      data: tasks.map(formatTask),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /tasks/:id ───────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const getTaskById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id < 1 || id > 2147483647) {
      throw new ApiError(400, 'Invalid task ID.');
    }

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new ApiError(404, `Task with id ${id} not found.`);
    }

    return res.status(200).json({ success: true, data: formatTask(task) });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /tasks/:id ───────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update task details
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found
 */
const updateTask = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id < 1 || id > 2147483647) {
      throw new ApiError(400, 'Invalid task ID.');
    }

    const { title, description, category, due_date } = req.body;

    // Fetch existing task first
    const existingTask = await prisma.task.findUnique({ where: { id } });

    if (!existingTask) {
      throw new ApiError(404, `Task with id ${id} not found.`);
    }

    // Merge new values with existing ones
    const mergedData = {
      title: title !== undefined ? title : existingTask.title,
      description: description !== undefined ? description : existingTask.description,
      category: category !== undefined ? category : existingTask.category,
      due_date: due_date !== undefined ? new Date(due_date) : existingTask.due_date,
    };

    const task = await prisma.task.update({ where: { id }, data: mergedData });
    return res.status(200).json({ success: true, data: formatTask(task) });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /tasks/:id/complete ────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/tasks/{id}/complete:
 *   patch:
 *     summary: Mark a task as completed
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task marked as completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       400:
 *         description: Task is already completed
 *       404:
 *         description: Task not found
 */
const completeTask = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id < 1 || id > 2147483647) {
      throw new ApiError(400, 'Invalid task ID.');
    }

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new ApiError(404, `Task with id ${id} not found.`);
    }

    if (task.status === 'completed') {
      throw new ApiError(400, 'Task is already marked as completed.');
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { status: 'completed' },
    });

    return res.status(200).json({ success: true, data: formatTask(updated) });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /tasks/:id ────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Task not found
 */
const deleteTask = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id < 1 || id > 2147483647) {
      throw new ApiError(400, 'Invalid task ID.');
    }

    try {
      await prisma.task.delete({ where: { id } });
      return res.status(200).json({ success: true, message: 'Task deleted successfully.' });
    } catch (prismaErr) {
      if (prismaErr.code === 'P2025') {
        throw new ApiError(404, `Task with id ${id} not found.`);
      }
      throw prismaErr;
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { createTask, getAllTasks, getTaskById, updateTask, completeTask, deleteTask };
