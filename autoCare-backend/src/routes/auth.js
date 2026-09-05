import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { getDatabase } from '../config/database.js';
import { ValidationError } from '../middleware/errorHandler.js';
import { authMiddleware } from '../middleware/auth.js';
import validator from 'validator';

const router = express.Router();

function generateId() {
  return 'user-' + Math.random().toString(36).substr(2, 9);
}

// Validation helpers
function validateEmail(email) {
  return validator.isEmail(email);
}

function validatePassword(password) {
  return password && password.length >= 6;
}

function validateName(name) {
  return name && name.trim().length >= 2;
}

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, role = 'customer' } = req.body;

    // Validation
    if (!validateName(name)) {
      throw new ValidationError('Name must be at least 2 characters');
    }
    if (!validateEmail(email)) {
      throw new ValidationError('Please enter a valid email address');
    }
    if (!validatePassword(password)) {
      throw new ValidationError('Password must be at least 6 characters');
    }
    if (password !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }

    const validRoles = ['customer', 'manager', 'technician', 'driver', 'admin'];
    if (!validRoles.includes(role)) {
      throw new ValidationError('Invalid role selected');
    }

    const db = await getDatabase();

    // Check if email exists
    const existing = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (existing) {
      throw new ValidationError('This email is already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userId = generateId();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO users (id, name, email, password, role, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, name.trim(), email.toLowerCase(), hashedPassword, role, now, now]
    );

    // Generate token
    const token = jwt.sign(
      { id: userId, name, email, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    // Log audit
    await db.run(
      `INSERT INTO audit_logs (id, userId, action, resource, resourceId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['log-' + Math.random().toString(36).substr(2, 9), userId, 'REGISTER', 'user', userId, now]
    );

    res.status(201).json({
      ok: true,
      data: {
        id: userId,
        name,
        email,
        role,
        token,
      },
      status: 201,
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    const db = await getDatabase();

    // Find user
    const user = await db.get(
      'SELECT * FROM users WHERE email = ?',
      email.toLowerCase()
    );

    if (!user) {
      throw new ValidationError('Invalid email or password');
    }

    // Check status
    if (user.status !== 'active') {
      throw new ValidationError('This account has been suspended');
    }

    // If role specified, check it matches
    if (role && user.role !== role) {
      throw new ValidationError(`This account is registered as a ${user.role}, not ${role}`);
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new ValidationError('Invalid email or password');
    }

    // Update last login
    const now = new Date().toISOString();
    await db.run('UPDATE users SET lastLogin = ? WHERE id = ?', [now, user.id]);

    // Generate token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    // Log audit
    await db.run(
      `INSERT INTO audit_logs (id, userId, action, resource, resourceId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['log-' + Math.random().toString(36).substr(2, 9), user.id, 'LOGIN', 'user', user.id, now]
    );

    res.json({
      ok: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const user = await db.get('SELECT id, name, email, role, status FROM users WHERE id = ?', req.user.id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        error: 'User not found',
        status: 404,
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

// Logout (frontend will just discard token)
router.post('/logout', authMiddleware, async (req, res) => {
  // Token is blacklisted on frontend by removing from storage
  res.json({
    ok: true,
    data: { message: 'Logged out successfully' },
    status: 200,
  });
});

export default router;
