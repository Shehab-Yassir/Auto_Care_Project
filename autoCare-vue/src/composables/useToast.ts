import { useAuthStore } from '@/stores/auth'

export interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration?: number
}

let toastId = 0
const toasts: Toast[] = []
const listeners = new Set<(toasts: Toast[]) => void>()

export function useToast() {
  function show(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration = 3000) {
    const id = `toast-${++toastId}`
    const toast: Toast = { id, message, type, duration }
    toasts.push(toast)
    listeners.forEach((listener) => listener([...toasts]))

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  function remove(id: string) {
    const index = toasts.findIndex((t) => t.id === id)
    if (index > -1) {
      toasts.splice(index, 1)
      listeners.forEach((listener) => listener([...toasts]))
    }
  }

  function getToasts() {
    return [...toasts]
  }

  function subscribe(listener: (toasts: Toast[]) => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return {
    show,
    remove,
    getToasts,
    subscribe,
    success: (message: string, duration?: number) => show(message, 'success', duration),
    error: (message: string, duration?: number) => show(message, 'error', duration),
    warning: (message: string, duration?: number) => show(message, 'warning', duration),
    info: (message: string, duration?: number) => show(message, 'info', duration),
  }
}
