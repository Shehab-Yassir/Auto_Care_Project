<script setup lang="ts">
import { computed } from 'vue'
import { ClipboardList, Activity, PackageX, DollarSign, Briefcase } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import StatCard from '@/components/common/StatCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { managerNav } from '@/navigation'
import { useJobsStore, useInventoryStore } from '@/stores/data'

const jobs = useJobsStore()
const inventory = useInventoryStore()

const pending = computed(() => jobs.items.filter((j) => j.status === 'pending').length)
const inProgress = computed(() => jobs.items.filter((j) => j.status === 'in-progress').length)
const lowStock = computed(() => inventory.items.filter((i) => i.quantity <= i.minQuantity).length)
const revenue = computed(() => jobs.items.reduce((sum, j) => sum + j.laborCost + j.partsCost, 0))
</script>

<template>
  <DashboardLayout title="Shop Overview" :nav-items="managerNav">
    <PageHeader title="Shop overview" subtitle="A snapshot of everything happening across the shop today." />

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Pending requests" :value="pending" :icon="ClipboardList" tone="warning" />
      <StatCard label="In progress" :value="inProgress" :icon="Activity" tone="primary" />
      <StatCard label="Low stock items" :value="lowStock" :icon="PackageX" tone="danger" />
      <StatCard label="Revenue" :value="`$${revenue.toFixed(0)}`" :icon="DollarSign" tone="success" />
    </div>

    <BaseCard class="reveal reveal-delay-2 mt-6 p-5">
      <h2 class="mb-4 font-semibold">All jobs</h2>
      <EmptyState v-if="jobs.items.length === 0" :icon="Briefcase" title="No jobs yet" description="Jobs booked by customers will appear here." />
      <div v-else class="max-h-96 overflow-y-auto">
        <div v-for="job in jobs.items" :key="job.id" class="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
          <span>{{ job.name }} — {{ job.serviceType }}</span>
          <span class="capitalize text-muted-foreground">{{ job.status }}</span>
        </div>
      </div>
    </BaseCard>
  </DashboardLayout>
</template>
