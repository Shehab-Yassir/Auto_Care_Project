/**
 * Real API client connecting to the Node.js/Express backend.
 */

import { ref } from 'vue'
import { customerDemo } from './demoSession'

/** Number of requests currently in flight, app-wide. */
export const pendingRequests = ref(0)

export interface ApiSuccess<T> {
  ok: true
  data: T
  status: number
}

export interface ApiFailure {
  ok: false
  error: string
  status: number
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

function getAuthToken() {
  return localStorage.getItem('autocare:token')
}

/**
 * Makes a real API request to the Node.js/Express backend.
 */
export async function apiCall<T>(
  method: string,
  endpoint: string,
  body?: any,
  label?: string
): Promise<ApiResult<T>> {
  if (customerDemo.value && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
    return { ok: false, error: 'This feature is unavailable in the customer demo.', status: 0 }
  }
  const startedAt = performance.now()
  pendingRequests.value++

  try {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const token = customerDemo.value ? null : getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const data = await response.json()

    const ms = (performance.now() - startedAt).toFixed(0)
    const logLabel = label || `${method} ${endpoint}`

    if (response.ok) {
      if (import.meta.env.DEV) {
        console.debug(`%c[api] ${logLabel} → ${response.status} OK (${ms}ms)`, 'color:#16a34a')
      }
      return { ok: true, data: data.data, status: response.status }
    } else {
      const message = data.error || 'An error occurred'
      if (import.meta.env.DEV) {
        console.warn(`%c[api] ${logLabel} → ${response.status} (${ms}ms) — ${message}`, 'color:#dc2626')
      }
      return { ok: false, error: message, status: response.status }
    }
  } catch (err) {
    const ms = (performance.now() - startedAt).toFixed(0)
    const message = err instanceof Error ? err.message : 'Network error'
    const logLabel = label || 'API Call'

    if (import.meta.env.DEV) {
      console.error(`%c[api] ${logLabel} → Network Error (${ms}ms) — ${message}`, 'color:#dc2626', err)
    }

    return {
      ok: false,
      error: message,
      status: 0,
    }
  } finally {
    pendingRequests.value--
  }
}
