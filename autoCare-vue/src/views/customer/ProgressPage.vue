<script setup lang="ts">
import { computed } from 'vue'
import { Activity, User } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { customerNav } from '@/navigation'
import { useJobsStore } from '@/stores/data'
import type { JobStatus } from '@/types/index'

const jobs = useJobsStore()

const steps: JobStatus[] = ['pending', 'assigned', 'in-progress', 'waiting-parts', 'completed']
const activeJobs = computed(() => jobs.items.filter((j) => j.status !== 'completed'))

function stepIndex(status: JobStatus) {
  return steps.indexOf(status)
}
</script>

<template>
  <DashboardLayout title="Repair Progress" :nav-items="customerNav">
    <PageHeader title="Repair progress" subtitle="Live status for every vehicle currently in the shop." />

    <EmptyState v-if="activeJobs.length === 0" :icon="Activity" title="No active repairs" description="Everything is caught up — nothing is currently in progress." />

    <BaseCard
      v-for="(job, idx) in activeJobs"
      :key="job.id"
      hover
      :class="['reveal mb-4 p-5', `reveal-delay-${Math.min(idx + 1, 5)}`]"
    >
      <div class="mb-4 flex items-center justify-between">
        <p class="font-semibold">{{ job.serviceType }} — {{ job.model }}</p>
        <span class="text-sm text-muted-foreground">{{ job.plate }}</span>
      </div>
      <div class="flex items-center">
        <template v-for="(step, i) in steps.slice(0, 4)" :key="step">
          <div class="flex flex-col items-center">
            <div
              :class="[
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all duration-500',
                i <= stepIndex(job.status) ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-secondary text-muted-foreground',
                i === stepIndex(job.status) ? 'animate-pulse-ring' : '',
              ]"
            >
              {{ i + 1 }}
            </div>
            <span class="mt-1 max-w-[70px] text-center text-[11px] capitalize text-muted-foreground">{{ step.replace('-', ' ') }}</span>
          </div>
          <div v-if="i < 3" :class="['h-0.5 flex-1 transition-colors duration-500', i < stepIndex(job.status) ? 'bg-primary' : 'bg-secondary']" />
        </template>
      </div>
      <p v-if="job.technicianName" class="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <User :size="14" /> Technician: {{ job.technicianName }}
      </p>
    </BaseCard>
  </DashboardLayout>
</template>
