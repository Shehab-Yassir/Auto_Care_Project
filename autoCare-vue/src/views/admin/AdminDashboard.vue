<script setup lang="ts">
import { computed } from 'vue'
import { Users, UserCheck, UserX, Briefcase } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import StatCard from '@/components/common/StatCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { adminNav } from '@/navigation'
import { useUsersStore, useJobsStore } from '@/stores/data'

const users = useUsersStore()
const jobs = useJobsStore()

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
    <PageHeader title="System overview" subtitle="Users, roles, and platform activity at a glance." />

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total users" :value="users.items.length" :icon="Users" tone="primary" />
      <StatCard label="Active" :value="activeUsers" :icon="UserCheck" tone="success" />
      <StatCard label="Suspended" :value="suspended" :icon="UserX" tone="danger" />
      <StatCard label="Total jobs" :value="jobs.items.length" :icon="Briefcase" tone="accent" />
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
