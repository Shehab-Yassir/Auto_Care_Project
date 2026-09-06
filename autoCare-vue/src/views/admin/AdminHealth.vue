<script setup lang="ts">
import { Server, ShieldCheck, Bell, Database } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { adminNav } from '@/navigation'

const services = [
  { name: 'Booking service', status: 'operational', icon: Server },
  { name: 'Auth', status: 'operational', icon: ShieldCheck },
  { name: 'Notifications', status: 'operational', icon: Bell },
  { name: 'Storage', status: 'operational', icon: Database },
]
</script>

<template>
  <DashboardLayout title="System Health" :nav-items="adminNav">
    <PageHeader title="System health" subtitle="Sample service status for the demo; not live monitoring." />

    <div class="grid gap-4 sm:grid-cols-2">
      <BaseCard
        v-for="(s, idx) in services"
        :key="s.name"
        hover
        :class="['reveal flex items-center justify-between p-5', `reveal-delay-${idx + 1}`]"
      >
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
            <component :is="s.icon" :size="20" />
          </span>
          <span class="font-medium">{{ s.name }}</span>
        </div>
        <BaseBadge tone="success" dot>{{ s.status }}</BaseBadge>
      </BaseCard>
    </div>
  </DashboardLayout>
</template>
