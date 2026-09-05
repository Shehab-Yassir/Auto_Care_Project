import express from 'express';
import { getDatabase } from '../config/database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all jobs
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const { status, priority, page = 1, limit = 20 } = req.query;

    let query = `SELECT j.*, u.name as technicianName, d.name as driverName 
                 FROM jobs j
                 LEFT JOIN users u ON j.technicianId = u.id
                 LEFT JOIN users d ON j.driverId = d.id`;
    let params = [];

    // Filter based on role
    if (req.user.role === 'customer') {
      query += ' WHERE j.customerId = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'technician') {
      query += ' WHERE j.technicianId = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'driver') {
      query += ' WHERE j.driverId = ?';
      params.push(req.user.id);
    }

    // Apply filters
    if (status) {
      query += params.length ? ' AND j.status = ?' : ' WHERE j.status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND j.priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY j.createdAt DESC LIMIT ? OFFSET ?';
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    params.push(limitNum, (pageNum - 1) * limitNum);

    const jobs = await db.all(query, params);

    res.json({
      ok: true,
      data: jobs,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Get job by ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const job = await db.get(`SELECT j.*, u.name as technicianName, d.name as driverName 
                              FROM jobs j
                              LEFT JOIN users u ON j.technicianId = u.id
                              LEFT JOIN users d ON j.driverId = d.id
                              WHERE j.id = ?`, req.params.id);

    if (!job) {
      return res.status(404).json({
        ok: false,
        error: 'Job not found',
        status: 404,
      });
    }

    // Check permissions
    if (req.user.role === 'customer' && job.customerId !== req.user.id) {
      return res.status(403).json({
        ok: false,
        error: 'You do not have permission to view this job',
        status: 403,
      });
    }

    res.json({
      ok: true,
      data: job,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Create job (customer, manager, admin)
router.post('/', authMiddleware, requireRole('customer', 'manager', 'admin'), async (req, res, next) => {
  try {
    const { customerId, vehicleId, serviceType, description, priority = 'normal' } = req.body;

    if (!customerId || !vehicleId || !serviceType) {
      throw new ValidationError('customerId, vehicleId, and serviceType are required');
    }

    // Customers can only create jobs for themselves
    if (req.user.role === 'customer' && customerId !== req.user.id) {
      return res.status(403).json({
        ok: false,
        error: 'You can only create jobs for yourself',
        status: 403,
      });
    }

    const db = await getDatabase();
    const now = new Date().toISOString();
    const jobId = 'job-' + Math.random().toString(36).substr(2, 9);

    await db.run(
      `INSERT INTO jobs (id, customerId, vehicleId, serviceType, description, priority, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [jobId, customerId, vehicleId, serviceType, description, priority, now, now]
    );

    const job = await db.get(`SELECT j.*, u.name as technicianName, d.name as driverName 
                              FROM jobs j
                              LEFT JOIN users u ON j.technicianId = u.id
                              LEFT JOIN users d ON j.driverId = d.id
                              WHERE j.id = ?`, jobId);

    res.status(201).json({
      ok: true,
      data: job,
      status: 201,
    });
  } catch (error) {
    next(error);
  }
});

// Update job status (manager, admin, or assigned technician)
router.put('/:id/status', authMiddleware, async (req, res, next) => {
  try {
    const { status } = req.body;
    const jobId = req.params.id;

    const validStatuses = ['pending', 'assigned', 'in-progress', 'waiting-parts', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid status');
    }

    const db = await getDatabase();
    const job = await db.get('SELECT * FROM jobs WHERE id = ?', jobId);

    if (!job) {
      return res.status(404).json({
        ok: false,
        error: 'Job not found',
        status: 404,
      });
    }

    // Check permissions
    if (req.user.role === 'technician' && job.technicianId !== req.user.id) {
      return res.status(403).json({
        ok: false,
        error: 'You can only update jobs assigned to you',
        status: 403,
      });
    } else if (!['manager', 'admin'].includes(req.user.role) && req.user.role !== 'technician') {
      return res.status(403).json({
        ok: false,
        error: 'You do not have permission to update this job',
        status: 403,
      });
    }

    const now = new Date().toISOString();
    const completedAt = status === 'completed' ? now : null;

    await db.run(
      'UPDATE jobs SET status = ?, completedAt = ?, updatedAt = ? WHERE id = ?',
      [status, completedAt, now, jobId]
    );

    const updated = await db.get(`SELECT j.*, u.name as technicianName, d.name as driverName 
                                   FROM jobs j
                                   LEFT JOIN users u ON j.technicianId = u.id
                                   LEFT JOIN users d ON j.driverId = d.id
                                   WHERE j.id = ?`, jobId);

    res.json({
      ok: true,
      data: updated,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Assign technician (manager, admin)
router.put('/:id/assign-technician', authMiddleware, requireRole('manager', 'admin'), async (req, res, next) => {
  try {
    const { technicianId } = req.body;
    const jobId = req.params.id;

    if (!technicianId) {
      throw new ValidationError('technicianId is required');
    }

    const db = await getDatabase();
    const job = await db.get('SELECT * FROM jobs WHERE id = ?', jobId);

    if (!job) {
      return res.status(404).json({
        ok: false,
        error: 'Job not found',
        status: 404,
      });
    }

    const technician = await db.get('SELECT * FROM users WHERE id = ? AND role = ?', [technicianId, 'technician']);
    if (!technician) {
      return res.status(404).json({
        ok: false,
        error: 'Technician not found',
        status: 404,
      });
    }

    const now = new Date().toISOString();
    await db.run(
      'UPDATE jobs SET technicianId = ?, status = ?, updatedAt = ? WHERE id = ?',
      [technicianId, 'assigned', now, jobId]
    );

    const updated = await db.get(`SELECT j.*, u.name as technicianName, d.name as driverName 
                                   FROM jobs j
                                   LEFT JOIN users u ON j.technicianId = u.id
                                   LEFT JOIN users d ON j.driverId = d.id
                                   WHERE j.id = ?`, jobId);

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
