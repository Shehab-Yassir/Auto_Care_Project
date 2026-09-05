import { defineStore } from 'pinia'
import type { UserRole } from '@/types/index'
import { apiCall } from '@/services/apiClient'
import { customerDemo, setCustomerDemo } from '@/services/demoSession'
import { isValidEmail, isValidPassword, isNonEmpty } from '@/services/validation'

interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('autocare:user') || 'null') as AuthUser | null,
    selectedRole: (localStorage.getItem('autocare:role') as UserRole | null) ?? null,
    loading: false,
    error: null as string | null,
  }),
  getters: {
    isDemo: () => customerDemo.value,
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
      if (this.selectedRole === 'customer') {
        if (!password) {
          this.error = 'Enter any password to try the demo.'
          this.loading = false
          return false
        }
        this.user = { id: 'demo-customer', name: 'John Doe', email: email.trim(), role: 'customer' }
        localStorage.removeItem('autocare:token')
        localStorage.setItem('autocare:user', JSON.stringify(this.user))
        setCustomerDemo(true)
        this.loading = false
        return true
      }
      if (!isValidPassword(password)) {
        this.error = 'Password must be at least 6 characters.'
        this.loading = false
        return false
      }

      const result = await apiCall('POST', '/auth/login', {
        email: email.trim(),
        password,
        role: this.selectedRole,
      }, 'POST /auth/login')

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
      setCustomerDemo(false)
      localStorage.setItem('autocare:token', user.token)
      localStorage.setItem('autocare:user', JSON.stringify(this.user))
      localStorage.setItem('autocare:role', user.role)

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
      setCustomerDemo(false)
      localStorage.setItem('autocare:token', user.token)
      localStorage.setItem('autocare:user', JSON.stringify(this.user))
      localStorage.setItem('autocare:role', user.role)

      return true
    },

    logout() {
      setCustomerDemo(false)
      this.user = null
      this.selectedRole = null
      this.error = null
      localStorage.removeItem('autocare:user')
      localStorage.removeItem('autocare:role')
      localStorage.removeItem('autocare:token')
    },
  },
})
