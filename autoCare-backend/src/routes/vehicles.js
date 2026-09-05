import express from 'express';
import { getDatabase } from '../config/database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all vehicles for authenticated user or all (for admin/manager)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const db = await getDatabase();
    let query = 'SELECT * FROM vehicles';
    let params = [];

    // Customers can only see their own vehicles
    if (req.user.role === 'customer') {
      query += ' WHERE userId = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY createdAt DESC';
    const vehicles = await db.all(query, params);

    res.json({
      ok: true,
      data: vehicles,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Get vehicle by ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const db = await getDatabase();
    const vehicle = await db.get('SELECT * FROM vehicles WHERE id = ?', req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        ok: false,
        error: 'Vehicle not found',
        status: 404,
      });
    }

    // Check permissions
    if (req.user.role === 'customer' && vehicle.userId !== req.user.id) {
      return res.status(403).json({
        ok: false,
        error: 'You do not have permission to view this vehicle',
        status: 403,
      });
    }

    res.json({
      ok: true,
      data: vehicle,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Create vehicle
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { model, plate, vin, year, make, color } = req.body;
    const userId = req.body.userId || req.user.id;

    // Customers can only add vehicles for themselves
    if (req.user.role === 'customer' && userId !== req.user.id) {
      return res.status(403).json({
        ok: false,
        error: 'You can only add vehicles for yourself',
        status: 403,
      });
    }

    if (!model || !plate) {
      throw new ValidationError('Model and plate are required');
    }

    const db = await getDatabase();
    const now = new Date().toISOString();
    const vehicleId = 'vehicle-' + Math.random().toString(36).substr(2, 9);

    await db.run(
      `INSERT INTO vehicles (id, userId, model, plate, vin, year, make, color, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vehicleId, userId, model, plate.toUpperCase(), vin, year, make, color, now, now]
    );

    const vehicle = await db.get('SELECT * FROM vehicles WHERE id = ?', vehicleId);

    res.status(201).json({
      ok: true,
      data: vehicle,
      status: 201,
    });
  } catch (error) {
    next(error);
  }
});

// Update vehicle
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { model, plate, vin, year, make, color } = req.body;
    const vehicleId = req.params.id;

    const db = await getDatabase();
    const vehicle = await db.get('SELECT * FROM vehicles WHERE id = ?', vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        ok: false,
        error: 'Vehicle not found',
        status: 404,
      });
    }

    // Check permissions
    if (req.user.role === 'customer' && vehicle.userId !== req.user.id) {
      return res.status(403).json({
        ok: false,
        error: 'You do not have permission to update this vehicle',
        status: 403,
      });
    }

    const now = new Date().toISOString();
    await db.run(
      `UPDATE vehicles SET model = ?, plate = ?, vin = ?, year = ?, make = ?, color = ?, updatedAt = ?
       WHERE id = ?`,
      [model || vehicle.model, plate?.toUpperCase() || vehicle.plate, vin || vehicle.vin, year || vehicle.year, make || vehicle.make, color || vehicle.color, now, vehicleId]
    );

    const updated = await db.get('SELECT * FROM vehicles WHERE id = ?', vehicleId);

    res.json({
      ok: true,
      data: updated,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

// Delete vehicle
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const vehicleId = req.params.id;
    const db = await getDatabase();

    const vehicle = await db.get('SELECT * FROM vehicles WHERE id = ?', vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        ok: false,
        error: 'Vehicle not found',
        status: 404,
      });
    }

    // Check permissions
    if (req.user.role === 'customer' && vehicle.userId !== req.user.id) {
      return res.status(403).json({
        ok: false,
        error: 'You do not have permission to delete this vehicle',
        status: 403,
      });
    }

    await db.run('DELETE FROM vehicles WHERE id = ?', vehicleId);

    res.json({
      ok: true,
      data: { message: 'Vehicle deleted' },
      status: 200,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
