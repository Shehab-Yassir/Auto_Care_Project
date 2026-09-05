import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/autocare.db');

let db = null;

export async function getDatabase() {
  if (db) return db;

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON');
  return db;
}

export async function initializeDatabase() {
  const database = await getDatabase();

  // Users table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('customer', 'manager', 'technician', 'driver', 'admin')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'suspended')),
      phone TEXT,
      address TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      lastLogin TEXT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
  `);

  // Vehicles table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      model TEXT NOT NULL,
      plate TEXT UNIQUE NOT NULL,
      vin TEXT,
      year INTEGER,
      make TEXT,
      color TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_vehicles_userId ON vehicles(userId);
    CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate);
  `);

  // Jobs table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      vehicleId TEXT NOT NULL,
      serviceType TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'assigned', 'in-progress', 'waiting-parts', 'completed')),
      priority TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
      technicianId TEXT,
      driverId TEXT,
      laborCost REAL DEFAULT 0,
      partsCost REAL DEFAULT 0,
      notes TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      completedAt TEXT,
      FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE,
      FOREIGN KEY (technicianId) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (driverId) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_customerId ON jobs(customerId);
    CREATE INDEX IF NOT EXISTS idx_jobs_technicianId ON jobs(technicianId);
    CREATE INDEX IF NOT EXISTS idx_jobs_driverId ON jobs(driverId);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
  `);

  // Tasks table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      jobId TEXT NOT NULL,
      customerId TEXT NOT NULL,
      vehicleId TEXT NOT NULL,
      driverId TEXT,
      type TEXT NOT NULL CHECK(type IN ('pickup', 'delivery')),
      scheduledTime TEXT NOT NULL,
      completedTime TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'on-the-way', 'completed')),
      notes TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE,
      FOREIGN KEY (driverId) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_jobId ON tasks(jobId);
    CREATE INDEX IF NOT EXISTS idx_tasks_driverId ON tasks(driverId);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  `);

  // Part Requests table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS part_requests (
      id TEXT PRIMARY KEY,
      jobId TEXT NOT NULL,
      technicianId TEXT NOT NULL,
      partName TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      urgency TEXT NOT NULL DEFAULT 'normal' CHECK(urgency IN ('low', 'normal', 'high', 'urgent')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      notes TEXT,
      requestedAt TEXT NOT NULL DEFAULT (datetime('now')),
      approvedAt TEXT,
      approvedBy TEXT,
      FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (technicianId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_part_requests_jobId ON part_requests(jobId);
    CREATE INDEX IF NOT EXISTS idx_part_requests_technicianId ON part_requests(technicianId);
    CREATE INDEX IF NOT EXISTS idx_part_requests_status ON part_requests(status);
  `);

  // Inventory table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      minQuantity INTEGER DEFAULT 5,
      unitPrice REAL NOT NULL,
      supplier TEXT,
      lastRestocked TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
    CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);
  `);

  // Repair Reports table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS repair_reports (
      id TEXT PRIMARY KEY,
      jobId TEXT NOT NULL,
      technicianId TEXT NOT NULL,
      diagnosis TEXT NOT NULL,
      workPerformed TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'approved')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      submittedAt TEXT,
      approvedAt TEXT,
      approvedBy TEXT,
      FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (technicianId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_repair_reports_jobId ON repair_reports(jobId);
    CREATE INDEX IF NOT EXISTS idx_repair_reports_technicianId ON repair_reports(technicianId);
    CREATE INDEX IF NOT EXISTS idx_repair_reports_status ON repair_reports(status);
  `);

  // Audit Logs table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      resourceId TEXT,
      changes TEXT,
      ipAddress TEXT,
      userAgent TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_userId ON audit_logs(userId);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_createdAt ON audit_logs(createdAt);
  `);

  return database;
}
