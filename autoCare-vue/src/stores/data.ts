import { defineCollectionStore } from './collection'
import {
  seedJobs,
  seedTasks,
  seedPartRequests,
  seedInventory,
  seedUsers,
  seedReports,
} from './seed'
import type { Job, Task, PartRequest, InventoryItem, SystemUser, RepairReport } from '@/types/index'

export const useJobsStore = defineCollectionStore<Job>('jobs', seedJobs)
export const useTasksStore = defineCollectionStore<Task>('tasks', seedTasks)
export const usePartRequestsStore = defineCollectionStore<PartRequest>('partRequests', seedPartRequests)
export const useInventoryStore = defineCollectionStore<InventoryItem>('inventory', seedInventory)
export const useUsersStore = defineCollectionStore<SystemUser>('users', seedUsers)
export const useReportsStore = defineCollectionStore<RepairReport>('reports', seedReports)
