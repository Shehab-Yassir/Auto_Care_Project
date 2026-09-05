import express from 'express';
import { getDatabase } from '../config/database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all part requests
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const { status, page = 1, limit = 20 } = req.query;

    let query = `SELECT pr.*, u.name as technicianName
                 FROM part_requests pr
                 JOIN users u ON pr.technicianId = u.id`;
    let params = [];

    if (req.user.role === 'technician') {
      query += ' WHERE pr.technicianId = ?';
      params.push(req.user.id);
    }

    if (status) {
      query += params.length ? ' AND pr.status = ?' : ' WHERE pr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY pr.requestedAt DESC LIMIT ? OFFSET ?';
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    params.push(limitNum, (pageNum - 1) * limitNum);

    const requests = await db.all(query, params);

    res.json({
      ok: true,
      data: requests,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Get part request by ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const request = await db.get(
      `SELECT pr.*, u.name as technicianName
       FROM part_requests pr
       JOIN users u ON pr.technicianId = u.id
       WHERE pr.id = ?`,
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        ok: false,
        error: 'Part request not found',
        status: 404,
      });
    }

    res.json({
      ok: true,
      data: request,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Create part request (technician)
router.post('/', authMiddleware, requireRole('technician'), async (req, res, next) => {
  try {
    const { jobId, partName, quantity, urgency = 'normal' } = req.body;

    if (!jobId || !partName || !quantity) {
      throw new ValidationError('jobId, partName, and quantity are required');
    }

    if (quantity < 1) {
      throw new ValidationError('quantity must be at least 1');
    }

    const validUrgencies = ['low', 'normal', 'high', 'urgent'];
    if (!validUrgencies.includes(urgency)) {
      throw new ValidationError('Invalid urgency level');
    }

    const db = await getDatabase();
    const now = new Date().toISOString();
    const requestId = 'part-req-' + Math.random().toString(36).substr(2, 9);

    await db.run(
      `INSERT INTO part_requests (id, jobId, technicianId, partName, quantity, urgency, requestedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [requestId, jobId, req.user.id, partName, quantity, urgency, now]
    );

    const request = await db.get(
      `SELECT pr.*, u.name as technicianName
       FROM part_requests pr
       JOIN users u ON pr.technicianId = u.id
       WHERE pr.id = ?`,
      requestId
    );

    res.status(201).json({
      ok: true,
      data: request,
      status: 201,
    });
  } catch (error) {
    next(error);
  }
});

// Approve/reject part request (manager, admin)
router.put('/:id/approve', authMiddleware, requireRole('manager', 'admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
      throw new ValidationError('Status must be approved or rejected');
    }

    const db = await getDatabase();
    const request = await db.get('SELECT * FROM part_requests WHERE id = ?', requestId);

    if (!request) {
      return res.status(404).json({
        ok: false,
        error: 'Part request not found',
        status: 404,
      });
    }

    const now = new Date().toISOString();
    await db.run(
      `UPDATE part_requests SET status = ?, approvedAt = ?, approvedBy = ? WHERE id = ?`,
      [status, now, req.user.id, requestId]
    );

    const updated = await db.get(
      `SELECT pr.*, u.name as technicianName
       FROM part_requests pr
       JOIN users u ON pr.technicianId = u.id
       WHERE pr.id = ?`,
      requestId
    );

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
