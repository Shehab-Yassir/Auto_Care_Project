<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Navigation, Truck as TruckIcon } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import StatCard from '@/components/common/StatCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import DashboardActions from '@/components/common/DashboardActions.vue'
import { driverNav } from '@/navigation'
import { useTasksStore } from '@/stores/data'
import { useAuthStore } from '@/stores/auth'

const tasks = useTasksStore()
const auth = useAuthStore()

const myTasks = computed(() => tasks.items.filter((t) => t.driverName === auth.user?.name || !t.driverName))
const pending = computed(() => myTasks.value.filter((t) => t.status === 'pending').length)
const onTheWay = computed(() => myTasks.value.filter((t) => t.status === 'on-the-way').length)
</script>

<template>
  <DashboardLayout title="My Dashboard" :nav-items="driverNav">
    <PageHeader title="Driver Dashboard" subtitle="Manage your pickup and delivery tasks" />

    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard label="Pending tasks" :value="pending" :icon="Clock" tone="warning" />
      <StatCard label="On the way" :value="onTheWay" :icon="Navigation" tone="primary" />
      <StatCard label="Total assigned" :value="myTasks.length" :icon="TruckIcon" tone="accent" />
    </div>

    <DashboardActions :items="[
      { to: '/driver/pickups', title: 'Pickup Tasks', description: 'View and manage pickup requests', icon: TruckIcon },
      { to: '/driver/deliveries', title: 'Deliveries', description: 'Deliver completed vehicles', icon: Navigation },
    ]" />
    <BaseCard class="reveal reveal-delay-2 mt-6 p-5">
      <div class="mb-4 flex justify-between"><h2 class="font-semibold">Today's Tasks</h2><router-link to="/driver/history" class="text-sm text-primary">View history →</router-link></div>
      <EmptyState v-if="myTasks.length === 0" :icon="TruckIcon" title="No tasks right now" description="Pickup and delivery tasks will appear here." />
      <div v-for="t in myTasks" :key="t.id" class="flex items-center justify-between border-b border-border py-3 last:border-0">
        <div>
          <p class="font-medium capitalize">{{ t.type }} — {{ t.name }}</p>
          <p class="text-sm text-muted-foreground">{{ t.address }}</p>
          <p class="mt-1 text-xs text-muted-foreground">{{ new Date(t.scheduledTime).toLocaleString() }}</p>
        </div>
        <BaseBadge dot>{{ t.status }}</BaseBadge>
        <router-link :to="t.type === 'pickup' ? '/driver/pickups' : '/driver/deliveries'" class="text-sm text-primary">View →</router-link>
      </div>
    </BaseCard>
  </DashboardLayout>
</template>
