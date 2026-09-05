<script setup lang="ts">
import { computed } from 'vue'
import { Truck, Check } from 'lucide-vue-next'
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

const pickups = computed(() => tasks.items.filter((t) => t.type === 'pickup' && t.status !== 'completed'))

function accept(id: string) {
  tasks.update(id, { driverName: auth.user?.name, status: 'on-the-way' })
}
function complete(id: string) {
  tasks.update(id, { status: 'completed' })
}
</script>

<template>
  <DashboardLayout title="Pickups" :nav-items="driverNav">
    <PageHeader title="Pickups" subtitle="Accept and complete vehicle pickups." />

    <EmptyState v-if="pickups.length === 0" :icon="Truck" title="No pickups pending" description="New pickup requests will show up here." />

    <BaseCard
      v-for="(t, idx) in pickups"
      :key="t.id"
      hover
      :class="['reveal mb-4 p-5', `reveal-delay-${Math.min(idx + 1, 5)}`]"
    >
      <p class="font-semibold">{{ t.name }} — {{ t.model }} ({{ t.plate }})</p>
      <p class="text-sm text-muted-foreground">{{ t.address }}</p>
      <p class="text-sm text-muted-foreground">Scheduled: {{ new Date(t.scheduledTime).toLocaleString() }}</p>
      <div class="mt-3 flex gap-2">
        <BaseButton v-if="t.status === 'pending'" size="sm" @click="accept(t.id)">Accept</BaseButton>
        <BaseButton v-else size="sm" variant="outline" @click="complete(t.id)"><Check :size="14" /> Mark picked up</BaseButton>
      </div>
    </BaseCard>
  </DashboardLayout>
</template>
