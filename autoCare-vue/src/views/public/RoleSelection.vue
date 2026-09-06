<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { User, Briefcase, Wrench, Truck, ShieldCheck, ArrowLeft, ArrowRight, Car } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types/index'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const roles: { role: UserRole; label: string; icon: any; description: string }[] = [
  { role: 'customer', label: 'Customer', icon: User, description: 'Book and track your vehicle service' },
  { role: 'manager', label: 'Manager', icon: Briefcase, description: 'Run the shop, assign jobs, view reports' },
  { role: 'technician', label: 'Technician', icon: Wrench, description: 'Work jobs and request parts' },
  { role: 'driver', label: 'Driver', icon: Truck, description: 'Handle pickups and deliveries' },
  { role: 'admin', label: 'Admin', icon: ShieldCheck, description: 'Manage users, roles, and system health' },
]

function pick(role: UserRole) {
  auth.setSelectedRole(role)
  router.push({ path: '/login', query: route.query })
}
</script>

<template>
  <div class="surface-glow bg-dot-grid flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
    <router-link to="/" class="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <Car class="text-primary-foreground" :size="16" />
      </div>
      Auto Care
    </router-link>

    <div class="animate-fade-in-down mb-10 text-center">
      <h1 class="text-3xl font-bold tracking-tight">Who are you signing in as?</h1>
      <p class="mt-2 text-muted-foreground">Choose a role to continue</p>
    </div>

    <div class="grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="(r, i) in roles"
        :key="r.role"
        @click="pick(r.role)"
        :style="{ animationDelay: `${i * 70}ms` }"
        class="animate-fade-in-up group card-hover flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-6 text-left focus-ring"
      >
        <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
          <component :is="r.icon" :size="24" />
        </div>
        <div>
          <p class="font-semibold">{{ r.label }}</p>
          <p class="text-sm text-muted-foreground">{{ r.description }}</p>
        </div>
        <span class="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Continue <ArrowRight :size="12" />
        </span>
      </button>
    </div>

    <router-link to="/" class="mt-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
      <ArrowLeft :size="14" /> Back to home
    </router-link>
  </div>
</template>
