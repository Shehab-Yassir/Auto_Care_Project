import express from 'express';
import { getDatabase } from '../config/database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get audit logs (admin only)
router.get('/logs', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const db = await getDatabase();
    const { action, userId, page = 1, limit = 50 } = req.query;

    let query = `SELECT l.*, u.name as userName
                 FROM audit_logs l
                 LEFT JOIN users u ON l.userId = u.id`;
    let params = [];

    const conditions = [];
    if (action) {
      conditions.push('l.action = ?');
      params.push(action);
    }
    if (userId) {
      conditions.push('l.userId = ?');
      params.push(userId);
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY l.createdAt DESC LIMIT ? OFFSET ?';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    params.push(limitNum, (pageNum - 1) * limitNum);

    const logs = await db.all(query, params);

    res.json({
      ok: true,
      data: logs,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Get system health (admin only)
router.get('/health', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const db = await getDatabase();

    // Get statistics
    const stats = {
      users: await db.all('SELECT COUNT(*) as count, role FROM users GROUP BY role'),
      jobs: await db.all('SELECT COUNT(*) as count, status FROM jobs GROUP BY status'),
      tasks: await db.all('SELECT COUNT(*) as count, status FROM tasks GROUP BY status'),
      vehicles: await db.get('SELECT COUNT(*) as count FROM vehicles'),
      inventory: await db.get('SELECT COUNT(*) as count FROM inventory'),
      lowStockItems: await db.get('SELECT COUNT(*) as count FROM inventory WHERE quantity <= minQuantity'),
    };

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        status: 'operational',
      },
      services: {
        auth: 'operational',
        jobs: 'operational',
        inventory: 'operational',
      },
      stats,
    };

    res.json({
      ok: true,
      data: health,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Get dashboard statistics
router.get('/dashboard', authMiddleware, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const userId = req.user.id;
    const role = req.user.role;

    let stats = {};

    if (role === 'customer') {
      const jobs = await db.all('SELECT * FROM jobs WHERE customerId = ?', userId);
      const activeJobs = jobs.filter((j) => j.status !== 'completed');

      stats = {
        totalJobs: jobs.length,
        activeJobs: activeJobs.length,
        completedJobs: jobs.length - activeJobs.length,
        vehicles: await db.get('SELECT COUNT(*) as count FROM vehicles WHERE userId = ?', userId),
        recentJobs: jobs.slice(0, 5),
      };
    } else if (role === 'technician') {
      const jobs = await db.all('SELECT * FROM jobs WHERE technicianId = ?', userId);
      const inProgressJobs = jobs.filter((j) => j.status === 'in-progress');

      stats = {
        assignedJobs: jobs.length,
        inProgressJobs: inProgressJobs.length,
        completedJobs: jobs.filter((j) => j.status === 'completed').length,
        pendingReports: await db.get(
          'SELECT COUNT(*) as count FROM repair_reports WHERE technicianId = ? AND status = ?',
          [userId, 'draft']
        ),
        recentJobs: jobs.slice(0, 5),
      };
    } else if (role === 'driver') {
      const tasks = await db.all('SELECT * FROM tasks WHERE driverId = ?', userId);
      const pendingTasks = tasks.filter((t) => t.status !== 'completed');

      stats = {
        totalTasks: tasks.length,
        pendingTasks: pendingTasks.length,
        completedTasks: tasks.filter((t) => t.status === 'completed').length,
        recentTasks: tasks.slice(0, 5),
      };
    } else if (role === 'manager') {
      const jobs = await db.all('SELECT * FROM jobs');
      const pendingJobs = jobs.filter((j) => j.status === 'pending');
      const waitingParts = jobs.filter((j) => j.status === 'waiting-parts');

      stats = {
        totalJobs: jobs.length,
        pendingJobs: pendingJobs.length,
        inProgressJobs: jobs.filter((j) => j.status === 'in-progress').length,
        waitingPartsJobs: waitingParts.length,
        lowStockItems: await db.get(
          'SELECT COUNT(*) as count FROM inventory WHERE quantity <= minQuantity'
        ),
      };
    } else if (role === 'admin') {
      const userStats = await db.all(
        'SELECT role, COUNT(*) as count FROM users GROUP BY role'
      );
      const jobStats = await db.all('SELECT status, COUNT(*) as count FROM jobs GROUP BY status');

      stats = {
        totalUsers: await db.get('SELECT COUNT(*) as count FROM users'),
        usersByRole: userStats,
        totalJobs: await db.get('SELECT COUNT(*) as count FROM jobs'),
        jobsByStatus: jobStats,
        totalInventory: await db.get('SELECT COUNT(*) as count FROM inventory'),
        lowStockItems: await db.get(
          'SELECT COUNT(*) as count FROM inventory WHERE quantity <= minQuantity'
        ),
        recentLogs: await db.all(
          'SELECT * FROM audit_logs ORDER BY createdAt DESC LIMIT 10'
        ),
      };
    }

    res.json({
      ok: true,
      data: stats,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
