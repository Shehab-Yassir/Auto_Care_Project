import express from 'express';
import { getDatabase } from '../config/database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all reports
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const { status, page = 1, limit = 20 } = req.query;

    let query = `SELECT r.*, u.name as technicianName
                 FROM repair_reports r
                 JOIN users u ON r.technicianId = u.id`;
    let params = [];

    if (req.user.role === 'technician') {
      query += ' WHERE r.technicianId = ?';
      params.push(req.user.id);
    }

    if (status) {
      query += params.length ? ' AND r.status = ?' : ' WHERE r.status = ?';
      params.push(status);
    }

    query += ' ORDER BY r.createdAt DESC LIMIT ? OFFSET ?';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    params.push(limitNum, (pageNum - 1) * limitNum);

    const reports = await db.all(query, params);

    res.json({
      ok: true,
      data: reports,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Get report by ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const report = await db.get(
      `SELECT r.*, u.name as technicianName
       FROM repair_reports r
       JOIN users u ON r.technicianId = u.id
       WHERE r.id = ?`,
      req.params.id
    );

    if (!report) {
      return res.status(404).json({
        ok: false,
        error: 'Report not found',
        status: 404,
      });
    }

    // Check permissions
    if (req.user.role === 'technician' && report.technicianId !== req.user.id) {
      return res.status(403).json({
        ok: false,
        error: 'You do not have permission to view this report',
        status: 403,
      });
    }

    res.json({
      ok: true,
      data: report,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Create report (technician only)
router.post('/', authMiddleware, requireRole('technician'), async (req, res, next) => {
  try {
    const { jobId, diagnosis, workPerformed } = req.body;

    if (!jobId || !diagnosis || !workPerformed) {
      throw new ValidationError('jobId, diagnosis, and workPerformed are required');
    }

    const db = await getDatabase();
    const now = new Date().toISOString();
    const reportId = 'report-' + Math.random().toString(36).substr(2, 9);

    await db.run(
      `INSERT INTO repair_reports (id, jobId, technicianId, diagnosis, workPerformed, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [reportId, jobId, req.user.id, diagnosis, workPerformed, now]
    );

    const report = await db.get(
      `SELECT r.*, u.name as technicianName
       FROM repair_reports r
       JOIN users u ON r.technicianId = u.id
       WHERE r.id = ?`,
      reportId
    );

    res.status(201).json({
      ok: true,
      data: report,
      status: 201,
    });
  } catch (error) {
    next(error);
  }
});

// Update report (technician can edit draft, manager/admin can approve)
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { diagnosis, workPerformed, status } = req.body;
    const reportId = req.params.id;

    const db = await getDatabase();
    const report = await db.get('SELECT * FROM repair_reports WHERE id = ?', reportId);

    if (!report) {
      return res.status(404).json({
        ok: false,
        error: 'Report not found',
        status: 404,
      });
    }

    // Technicians can only edit their own draft reports
    if (req.user.role === 'technician') {
      if (report.technicianId !== req.user.id || report.status !== 'draft') {
        return res.status(403).json({
          ok: false,
          error: 'You can only edit your own draft reports',
          status: 403,
        });
      }
    } else if (!['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: 'You do not have permission to update this report',
        status: 403,
      });
    }

    const now = new Date().toISOString();
    const submittedAt = status === 'submitted' ? now : report.submittedAt;

    await db.run(
      `UPDATE repair_reports SET diagnosis = ?, workPerformed = ?, status = ?, submittedAt = ? WHERE id = ?`,
      [diagnosis || report.diagnosis, workPerformed || report.workPerformed, status || report.status, submittedAt, reportId]
    );

    const updated = await db.get(
      `SELECT r.*, u.name as technicianName
       FROM repair_reports r
       JOIN users u ON r.technicianId = u.id
       WHERE r.id = ?`,
      reportId
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

// Approve report (manager, admin)
router.put('/:id/approve', authMiddleware, requireRole('manager', 'admin'), async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const db = await getDatabase();

    const report = await db.get('SELECT * FROM repair_reports WHERE id = ?', reportId);
    if (!report) {
      return res.status(404).json({
        ok: false,
        error: 'Report not found',
        status: 404,
      });
    }

    const now = new Date().toISOString();
    await db.run(
      `UPDATE repair_reports SET status = ?, approvedAt = ?, approvedBy = ? WHERE id = ?`,
      ['approved', now, req.user.id, reportId]
    );

    const updated = await db.get(
      `SELECT r.*, u.name as technicianName
       FROM repair_reports r
       JOIN users u ON r.technicianId = u.id
       WHERE r.id = ?`,
      reportId
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
