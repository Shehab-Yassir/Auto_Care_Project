import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'landing', component: () => import('@/views/public/Home.vue') },
  { path: '/select-role', name: 'select-role', component: () => import('@/views/public/RoleSelection.vue') },
  { path: '/login', name: 'login', component: () => import('@/views/public/Login.vue') },
  { path: '/register', name: 'register', component: () => import('@/views/public/Register.vue') },
  {
    path: '/chatbot',
    name: 'chatbot',
    component: () => import('@/views/public/Chatbot.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/customer',
    meta: { requiresAuth: true, roles: ['customer'] },
    children: [
      { path: '', name: 'customer-dashboard', component: () => import('@/views/customer/CustomerDashboard.vue') },
      {
        path: 'booking',
        name: 'customer-booking',
        component: () => import('@/views/customer/BookingPage.vue'),
      },
      {
        path: 'progress',
        name: 'customer-progress',
        component: () => import('@/views/customer/ProgressPage.vue'),
      },
      {
        path: 'reports',
        name: 'customer-reports',
        component: () => import('@/views/customer/ReportsPage.vue'),
      },
    ],
  },

  {
    path: '/manager',
    meta: { requiresAuth: true, roles: ['manager'] },
    children: [
      { path: '', name: 'manager-dashboard', component: () => import('@/views/manager/ManagerDashboard.vue') },
      { path: 'requests', name: 'manager-requests', component: () => import('@/views/manager/ManagerRequests.vue') },
      {
        path: 'technicians',
        name: 'manager-technicians',
        component: () => import('@/views/manager/ManagerTechnicians.vue'),
      },
      { path: 'inventory', name: 'manager-inventory', component: () => import('@/views/manager/ManagerInventory.vue') },
      { path: 'reports', name: 'manager-reports', component: () => import('@/views/manager/ManagerReports.vue') },
    ],
  },

  {
    path: '/technician',
    meta: { requiresAuth: true, roles: ['technician'] },
    children: [
      { path: '', name: 'technician-dashboard', component: () => import('@/views/technician/TechnicianDashboard.vue') },
      { path: 'jobs', name: 'technician-jobs', component: () => import('@/views/technician/TechnicianJobs.vue') },
      { path: 'parts', name: 'technician-parts', component: () => import('@/views/technician/TechnicianParts.vue') },
      { path: 'reports', name: 'technician-reports', component: () => import('@/views/technician/TechnicianReports.vue') },
    ],
  },

  {
    path: '/driver',
    meta: { requiresAuth: true, roles: ['driver'] },
    children: [
      { path: '', name: 'driver-dashboard', component: () => import('@/views/driver/DriverDashboard.vue') },
      { path: 'pickups', name: 'driver-pickups', component: () => import('@/views/driver/DriverPickups.vue') },
      { path: 'deliveries', name: 'driver-deliveries', component: () => import('@/views/driver/DriverDeliveries.vue') },
      { path: 'history', name: 'driver-history', component: () => import('@/views/driver/DriverHistory.vue') },
    ],
  },

  {
    path: '/admin',
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/AdminDashboard.vue') },
      { path: 'users', name: 'admin-users', component: () => import('@/views/admin/AdminUsers.vue') },
      { path: 'roles', name: 'admin-roles', component: () => import('@/views/admin/AdminRoles.vue') },
      { path: 'logs', name: 'admin-logs', component: () => import('@/views/admin/AdminLogs.vue') },
      { path: 'health', name: 'admin-health', component: () => import('@/views/admin/AdminHealth.vue') },
    ],
  },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFound.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Route guards for authentication and authorization
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // Redirect to login but save intended destination
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // Check if user has required roles
  if (to.meta.roles) {
    const roles = to.meta.roles as string[]
    if (!auth.user || !roles.includes(auth.user.role)) {
      // User doesn't have permission, redirect to appropriate dashboard
      if (auth.isAuthenticated) {
        next({ name: `${auth.user?.role}-dashboard` })
      } else {
        next({ name: 'login' })
      }
      return
    }
  }

  next()
})

export default router
