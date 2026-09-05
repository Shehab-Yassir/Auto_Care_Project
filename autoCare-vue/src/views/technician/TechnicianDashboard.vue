<script setup lang="ts">
import { computed } from 'vue'
import { ClipboardList, Activity, CheckCircle2, Wrench } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import StatCard from '@/components/common/StatCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import DashboardActions from '@/components/common/DashboardActions.vue'
import { PackageSearch, FileText } from 'lucide-vue-next'
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
    <PageHeader title="Technician Dashboard" subtitle="Manage your assigned jobs and requests" />

    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard label="Assigned jobs" :value="myJobs.length" :icon="ClipboardList" tone="primary" />
      <StatCard label="In progress" :value="active.length" :icon="Activity" tone="warning" />
      <StatCard label="Completed" :value="myJobs.length - active.length" :icon="CheckCircle2" tone="success" />
    </div>

    <DashboardActions :items="[
      { to: '/technician/jobs', title: 'My Jobs', description: 'View and manage assigned jobs', icon: Wrench },
      { to: '/technician/parts', title: 'Request Parts', description: 'Request spare parts for repairs', icon: PackageSearch },
      { to: '/technician/reports', title: 'Submit Report', description: 'Complete repair reports', icon: FileText },
    ]" />
    <BaseCard class="reveal reveal-delay-2 mt-6 p-5">
      <div class="mb-4 flex justify-between"><h2 class="font-semibold">My Assigned Jobs</h2><router-link to="/technician/jobs" class="text-sm text-primary">View all →</router-link></div>
      <EmptyState v-if="active.length === 0" :icon="Wrench" title="No jobs assigned" description="New jobs assigned to you will show up here." />
      <div v-for="job in active" :key="job.id" class="flex items-center justify-between border-b border-border py-3 last:border-0">
        <div>
          <p class="font-medium">{{ job.serviceType }} — {{ job.model }}</p>
          <p class="text-sm text-muted-foreground">{{ job.name }}</p>
        </div>
        <BaseBadge dot>{{ job.status }}</BaseBadge>
        <router-link to="/technician/jobs" class="text-sm text-primary">Update →</router-link>
      </div>
    </BaseCard>
  </DashboardLayout>
</template>
