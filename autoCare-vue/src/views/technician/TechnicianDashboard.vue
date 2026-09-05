<script setup lang="ts">
import { computed } from 'vue'
import { ClipboardList, Activity, CheckCircle2, Wrench } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import StatCard from '@/components/common/StatCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { technicianNav } from '@/navigation'
import { useJobsStore } from '@/stores/data'
import { useAuthStore } from '@/stores/auth'

const jobs = useJobsStore()
const auth = useAuthStore()

const myJobs = computed(() => jobs.items.filter((j) => j.technicianName === auth.user?.name))
const active = computed(() => myJobs.value.filter((j) => j.status !== 'completed'))
</script>

<template>
  <DashboardLayout title="My Dashboard" :nav-items="technicianNav">
    <PageHeader title="My dashboard" :subtitle="`Welcome back, ${auth.user?.name ?? 'technician'}.`" />

    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard label="Assigned jobs" :value="myJobs.length" :icon="ClipboardList" tone="primary" />
      <StatCard label="In progress" :value="active.length" :icon="Activity" tone="warning" />
      <StatCard label="Completed" :value="myJobs.length - active.length" :icon="CheckCircle2" tone="success" />
    </div>

    <BaseCard class="reveal reveal-delay-2 mt-6 p-5">
      <h2 class="mb-4 font-semibold">Today's jobs</h2>
      <EmptyState v-if="active.length === 0" :icon="Wrench" title="No jobs assigned" description="New jobs assigned to you will show up here." />
      <div v-for="job in active" :key="job.id" class="flex items-center justify-between border-b border-border py-3 last:border-0">
        <div>
          <p class="font-medium">{{ job.serviceType }} — {{ job.model }}</p>
          <p class="text-sm text-muted-foreground">{{ job.name }}</p>
        </div>
        <BaseBadge dot>{{ job.status }}</BaseBadge>
      </div>
    </BaseCard>
  </DashboardLayout>
</template>
