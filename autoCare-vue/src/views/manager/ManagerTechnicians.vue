<script setup lang="ts">
import { computed } from 'vue'
import { Users } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { managerNav } from '@/navigation'
import { useUsersStore, useJobsStore } from '@/stores/data'

const users = useUsersStore()
const jobs = useJobsStore()

const technicians = computed(() => users.items.filter((u) => u.role === 'technician'))
const loadFor = (name: string) => jobs.items.filter((j) => j.technicianName === name && j.status !== 'completed').length
</script>

<template>
  <DashboardLayout title="Technicians" :nav-items="managerNav">
    <PageHeader title="Technicians" subtitle="Current workload and status for every technician." />

    <EmptyState v-if="technicians.length === 0" :icon="Users" title="No technicians yet" description="Technician accounts will appear here." />

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <BaseCard
        v-for="(t, idx) in technicians"
        :key="t.id"
        hover
        :class="['reveal p-5', `reveal-delay-${Math.min(idx + 1, 5)}`]"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {{ t.name.charAt(0) }}
            </span>
            <div>
              <p class="font-semibold">{{ t.name }}</p>
              <p class="text-sm text-muted-foreground">{{ t.email }}</p>
            </div>
          </div>
          <BaseBadge :tone="t.status === 'active' ? 'success' : 'danger'" dot>{{ t.status }}</BaseBadge>
        </div>
        <p class="mt-3 text-sm text-muted-foreground">Active jobs: <span class="font-medium text-foreground">{{ loadFor(t.name) }}</span></p>
      </BaseCard>
    </div>
  </DashboardLayout>
</template>
