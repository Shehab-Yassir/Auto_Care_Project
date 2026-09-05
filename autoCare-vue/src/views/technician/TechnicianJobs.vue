<script setup lang="ts">
import { computed } from 'vue'
import { Wrench, ArrowRight } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { technicianNav } from '@/navigation'
import { useJobsStore } from '@/stores/data'
import { useAuthStore } from '@/stores/auth'
import type { JobStatus } from '@/types/index'

const jobs = useJobsStore()
const auth = useAuthStore()

const myJobs = computed(() => jobs.items.filter((j) => j.technicianName === auth.user?.name))

const nextStatus: Record<JobStatus, JobStatus> = {
  pending: 'assigned',
  assigned: 'in-progress',
  'in-progress': 'completed',
  'waiting-parts': 'in-progress',
  completed: 'completed',
}

function advance(id: string, status: JobStatus) {
  jobs.update(id, { status: nextStatus[status] })
}
</script>

<template>
  <DashboardLayout title="My Jobs" :nav-items="technicianNav">
    <PageHeader title="My jobs" subtitle="Work through your assigned jobs and update status as you go." />

    <EmptyState v-if="myJobs.length === 0" :icon="Wrench" title="No jobs assigned to you yet" description="Once a manager assigns a job, it will appear here." />

    <BaseCard
      v-for="(job, idx) in myJobs"
      :key="job.id"
      hover
      :class="['reveal mb-4 p-5', `reveal-delay-${Math.min(idx + 1, 5)}`]"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="font-semibold">{{ job.serviceType }} — {{ job.model }} ({{ job.plate }})</p>
          <p class="text-sm text-muted-foreground">{{ job.description }}</p>
        </div>
        <BaseBadge dot>{{ job.status }}</BaseBadge>
      </div>
      <BaseButton v-if="job.status !== 'completed'" size="sm" class="mt-3" @click="advance(job.id, job.status)">
        Mark as {{ nextStatus[job.status].replace('-', ' ') }} <ArrowRight :size="14" />
      </BaseButton>
    </BaseCard>
  </DashboardLayout>
</template>
