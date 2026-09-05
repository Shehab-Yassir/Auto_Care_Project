import type { Job, Task, PartRequest, InventoryItem, SystemUser, RepairReport } from '@/types/index'

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()
const hoursFromNow = (n: number) => new Date(Date.now() + n * 3600000).toISOString()

export const seedJobs: Job[] = [
  { id: 'job-001', name: 'John Doe', phone: '+1 555-0101', address: '123 Main St', model: 'Toyota Camry 2022', plate: 'ABC-1234', serviceType: 'Full Service', description: 'Oil change, brake check, tire rotation', status: 'in-progress', priority: 'high', technicianName: 'Mike Johnson', createdAt: daysAgo(2), notes: ['Customer requested eco-friendly oil'], laborCost: 150, partsCost: 25 },
  { id: 'job-002', name: 'Jane Smith', phone: '+1 555-0102', address: '456 Oak Ave', model: 'Honda Civic 2021', plate: 'XYZ-5678', serviceType: 'Brake Repair', description: 'Front brake pads + rotor inspection', status: 'pending', priority: 'high', createdAt: daysAgo(1), notes: ['Squeaking when braking'], laborCost: 0, partsCost: 0 },
  { id: 'job-003', name: 'Bob Wilson', phone: '+1 555-0103', address: '789 Pine Rd', model: 'Ford Focus 2020', plate: 'DEF-9012', serviceType: 'Oil Change', description: 'Standard oil change + filter', status: 'pending', priority: 'normal', createdAt: daysAgo(0), notes: [], laborCost: 0, partsCost: 0 },
  { id: 'job-004', name: 'Alice Brown', phone: '+1 555-0104', address: '321 Elm St', model: 'BMW 3 Series 2023', plate: 'GHI-3456', serviceType: 'AC Service', description: 'AC not cooling, needs recharge', status: 'waiting-parts', priority: 'normal', technicianName: 'Sarah Kim', createdAt: daysAgo(5), notes: ['Waiting for compressor'], laborCost: 0, partsCost: 0 },
  { id: 'job-005', name: 'Charlie Davis', phone: '+1 555-0105', address: '654 Maple Dr', model: 'Mercedes C-Class 2022', plate: 'JKL-7890', serviceType: 'Engine Diagnostics', description: 'Check engine light on', status: 'completed', priority: 'urgent', technicianName: 'Mike Johnson', createdAt: daysAgo(7), notes: ['O2 sensor replaced'], laborCost: 120, partsCost: 180 },
]

export const seedTasks: Task[] = [
  { id: 'task-001', jobId: 'job-002', type: 'pickup', name: 'Jane Smith', phone: '+1 555-0102', address: '456 Oak Ave', model: 'Honda Civic 2021', plate: 'XYZ-5678', scheduledTime: hoursFromNow(2), status: 'pending', notes: 'Home after 10 AM' },
  { id: 'task-002', jobId: 'job-005', type: 'delivery', name: 'Charlie Davis', phone: '+1 555-0105', address: '654 Maple Dr', model: 'Mercedes C-Class 2022', plate: 'JKL-7890', scheduledTime: hoursFromNow(4), status: 'on-the-way', driverName: 'Tom Rodriguez', notes: 'Call before arrival' },
  { id: 'task-003', jobId: 'job-004', type: 'pickup', name: 'Alice Brown', phone: '+1 555-0104', address: '321 Elm St', model: 'BMW 3 Series 2023', plate: 'GHI-3456', scheduledTime: hoursFromNow(6), status: 'pending', notes: '' },
]

export const seedPartRequests: PartRequest[] = [
  { id: 'pr-001', jobId: 'job-004', technicianName: 'Sarah Kim', partName: 'AC Compressor', quantity: 1, urgency: 'high', status: 'pending', requestedAt: daysAgo(1) },
  { id: 'pr-002', jobId: 'job-001', technicianName: 'Mike Johnson', partName: 'Oil Filter', quantity: 2, urgency: 'normal', status: 'approved', requestedAt: daysAgo(2) },
]

export const seedInventory: InventoryItem[] = [
  { id: 'inv-001', name: 'Oil Filter', category: 'Filters', quantity: 42, minQuantity: 15, unitPrice: 12.5 },
  { id: 'inv-002', name: 'Brake Pads (Front)', category: 'Brakes', quantity: 8, minQuantity: 10, unitPrice: 45 },
  { id: 'inv-003', name: 'AC Compressor', category: 'AC System', quantity: 2, minQuantity: 3, unitPrice: 320 },
  { id: 'inv-004', name: 'O2 Sensor', category: 'Sensors', quantity: 14, minQuantity: 5, unitPrice: 65 },
]

export const seedUsers: SystemUser[] = [
  { id: 'user-001', name: 'Mike Johnson', email: 'mike@autocare.com', role: 'technician', status: 'active', createdAt: daysAgo(90) },
  { id: 'user-002', name: 'Sarah Kim', email: 'sarah@autocare.com', role: 'technician', status: 'active', createdAt: daysAgo(60) },
  { id: 'user-003', name: 'Tom Rodriguez', email: 'tom@autocare.com', role: 'driver', status: 'active', createdAt: daysAgo(45) },
  { id: 'user-004', name: 'Lisa Park', email: 'lisa@autocare.com', role: 'manager', status: 'active', createdAt: daysAgo(200) },
  { id: 'user-005', name: 'Jane Smith', email: 'jane@example.com', role: 'customer', status: 'active', createdAt: daysAgo(10) },
]

export const seedReports: RepairReport[] = [
  { id: 'rep-001', jobId: 'job-005', technicianName: 'Mike Johnson', diagnosis: 'Faulty O2 sensor causing check engine light', workPerformed: 'Replaced O2 sensor, cleared codes', status: 'approved', createdAt: daysAgo(6) },
]
