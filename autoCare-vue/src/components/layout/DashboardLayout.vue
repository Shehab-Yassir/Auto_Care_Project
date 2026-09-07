<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Car, Home, LogOut, LayoutDashboard, MessageSquare } from 'lucide-vue-next'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import NavLink from '@/components/common/NavLink.vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  title: string
  navItems: { to: string; label: string; icon: any }[]
}>()

const auth = useAuthStore()
const router = useRouter()

const roleHome = computed(() => `/${auth.user?.role ?? 'customer'}`)
const portalTitle = computed(() => ({ customer: 'Customer Portal', admin: 'Admin Portal', manager: 'Service Manager', technician: 'Technician Portal', driver: 'Driver Portal' })[auth.user?.role ?? 'customer'])

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="dashboard-shell flex min-h-screen bg-background text-foreground">
    <aside class="dashboard-sidebar sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-border bg-card p-4 md:flex">
      <router-link :to="roleHome" class="mb-6 flex items-center gap-2 px-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Car class="text-primary-foreground" :size="18" />
        </div>
        <span class="font-semibold">AutoCare</span>
      </router-link>

      <div class="mb-8 flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-bold text-primary">{{ auth.user?.name.charAt(0) ?? 'A' }}</span>
        <div class="min-w-0"><p class="truncate font-medium">{{ auth.user?.name }}</p><p class="text-xs capitalize text-muted-foreground">{{ auth.user?.role }}</p></div>
      </div>

      <nav class="flex flex-1 flex-col gap-1">
        <NavLink to="/">
          <Home :size="18" />
          Home
        </NavLink>
        <NavLink v-for="item in navItems" :key="item.to" :to="item.to">
          <component :is="item.icon" :size="18" />
          {{ item.label }}
        </NavLink>
      </nav>

      <router-link to="/chatbot" class="mt-5 flex items-center gap-3 border-t border-border px-3 py-4 text-sm text-muted-foreground transition-colors hover:text-primary focus-ring"><MessageSquare :size="18" /> AI Assistant</router-link>
      <button
        @click="handleLogout"
        class="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"
      >
        <LogOut :size="18" />
        Log out
      </button>
    </aside>

    <div class="min-w-0 flex-1">
      <header class="flex h-16 items-center justify-between border-b border-border bg-card/90 px-6 backdrop-blur-xl">
        <div class="flex items-center gap-2 md:hidden">
          <LayoutDashboard :size="18" />
        </div>
        <p class="text-lg font-semibold">{{ portalTitle }}</p>
        <div class="flex items-center gap-3 text-sm text-muted-foreground">
          <ThemeToggle />
          <router-link to="/chatbot" aria-label="AI Assistant" class="flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-primary"><MessageSquare :size="16" /><span class="hidden sm:inline">AI Assistant</span></router-link>
        </div>
      </header>

      <nav aria-label="Dashboard navigation" class="flex flex-wrap gap-2 border-b border-border bg-card p-3 md:hidden">
        <NavLink to="/">
          <Home :size="16" />
          Home
        </NavLink>
        <NavLink v-for="item in navItems" :key="item.to" :to="item.to">
          <component :is="item.icon" :size="16" />
          {{ item.label }}
        </NavLink>
        <button type="button" class="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground" @click="handleLogout">Log out</button>
      </nav>

      <main :aria-label="title" class="mx-auto max-w-[1500px] p-4 sm:p-8">
        <p v-if="auth.isDemo" class="mb-5 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
          Demo mode — sample data shared across roles in this browser. No real bookings are submitted.
        </p>
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-shell :deep(.reveal) { opacity: 1; transform: none; }
.dashboard-sidebar :deep(nav a) { padding: 14px 16px; }
</style>
