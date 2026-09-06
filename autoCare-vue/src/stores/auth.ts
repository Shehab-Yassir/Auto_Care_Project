import { defineStore } from 'pinia'
import type { UserRole } from '@/types/index'
import { apiCall } from '@/services/apiClient'
import { demoSession, setDemoSession } from '@/services/demoSession'
import { isValidEmail, isValidPassword, isNonEmpty } from '@/services/validation'

interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

const roles: UserRole[] = ['customer', 'manager', 'technician', 'driver', 'admin']

function restoreUser(): AuthUser | null {
  try {
    const user = JSON.parse(localStorage.getItem('autocare:user') || 'null')
    return user && typeof user.id === 'string' && typeof user.name === 'string'
      && typeof user.email === 'string' && roles.includes(user.role) ? user : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: restoreUser(),
    selectedRole: roles.find((role) => role === localStorage.getItem('autocare:role')) ?? null,
    loading: false,
    error: null as string | null,
  }),
  getters: {
    isDemo: () => demoSession.value,
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    setSelectedRole(role: UserRole) {
      this.selectedRole = role
      this.error = null
      localStorage.setItem('autocare:role', role)
    },

    async login(email: string, password: string) {
      this.loading = true
      this.error = null

      // Validation
      if (!this.selectedRole) {
        this.error = 'Choose a role before signing in.'
        this.loading = false
        return false
      }
      if (!isValidEmail(email)) {
        this.error = 'Enter a valid email address.'
        this.loading = false
        return false
      }
      if (!password) {
        this.error = 'Enter any password to sign in.'
        this.loading = false
        return false
      }

      // Local demo sign-in accepts arbitrary credentials for every role.
      const role = this.selectedRole
      this.user = {
        id: `demo-${role}`,
        name: { customer: 'John Doe', manager: 'Lisa Park', technician: 'Mike Johnson', driver: 'Tom Rodriguez', admin: 'Demo Admin' }[role],
        email: email.trim(),
        role,
      }
      localStorage.removeItem('autocare:token')
      localStorage.setItem('autocare:user', JSON.stringify(this.user))
      localStorage.setItem('autocare:role', role)
      setDemoSession(true)
      this.loading = false
      return true
    },

    async register(name: string, email: string, password: string, confirmPassword: string) {
      this.loading = true
      this.error = null

      // Validation
      if (!this.selectedRole) {
        this.error = 'Choose a role before creating an account.'
        this.loading = false
        return false
      }
      if (!isNonEmpty(name)) {
        this.error = 'Enter your full name.'
        this.loading = false
        return false
      }
      if (!isValidEmail(email)) {
        this.error = 'Enter a valid email address.'
        this.loading = false
        return false
      }
      if (!isValidPassword(password)) {
        this.error = 'Password must be at least 6 characters.'
        this.loading = false
        return false
      }
      if (password !== confirmPassword) {
        this.error = 'Passwords do not match.'
        this.loading = false
        return false
      }

      const result = await apiCall('POST', '/auth/register', {
        name: name.trim(),
        email: email.toLowerCase(),
        password,
        confirmPassword,
        role: this.selectedRole,
      }, 'POST /auth/register')

      this.loading = false
      if (!result.ok) {
        this.error = result.error
        return false
      }

      const user = result.data as any
      this.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }

      // Store token and user
      setDemoSession(false)
      localStorage.setItem('autocare:token', user.token)
      localStorage.setItem('autocare:user', JSON.stringify(this.user))
      localStorage.setItem('autocare:role', user.role)

      return true
    },

    logout() {
      setDemoSession(false)
      this.user = null
      this.selectedRole = null
      this.error = null
      localStorage.removeItem('autocare:user')
      localStorage.removeItem('autocare:role')
      localStorage.removeItem('autocare:token')
    },
  },
})
