<script setup lang="ts">
import { computed } from 'vue'
import { History, PackageCheck, Truck } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { driverNav } from '@/navigation'
import { useTasksStore } from '@/stores/data'
import { useAuthStore } from '@/stores/auth'

const tasks = useTasksStore()
const auth = useAuthStore()

const completed = computed(() =>
  tasks.items
    .filter((t) => t.status === 'completed' && (t.driverName === auth.user?.name || !t.driverName))
    .sort((a, b) => +new Date(b.scheduledTime) - +new Date(a.scheduledTime)),
)
</script>

<template>
  <DashboardLayout title="Trip History" :nav-items="driverNav">
    <PageHeader title="Trip history" subtitle="A record of every pickup and delivery you've completed." />

    <EmptyState v-if="completed.length === 0" :icon="History" title="No completed trips yet" description="Finished pickups and deliveries will show up here." />

    <BaseCard
      v-for="(t, idx) in completed"
      :key="t.id"
      hover
      :class="['reveal mb-4 flex items-center justify-between p-5', `reveal-delay-${Math.min(idx + 1, 5)}`]"
    >
      <div class="flex items-center gap-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
          <component :is="t.type === 'delivery' ? PackageCheck : Truck" :size="20" />
        </span>
        <div>
          <p class="font-medium capitalize">{{ t.type }} — {{ t.name }}</p>
          <p class="text-sm text-muted-foreground">{{ t.address }}</p>
        </div>
      </div>
      <div class="text-right">
        <BaseBadge tone="success" dot>completed</BaseBadge>
        <p class="mt-1 text-xs text-muted-foreground">{{ new Date(t.scheduledTime).toLocaleDateString() }}</p>
      </div>
    </BaseCard>
  </DashboardLayout>
</template>
