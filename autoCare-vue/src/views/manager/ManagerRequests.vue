<script setup lang="ts">
import { ClipboardList } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { managerNav } from '@/navigation'
import { useJobsStore, useUsersStore } from '@/stores/data'

const jobs = useJobsStore()
const users = useUsersStore()
const technicians = () => users.items.filter((u) => u.role === 'technician')

function assign(jobId: string, techName: string) {
  jobs.update(jobId, { technicianName: techName, status: 'assigned' })
}
</script>

<template>
  <DashboardLayout title="Service Requests" :nav-items="managerNav">
    <PageHeader title="Service requests" subtitle="Review incoming jobs and assign them to a technician." />

    <EmptyState v-if="jobs.items.length === 0" :icon="ClipboardList" title="No requests yet" description="Customer bookings will appear here for you to assign." />

    <BaseCard
      v-for="(job, idx) in jobs.items"
      :key="job.id"
      hover
      :class="['reveal mb-4 p-5', `reveal-delay-${Math.min(idx + 1, 5)}`]"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="font-semibold">{{ job.name }} — {{ job.serviceType }}</p>
          <p class="text-sm text-muted-foreground">{{ job.model }} · {{ job.plate }}</p>
          <p class="mt-1 text-sm">{{ job.description }}</p>
        </div>
        <BaseBadge :tone="job.priority === 'urgent' || job.priority === 'high' ? 'danger' : 'default'">{{ job.priority }}</BaseBadge>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <select
          class="h-9 rounded-lg border border-border bg-background px-2 text-sm outline-none transition-shadow focus-ring"
          :value="job.technicianName ?? ''"
          @change="assign(job.id, ($event.target as HTMLSelectElement).value)"
        >
          <option value="" disabled>Assign technician</option>
          <option v-for="t in technicians()" :key="t.id" :value="t.name">{{ t.name }}</option>
        </select>
        <BaseBadge dot>{{ job.status }}</BaseBadge>
      </div>
    </BaseCard>
  </DashboardLayout>
</template>
