import express from 'express';
import { getDatabase } from '../config/database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const db = await getDatabase();
    const users = await db.all(
      'SELECT id, name, email, role, status, phone, address, createdAt, lastLogin FROM users ORDER BY createdAt DESC'
    );

    res.json({
      ok: true,
      data: users,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const user = await db.get(
      'SELECT id, name, email, role, status, phone, address, createdAt FROM users WHERE id = ?',
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        ok: false,
        error: 'User not found',
        status: 404,
      });
    }

    // Users can only see their own profile unless they're admin
    if (req.user.id !== user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        ok: false,
        error: 'You do not have permission to view this user',
        status: 403,
      });
    }

    res.json({
      ok: true,
      data: user,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.params.id;

    // Users can only update their own profile unless they're admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        ok: false,
        error: 'You do not have permission to update this user',
        status: 403,
      });
    }

    if (name && name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters');
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    const result = await db.run(
      'UPDATE users SET name = ?, phone = ?, address = ?, updatedAt = ? WHERE id = ?',
      [name || undefined, phone || undefined, address || undefined, now, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        ok: false,
        error: 'User not found',
        status: 404,
      });
    }

    const updatedUser = await db.get('SELECT id, name, email, role, status FROM users WHERE id = ?', userId);

    res.json({
      ok: true,
      data: updatedUser,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Suspend/activate user (admin only)
router.put('/:id/status', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const userId = req.params.id;

    if (!['active', 'suspended'].includes(status)) {
      throw new ValidationError('Invalid status');
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    const result = await db.run(
      'UPDATE users SET status = ?, updatedAt = ? WHERE id = ?',
      [status, now, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        ok: false,
        error: 'User not found',
        status: 404,
      });
    }

    // Log audit
    await db.run(
      `INSERT INTO audit_logs (id, userId, action, resource, resourceId, changes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['log-' + Math.random().toString(36).substr(2, 9), req.user.id, 'UPDATE_STATUS', 'user', userId, JSON.stringify({ status }), now]
    );

    const updatedUser = await db.get('SELECT id, name, email, role, status FROM users WHERE id = ?', userId);

    res.json({
      ok: true,
      data: updatedUser,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Get users by role
router.get('/role/:role', authMiddleware, async (req, res, next) => {
  try {
    const { role } = req.params;
    const validRoles = ['customer', 'manager', 'technician', 'driver', 'admin'];

    if (!validRoles.includes(role)) {
      throw new ValidationError('Invalid role');
    }

    const db = await getDatabase();
    const users = await db.all(
      'SELECT id, name, email, role, status, phone FROM users WHERE role = ? ORDER BY name',
      role
    );

    res.json({
      ok: true,
      data: users,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
