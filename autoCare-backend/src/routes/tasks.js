import express from 'express';
import { getDatabase } from '../config/database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all tasks
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const { status, type, page = 1, limit = 20 } = req.query;

    let query = `SELECT t.*, d.name as driverName
                 FROM tasks t
                 LEFT JOIN users d ON t.driverId = d.id`;
    let params = [];

    // Filter based on role
    if (req.user.role === 'customer') {
      query += ' WHERE t.customerId = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'driver') {
      query += ' WHERE t.driverId = ?';
      params.push(req.user.id);
    }

    if (status) {
      query += params.length ? ' AND t.status = ?' : ' WHERE t.status = ?';
      params.push(status);
    }
    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }

    query += ' ORDER BY t.scheduledTime DESC LIMIT ? OFFSET ?';
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    params.push(limitNum, (pageNum - 1) * limitNum);

    const tasks = await db.all(query, params);

    res.json({
      ok: true,
      data: tasks,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Get task by ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const task = await db.get(`SELECT t.*, d.name as driverName
                               FROM tasks t
                               LEFT JOIN users d ON t.driverId = d.id
                               WHERE t.id = ?`, req.params.id);

    if (!task) {
      return res.status(404).json({
        ok: false,
        error: 'Task not found',
        status: 404,
      });
    }

    // Check permissions
    if (req.user.role === 'customer' && task.customerId !== req.user.id) {
      return res.status(403).json({
        ok: false,
        error: 'You do not have permission to view this task',
        status: 403,
      });
    }

    res.json({
      ok: true,
      data: task,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Create task (manager, admin)
router.post('/', authMiddleware, requireRole('manager', 'admin'), async (req, res, next) => {
  try {
    const { jobId, customerId, vehicleId, type, scheduledTime } = req.body;

    if (!jobId || !customerId || !vehicleId || !type || !scheduledTime) {
      throw new ValidationError('jobId, customerId, vehicleId, type, and scheduledTime are required');
    }

    const validTypes = ['pickup', 'delivery'];
    if (!validTypes.includes(type)) {
      throw new ValidationError('Invalid task type');
    }

    const db = await getDatabase();
    const now = new Date().toISOString();
    const taskId = 'task-' + Math.random().toString(36).substr(2, 9);

    await db.run(
      `INSERT INTO tasks (id, jobId, customerId, vehicleId, type, scheduledTime, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [taskId, jobId, customerId, vehicleId, type, scheduledTime, now, now]
    );

    const task = await db.get(`SELECT t.*, d.name as driverName
                               FROM tasks t
                               LEFT JOIN users d ON t.driverId = d.id
                               WHERE t.id = ?`, taskId);

    res.status(201).json({
      ok: true,
      data: task,
      status: 201,
    });
  } catch (error) {
    next(error);
  }
});

// Update task status
router.put('/:id/status', authMiddleware, async (req, res, next) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;

    const validStatuses = ['pending', 'on-the-way', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid status');
    }

    const db = await getDatabase();
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', taskId);

    if (!task) {
      return res.status(404).json({
        ok: false,
        error: 'Task not found',
        status: 404,
      });
    }

    // Check permissions
    if (req.user.role === 'driver' && task.driverId !== req.user.id) {
      return res.status(403).json({
        ok: false,
        error: 'You can only update tasks assigned to you',
        status: 403,
      });
    } else if (!['manager', 'admin'].includes(req.user.role) && req.user.role !== 'driver') {
      return res.status(403).json({
        ok: false,
        error: 'You do not have permission to update this task',
        status: 403,
      });
    }

    const now = new Date().toISOString();
    const completedTime = status === 'completed' ? now : null;

    await db.run(
      'UPDATE tasks SET status = ?, completedTime = ?, updatedAt = ? WHERE id = ?',
      [status, completedTime, now, taskId]
    );

    const updated = await db.get(`SELECT t.*, d.name as driverName
                                  FROM tasks t
                                  LEFT JOIN users d ON t.driverId = d.id
                                  WHERE t.id = ?`, taskId);

    res.json({
      ok: true,
      data: updated,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Assign driver
router.put('/:id/assign-driver', authMiddleware, requireRole('manager', 'admin'), async (req, res, next) => {
  try {
    const { driverId } = req.body;
    const taskId = req.params.id;

    if (!driverId) {
      throw new ValidationError('driverId is required');
    }

    const db = await getDatabase();
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', taskId);

    if (!task) {
      return res.status(404).json({
        ok: false,
        error: 'Task not found',
        status: 404,
      });
    }

    const driver = await db.get('SELECT * FROM users WHERE id = ? AND role = ?', [driverId, 'driver']);
    if (!driver) {
      return res.status(404).json({
        ok: false,
        error: 'Driver not found',
        status: 404,
      });
    }

    const now = new Date().toISOString();
    await db.run(
      'UPDATE tasks SET driverId = ?, updatedAt = ? WHERE id = ?',
      [driverId, now, taskId]
    );

    const updated = await db.get(`SELECT t.*, d.name as driverName
                                  FROM tasks t
                                  LEFT JOIN users d ON t.driverId = d.id
                                  WHERE t.id = ?`, taskId);

    res.json({
      ok: true,
      data: updated,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
