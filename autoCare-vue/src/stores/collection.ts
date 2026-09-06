import { defineStore } from 'pinia'
import type { Identified } from '@/types/index'
import { demoSession } from '@/services/demoSession'

/**
 * Creates a generic collection store for mock/cached data.
 * This is used for displaying seed data in dashboards.
 * For real backend data, use the API client directly.
 */
export function defineCollectionStore<T extends Identified>(name: string, seed: T[]) {
  const storageKey = `autocare:${name}`

  return defineStore(name, {
    state: () => ({
      regularItems: loadInitial(storageKey, seed) as T[],
      demoItems: loadInitial(`autocare:demo:${name}`, seed) as T[],
      loading: false,
      error: null as string | null,
    }),
    getters: {
      items: (state) => demoSession.value ? state.demoItems : state.regularItems,
      byId() {
        return (id: string): T | undefined => (this.items as T[]).find((i) => i.id === id)
      },
    },
    actions: {
      add(item: Omit<T, 'id'>) {
        this.loading = true
        this.error = null
        try {
          const created = { ...item, id: `${name}-${Math.random().toString(36).substr(2, 9)}` } as T
          ;(this.items as T[]).unshift(created)
          this.persist()
          this.loading = false
          return created
        } catch (err) {
          this.error = err instanceof Error ? err.message : 'Failed to add item'
          this.loading = false
          return null
        }
      },

      update(id: string, patch: Partial<T>) {
        this.loading = true
        this.error = null
        try {
          const items = this.items as T[]
          const idx = items.findIndex((i) => i.id === id)
          if (idx === -1) {
            throw new Error(`${name} record "${id}" was not found`)
          }
          items[idx] = { ...items[idx], ...patch }
          this.persist()
          this.loading = false
          return items[idx]
        } catch (err) {
          this.error = err instanceof Error ? err.message : 'Failed to update item'
          this.loading = false
          return null
        }
      },

      remove(id: string) {
        this.loading = true
        this.error = null
        try {
          const items = this.items as T[]
          const removedIdx = items.findIndex((i) => i.id === id)
          if (removedIdx === -1) {
            throw new Error(`${name} record "${id}" was not found`)
          }
          items.splice(removedIdx, 1)
          this.persist()
          this.loading = false
          return true
        } catch (err) {
          this.error = err instanceof Error ? err.message : 'Failed to remove item'
          this.loading = false
          return false
        }
      },

      persist() {
        localStorage.setItem(demoSession.value ? `autocare:demo:${name}` : storageKey, JSON.stringify(this.items))
      },

      reset() {
        this.items.splice(0, this.items.length, ...JSON.parse(JSON.stringify(seed)))
        this.error = null
        this.persist()
      },
    },
  })
}

function loadInitial<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) && parsed.every((item) => item && typeof item.id === 'string')
      ? parsed : JSON.parse(JSON.stringify(seed))
  } catch {
    return JSON.parse(JSON.stringify(seed))
  }
}
