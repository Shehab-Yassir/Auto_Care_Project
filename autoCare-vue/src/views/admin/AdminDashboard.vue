<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { apiCall } from '@/services/apiClient'
import { useAuthStore } from '@/stores/auth'
import { Users, UserCheck, UserX, Briefcase } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import StatCard from '@/components/common/StatCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DashboardActions from '@/components/common/DashboardActions.vue'
import { UserCog, KeyRound, ScrollText, HeartPulse } from 'lucide-vue-next'
import { adminNav } from '@/navigation'
import { useUsersStore, useJobsStore } from '@/stores/data'

const users = useUsersStore()
const jobs = useJobsStore()
const auth = useAuthStore()
const health = ref<{ database: { status: string }; services: Record<string, string> } | null>(null)
const logs = ref<{ id: string; userName?: string; action: string; createdAt: string }[]>([])
const healthError = ref('')
const logsError = ref('')
onMounted(async () => {
  if (auth.isDemo) {
    health.value = { database: { status: 'Local demo data' }, services: { auth: 'Demo sign-in', jobs: 'Local demo data' } }
    logs.value = [...jobs.items].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 4)
      .map((job) => ({ id: job.id, userName: job.name, action: `${job.serviceType} (${job.status})`, createdAt: job.createdAt }))
    return
  }
  const [healthResult, logsResult] = await Promise.all([
    apiCall<NonNullable<typeof health.value>>('GET', '/admin/health'),
    apiCall<typeof logs.value>('GET', '/admin/logs?limit=4'),
  ])
  if (healthResult.ok) health.value = healthResult.data
  else healthError.value = 'System status is currently unavailable.'
  if (logsResult.ok) logs.value = logsResult.data
  else logsError.value = 'Recent activity is currently unavailable.'
})

const activeUsers = computed(() => users.items.filter((u) => u.status === 'active').length)
const suspended = computed(() => users.items.filter((u) => u.status === 'suspended').length)

const byRole = computed(() => {
  const map = new Map<string, number>()
  users.items.forEach((u) => map.set(u.role, (map.get(u.role) ?? 0) + 1))
  return [...map.entries()]
})
</script>

<template>
  <DashboardLayout title="System Overview" :nav-items="adminNav">
    <PageHeader title="Admin Panel" subtitle="System overview and management" />

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total users" :value="users.items.length" :icon="Users" tone="primary" />
      <StatCard label="Active" :value="activeUsers" :icon="UserCheck" tone="success" />
      <StatCard label="Suspended" :value="suspended" :icon="UserX" tone="danger" />
      <StatCard label="Total jobs" :value="jobs.items.length" :icon="Briefcase" tone="accent" />
    </div>

    <DashboardActions :items="[
      { to: '/admin/users', title: 'User Management', description: 'Manage users and account status', icon: UserCog },
      { to: '/admin/roles', title: 'Roles & Permissions', description: 'Review access for every role', icon: KeyRound },
      { to: '/admin/logs', title: 'Activity Logs', description: 'Review system activity', icon: ScrollText },
      { to: '/admin/health', title: 'System Health', description: 'Check services and system status', icon: HeartPulse },
    ]" />
    <div class="grid gap-6 lg:grid-cols-2">
      <BaseCard class="p-6">
        <div class="mb-5 flex justify-between"><h2 class="font-semibold">System Health</h2><router-link to="/admin/health" class="text-sm text-primary">Details →</router-link></div>
        <p v-if="healthError" class="text-sm text-muted-foreground">{{ healthError }}</p>
        <template v-else-if="health">
          <div v-for="(status, service) in { Database: health.database.status, ...health.services }" :key="service" class="flex justify-between border-b border-border py-3 last:border-0"><span class="capitalize">{{ service }}</span><span class="text-sm text-success">{{ status }}</span></div>
        </template>
        <p v-else class="text-sm text-muted-foreground">Checking services…</p>
      </BaseCard>
      <BaseCard class="p-6">
        <div class="mb-5 flex justify-between"><h2 class="font-semibold">Recent Activity</h2><router-link to="/admin/logs" class="text-sm text-primary">View all →</router-link></div>
        <p v-if="logsError" class="text-sm text-muted-foreground">{{ logsError }}</p>
        <div v-for="entry in logs" :key="entry.id" class="flex items-center gap-3 border-b border-border py-3 last:border-0">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">{{ (entry.userName ?? 'System').charAt(0) }}</span>
          <div><p class="text-sm"><strong>{{ entry.userName ?? 'System' }}</strong> {{ entry.action }}</p><p class="mt-1 text-xs text-muted-foreground">{{ new Date(entry.createdAt).toLocaleString() }}</p></div>
        </div>
        <p v-if="!logsError && !logs.length" class="text-sm text-muted-foreground">No recent activity.</p>
      </BaseCard>
    </div>
    <BaseCard v-if="byRole.length" class="reveal reveal-delay-2 mt-6 p-5">
      <h2 class="mb-4 font-semibold">Users by role</h2>
      <div v-for="[role, count] in byRole" :key="role" class="mb-3 flex items-center gap-3">
        <span class="w-28 shrink-0 text-sm capitalize">{{ role }}</span>
        <div class="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            class="h-2 rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-700 ease-out"
            :style="{ width: `${(count / users.items.length) * 100}%` }"
          />
        </div>
        <span class="w-6 text-right text-sm text-muted-foreground">{{ count }}</span>
      </div>
    </BaseCard>
  </DashboardLayout>
</template>
