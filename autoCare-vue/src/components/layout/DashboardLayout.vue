<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Car, LogOut, LayoutDashboard } from 'lucide-vue-next'
import NavLink from '@/components/common/NavLink.vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  title: string
  navItems: { to: string; label: string; icon: any }[]
}>()

const auth = useAuthStore()
const router = useRouter()

const roleHome = computed(() => `/${auth.selectedRole ?? 'customer'}`)

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <aside class="hidden w-64 shrink-0 flex-col border-r border-border bg-card p-4 md:flex">
      <router-link :to="roleHome" class="mb-6 flex items-center gap-2 px-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Car class="text-primary-foreground" :size="18" />
        </div>
        <span class="font-semibold">AutoFlow Pro</span>
      </router-link>

      <nav class="flex flex-1 flex-col gap-1">
        <NavLink v-for="item in navItems" :key="item.to" :to="item.to">
          <component :is="item.icon" :size="18" />
          {{ item.label }}
        </NavLink>
      </nav>

      <button
        @click="handleLogout"
        class="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <LogOut :size="18" />
        Log out
      </button>
    </aside>

    <div class="flex-1">
      <header class="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <div class="flex items-center gap-2 md:hidden">
          <LayoutDashboard :size="18" />
        </div>
        <h1 class="text-lg font-semibold">{{ title }}</h1>
        <div class="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{{ auth.user?.name ?? 'Guest' }}</span>
          <span class="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">{{ auth.selectedRole }}</span>
        </div>
      </header>

      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
