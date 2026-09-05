<script setup lang="ts">
import { computed } from 'vue'
import { FileText, DollarSign } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import StatCard from '@/components/common/StatCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { customerNav } from '@/navigation'
import { useJobsStore } from '@/stores/data'

const jobs = useJobsStore()
const completed = computed(() => jobs.items.filter((j) => j.status === 'completed'))
const totalSpent = computed(() => completed.value.reduce((sum, j) => sum + j.laborCost + j.partsCost, 0))
</script>

<template>
  <DashboardLayout title="Service Reports" :nav-items="customerNav">
    <PageHeader title="Service reports" subtitle="A history of every completed service and what it cost." />

    <StatCard label="Total spent" :value="`$${totalSpent.toFixed(2)}`" :icon="DollarSign" tone="success" class="mb-6" />

    <EmptyState v-if="completed.length === 0" :icon="FileText" title="No completed services yet" description="Once a job is marked complete, it will show up here." />

    <BaseCard
      v-for="(job, idx) in completed"
      :key="job.id"
      hover
      :class="['reveal mb-4 p-5', `reveal-delay-${Math.min(idx + 1, 5)}`]"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="font-semibold">{{ job.serviceType }} — {{ job.model }}</p>
          <p class="text-sm text-muted-foreground">{{ new Date(job.createdAt).toLocaleDateString() }}</p>
        </div>
        <p class="font-semibold">${{ (job.laborCost + job.partsCost).toFixed(2) }}</p>
      </div>
    </BaseCard>
  </DashboardLayout>
</template>
