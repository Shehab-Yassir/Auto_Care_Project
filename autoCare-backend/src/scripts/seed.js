import { getDatabase, initializeDatabase } from '../config/database.js';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  await initializeDatabase();
  const db = await getDatabase();

  console.log('🌱 Seeding database...');

  try {
    // Check if data already exists
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count > 0) {
      console.log('✅ Database already seeded');
      return;
    }

    // Create sample users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const now = new Date().toISOString();

    const users = [
      {
        id: 'user-customer-1',
        name: 'John Smith',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'customer',
        status: 'active',
        phone: '555-0101',
        address: '123 Main St, Springfield',
      },
      {
        id: 'user-customer-2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: hashedPassword,
        role: 'customer',
        status: 'active',
        phone: '555-0102',
        address: '456 Oak Ave, Springfield',
      },
      {
        id: 'user-technician-1',
        name: 'Mike Chen',
        email: 'mike@autocare.com',
        password: hashedPassword,
        role: 'technician',
        status: 'active',
        phone: '555-0201',
      },
      {
        id: 'user-technician-2',
        name: 'Lisa Rodriguez',
        email: 'lisa@autocare.com',
        password: hashedPassword,
        role: 'technician',
        status: 'active',
        phone: '555-0202',
      },
      {
        id: 'user-driver-1',
        name: 'James Wilson',
        email: 'james@autocare.com',
        password: hashedPassword,
        role: 'driver',
        status: 'active',
        phone: '555-0301',
      },
      {
        id: 'user-driver-2',
        name: 'Emma Brown',
        email: 'emma@autocare.com',
        password: hashedPassword,
        role: 'driver',
        status: 'active',
        phone: '555-0302',
      },
      {
        id: 'user-manager-1',
        name: 'Robert Taylor',
        email: 'robert@autocare.com',
        password: hashedPassword,
        role: 'manager',
        status: 'active',
        phone: '555-0401',
      },
      {
        id: 'user-admin-1',
        name: 'Admin User',
        email: 'admin@autocare.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        phone: '555-0500',
      },
    ];

    for (const user of users) {
      await db.run(
        `INSERT INTO users (id, name, email, password, role, status, phone, address, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.id, user.name, user.email, user.password, user.role, user.status, user.phone, user.address || null, now, now]
      );
    }

    // Create sample vehicles
    const vehicles = [
      {
        id: 'vehicle-1',
        userId: 'user-customer-1',
        model: 'Toyota Camry',
        plate: 'ABC123',
        vin: 'JTDKN3AU9F0123456',
        year: 2022,
        make: 'Toyota',
        color: 'Silver',
      },
      {
        id: 'vehicle-2',
        userId: 'user-customer-2',
        model: 'Honda Civic',
        plate: 'XYZ789',
        vin: '2HGFC2F56LH123456',
        year: 2021,
        make: 'Honda',
        color: 'Blue',
      },
    ];

    for (const vehicle of vehicles) {
      await db.run(
        `INSERT INTO vehicles (id, userId, model, plate, vin, year, make, color, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [vehicle.id, vehicle.userId, vehicle.model, vehicle.plate, vehicle.vin, vehicle.year, vehicle.make, vehicle.color, now, now]
      );
    }

    // Create sample jobs
    const jobs = [
      {
        id: 'job-1',
        customerId: 'user-customer-1',
        vehicleId: 'vehicle-1',
        serviceType: 'Oil Change',
        description: 'Regular oil and filter change',
        status: 'in-progress',
        priority: 'normal',
        technicianId: 'user-technician-1',
        laborCost: 50,
        partsCost: 35,
      },
      {
        id: 'job-2',
        customerId: 'user-customer-2',
        vehicleId: 'vehicle-2',
        serviceType: 'Brake Inspection',
        description: 'Comprehensive brake system inspection',
        status: 'pending',
        priority: 'high',
        laborCost: 75,
        partsCost: 0,
      },
      {
        id: 'job-3',
        customerId: 'user-customer-1',
        vehicleId: 'vehicle-1',
        serviceType: 'Tire Rotation',
        description: 'Rotate and balance all tires',
        status: 'completed',
        priority: 'normal',
        technicianId: 'user-technician-2',
        laborCost: 40,
        partsCost: 15,
      },
    ];

    for (const job of jobs) {
      await db.run(
        `INSERT INTO jobs (id, customerId, vehicleId, serviceType, description, status, priority, technicianId, laborCost, partsCost, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [job.id, job.customerId, job.vehicleId, job.serviceType, job.description, job.status, job.priority, job.technicianId || null, job.laborCost, job.partsCost, now, now]
      );
    }

    // Create sample tasks
    const tasks = [
      {
        id: 'task-1',
        jobId: 'job-1',
        customerId: 'user-customer-1',
        vehicleId: 'vehicle-1',
        driverId: 'user-driver-1',
        type: 'pickup',
        scheduledTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'pending',
      },
      {
        id: 'task-2',
        jobId: 'job-1',
        customerId: 'user-customer-1',
        vehicleId: 'vehicle-1',
        driverId: 'user-driver-1',
        type: 'delivery',
        scheduledTime: new Date(Date.now() + 7200000).toISOString(),
        status: 'pending',
      },
    ];

    for (const task of tasks) {
      await db.run(
        `INSERT INTO tasks (id, jobId, customerId, vehicleId, driverId, type, scheduledTime, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [task.id, task.jobId, task.customerId, task.vehicleId, task.driverId, task.type, task.scheduledTime, task.status, now, now]
      );
    }

    // Create sample inventory
    const inventory = [
      {
        id: 'inv-1',
        name: 'Synthetic Motor Oil 5W-30',
        category: 'Fluids',
        quantity: 45,
        minQuantity: 10,
        unitPrice: 35,
        supplier: 'Mobil Oil Co',
      },
      {
        id: 'inv-2',
        name: 'Brake Pads (Front)',
        category: 'Brakes',
        quantity: 12,
        minQuantity: 5,
        unitPrice: 85,
        supplier: 'Bosch',
      },
      {
        id: 'inv-3',
        name: 'Air Filter',
        category: 'Filters',
        quantity: 3,
        minQuantity: 5,
        unitPrice: 25,
        supplier: 'Mann Filter',
      },
      {
        id: 'inv-4',
        name: 'Spark Plugs (Set of 4)',
        category: 'Ignition',
        quantity: 8,
        minQuantity: 3,
        unitPrice: 45,
        supplier: 'NGK',
      },
    ];

    for (const item of inventory) {
      await db.run(
        `INSERT INTO inventory (id, name, category, quantity, minQuantity, unitPrice, supplier, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.id, item.name, item.category, item.quantity, item.minQuantity, item.unitPrice, item.supplier, now, now]
      );
    }

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run if called directly
seedDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
