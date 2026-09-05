<script setup lang="ts">
import { computed } from 'vue'
import { DollarSign, CheckCircle2, Briefcase } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import StatCard from '@/components/common/StatCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { managerNav } from '@/navigation'
import { useJobsStore } from '@/stores/data'

const jobs = useJobsStore()

const byService = computed(() => {
  const map = new Map<string, number>()
  jobs.items.forEach((j) => map.set(j.serviceType, (map.get(j.serviceType) ?? 0) + 1))
  return [...map.entries()]
})
const revenue = computed(() => jobs.items.reduce((s, j) => s + j.laborCost + j.partsCost, 0))
const completedCount = computed(() => jobs.items.filter((j) => j.status === 'completed').length)
</script>

<template>
  <DashboardLayout title="Shop Reports" :nav-items="managerNav">
    <PageHeader title="Shop reports" subtitle="Revenue and job-mix insights for the whole shop." />

    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard label="Total revenue" :value="`$${revenue.toFixed(0)}`" :icon="DollarSign" tone="success" />
      <StatCard label="Completed jobs" :value="completedCount" :icon="CheckCircle2" tone="primary" />
      <StatCard label="Total jobs" :value="jobs.items.length" :icon="Briefcase" tone="accent" />
    </div>

    <BaseCard class="reveal reveal-delay-2 mt-6 p-5">
      <h2 class="mb-4 font-semibold">Jobs by service type</h2>
      <p v-if="byService.length === 0" class="text-sm text-muted-foreground">No jobs recorded yet.</p>
      <div v-for="[name, count] in byService" :key="name" class="mb-3 flex items-center gap-3">
        <span class="w-40 shrink-0 text-sm">{{ name }}</span>
        <div class="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            class="h-2 rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-700 ease-out"
            :style="{ width: `${(count / jobs.items.length) * 100}%` }"
          />
        </div>
        <span class="w-6 text-right text-sm text-muted-foreground">{{ count }}</span>
      </div>
    </BaseCard>
  </DashboardLayout>
</template>
