<script setup lang="ts">
import { computed } from 'vue'
import { Activity, Briefcase, Award, ClipboardList } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import StatCard from '@/components/common/StatCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { customerNav } from '@/navigation'
import { useJobsStore } from '@/stores/data'
import { useAuthStore } from '@/stores/auth'

const jobs = useJobsStore()
const auth = useAuthStore()

const myJobs = computed(() => jobs.items.filter((j) => j.name === auth.user?.name).slice(0, 5))
const activeCount = computed(() => myJobs.value.filter((j) => j.status !== 'completed').length)

const toneFor = (status: string) =>
  status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'info'
</script>

<template>
  <DashboardLayout title="My Dashboard" :nav-items="customerNav">
    <PageHeader title="Welcome back" :subtitle="`Here's what's happening with your vehicle, ${auth.user?.name ?? 'friend'}.`" />

    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard label="Active jobs" :value="activeCount" :icon="Activity" tone="primary" />
      <StatCard label="Total jobs" :value="myJobs.length" :icon="ClipboardList" tone="accent" />
      <StatCard label="Loyalty tier" value="Gold" :icon="Award" tone="warning" />
    </div>

    <BaseCard class="reveal reveal-delay-2 mt-6 p-5">
      <h2 class="mb-4 font-semibold">Recent activity</h2>
      <EmptyState
        v-if="myJobs.length === 0"
        :icon="Briefcase"
        title="No service history yet"
        description="Book your first appointment to see activity here."
      />
      <TransitionGroup v-else name="list" tag="div">
        <div v-for="job in myJobs" :key="job.id" class="flex items-center justify-between border-b border-border py-3 last:border-0">
          <div>
            <p class="font-medium">{{ job.serviceType }} — {{ job.model }}</p>
            <p class="text-sm text-muted-foreground">{{ new Date(job.createdAt).toLocaleDateString() }}</p>
          </div>
          <BaseBadge :tone="toneFor(job.status)" dot>{{ job.status }}</BaseBadge>
        </div>
      </TransitionGroup>
    </BaseCard>
  </DashboardLayout>
</template>

<style scoped>
.list-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.list-enter-from { opacity: 0; transform: translateX(-8px); }
</style>
