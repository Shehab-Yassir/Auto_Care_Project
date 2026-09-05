// Domain types for Auto Care.
// Kept intentionally lean: only fields the UI actually reads/writes.

export type UserRole = 'customer' | 'manager' | 'technician' | 'driver' | 'admin'
export type JobStatus = 'pending' | 'assigned' | 'in-progress' | 'waiting-parts' | 'completed'
export type Priority = 'low' | 'normal' | 'high' | 'urgent'
export type TaskType = 'pickup' | 'delivery'
export type TaskStatus = 'pending' | 'on-the-way' | 'completed'
export type PartRequestStatus = 'pending' | 'approved' | 'rejected'

export interface Identified {
  id: string
}

export interface Customer {
  name: string
  phone: string
  address: string
}

export interface Vehicle {
  model: string
  plate: string
}

export interface Job extends Identified, Customer, Vehicle {
  serviceType: string
  description: string
  status: JobStatus
  priority: Priority
  technicianName?: string
  driverName?: string
  createdAt: string
  notes: string[]
  laborCost: number
  partsCost: number
}

export interface Task extends Identified, Customer, Vehicle {
  jobId: string
  type: TaskType
  scheduledTime: string
  status: TaskStatus
  driverName?: string
  notes?: string
}

export interface PartRequest extends Identified {
  jobId: string
  technicianName: string
  partName: string
  quantity: number
  urgency: Priority
  status: PartRequestStatus
  requestedAt: string
}

export interface InventoryItem extends Identified {
  name: string
  category: string
  quantity: number
  minQuantity: number
  unitPrice: number
}

export interface SystemUser extends Identified {
  name: string
  email: string
  role: UserRole
  status: 'active' | 'suspended'
  createdAt: string
}

export interface RepairReport extends Identified {
  jobId: string
  technicianName: string
  diagnosis: string
  workPerformed: string
  status: 'draft' | 'submitted' | 'approved'
  createdAt: string
}
