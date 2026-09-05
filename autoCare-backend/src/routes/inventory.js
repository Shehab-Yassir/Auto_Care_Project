import express from 'express';
import { getDatabase } from '../config/database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all inventory
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const { category, page = 1, limit = 20 } = req.query;

    let query = 'SELECT * FROM inventory';
    let params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY name LIMIT ? OFFSET ?';
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    params.push(limitNum, (pageNum - 1) * limitNum);

    const items = await db.all(query, params);

    res.json({
      ok: true,
      data: items,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Get inventory item by ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const item = await db.get('SELECT * FROM inventory WHERE id = ?', req.params.id);

    if (!item) {
      return res.status(404).json({
        ok: false,
        error: 'Inventory item not found',
        status: 404,
      });
    }

    res.json({
      ok: true,
      data: item,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Create inventory item (manager, admin)
router.post('/', authMiddleware, requireRole('manager', 'admin'), async (req, res, next) => {
  try {
    const { name, category, quantity, minQuantity, unitPrice, supplier } = req.body;

    if (!name || !category || quantity === undefined || !unitPrice) {
      throw new ValidationError('name, category, quantity, and unitPrice are required');
    }

    if (quantity < 0 || unitPrice < 0) {
      throw new ValidationError('quantity and unitPrice must be non-negative');
    }

    const db = await getDatabase();
    const now = new Date().toISOString();
    const itemId = 'inventory-' + Math.random().toString(36).substr(2, 9);

    await db.run(
      `INSERT INTO inventory (id, name, category, quantity, minQuantity, unitPrice, supplier, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemId, name, category, quantity, minQuantity || 5, unitPrice, supplier, now, now]
    );

    const item = await db.get('SELECT * FROM inventory WHERE id = ?', itemId);

    res.status(201).json({
      ok: true,
      data: item,
      status: 201,
    });
  } catch (error) {
    next(error);
  }
});

// Update inventory item
router.put('/:id', authMiddleware, requireRole('manager', 'admin'), async (req, res, next) => {
  try {
    const { name, category, quantity, minQuantity, unitPrice, supplier } = req.body;
    const itemId = req.params.id;

    const db = await getDatabase();
    const item = await db.get('SELECT * FROM inventory WHERE id = ?', itemId);

    if (!item) {
      return res.status(404).json({
        ok: false,
        error: 'Inventory item not found',
        status: 404,
      });
    }

    const now = new Date().toISOString();
    const restockedTime = quantity && quantity > item.quantity ? now : null;

    await db.run(
      `UPDATE inventory SET name = ?, category = ?, quantity = ?, minQuantity = ?, unitPrice = ?, supplier = ?, lastRestocked = ?, updatedAt = ?
       WHERE id = ?`,
      [
        name || item.name,
        category || item.category,
        quantity !== undefined ? quantity : item.quantity,
        minQuantity !== undefined ? minQuantity : item.minQuantity,
        unitPrice || item.unitPrice,
        supplier !== undefined ? supplier : item.supplier,
        restockedTime || item.lastRestocked,
        now,
        itemId,
      ]
    );

    const updated = await db.get('SELECT * FROM inventory WHERE id = ?', itemId);

    res.json({
      ok: true,
      data: updated,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Delete inventory item
router.delete('/:id', authMiddleware, requireRole('manager', 'admin'), async (req, res, next) => {
  try {
    const itemId = req.params.id;
    const db = await getDatabase();

    const item = await db.get('SELECT * FROM inventory WHERE id = ?', itemId);
    if (!item) {
      return res.status(404).json({
        ok: false,
        error: 'Inventory item not found',
        status: 404,
      });
    }

    await db.run('DELETE FROM inventory WHERE id = ?', itemId);

    res.json({
      ok: true,
      data: { message: 'Inventory item deleted' },
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Get low stock items
router.get('/low-stock', authMiddleware, requireRole('manager', 'admin'), async (req, res, next) => {
  try {
    const db = await getDatabase();
    const items = await db.all(
      'SELECT * FROM inventory WHERE quantity <= minQuantity ORDER BY quantity ASC'
    );

    res.json({
      ok: true,
      data: items,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
