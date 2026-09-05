<script setup lang="ts">
import { computed } from 'vue'
import { PackageCheck, Check } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { driverNav } from '@/navigation'
import { useTasksStore } from '@/stores/data'
import { useAuthStore } from '@/stores/auth'

const tasks = useTasksStore()
const auth = useAuthStore()

const deliveries = computed(() => tasks.items.filter((t) => t.type === 'delivery' && t.status !== 'completed'))

function accept(id: string) {
  tasks.update(id, { driverName: auth.user?.name, status: 'on-the-way' })
}
function complete(id: string) {
  tasks.update(id, { status: 'completed' })
}
</script>

<template>
  <DashboardLayout title="Deliveries" :nav-items="driverNav">
    <PageHeader title="Deliveries" subtitle="Accept and complete vehicle deliveries." />

    <EmptyState v-if="deliveries.length === 0" :icon="PackageCheck" title="No deliveries pending" description="New deliveries will show up here as they're scheduled." />

    <BaseCard
      v-for="(t, idx) in deliveries"
      :key="t.id"
      hover
      :class="['reveal mb-4 p-5', `reveal-delay-${Math.min(idx + 1, 5)}`]"
    >
      <p class="font-semibold">{{ t.name }} — {{ t.model }} ({{ t.plate }})</p>
      <p class="text-sm text-muted-foreground">{{ t.address }}</p>
      <p class="text-sm text-muted-foreground">Scheduled: {{ new Date(t.scheduledTime).toLocaleString() }}</p>
      <div class="mt-3 flex gap-2">
        <BaseButton v-if="t.status === 'pending'" size="sm" @click="accept(t.id)">Accept</BaseButton>
        <BaseButton v-else size="sm" variant="outline" @click="complete(t.id)"><Check :size="14" /> Mark delivered</BaseButton>
      </div>
    </BaseCard>
  </DashboardLayout>
</template>
