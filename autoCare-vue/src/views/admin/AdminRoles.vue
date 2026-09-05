<script setup lang="ts">
import { CheckCircle2, User, Briefcase, Wrench, Truck, ShieldCheck } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { adminNav } from '@/navigation'

const roles = [
  { name: 'customer', icon: User, permissions: ['Book service', 'Track progress', 'View reports'] },
  { name: 'manager', icon: Briefcase, permissions: ['Assign jobs', 'Manage inventory', 'View shop reports'] },
  { name: 'technician', icon: Wrench, permissions: ['Update job status', 'Request parts', 'Submit reports'] },
  { name: 'driver', icon: Truck, permissions: ['Accept pickups', 'Accept deliveries', 'View trip history'] },
  { name: 'admin', icon: ShieldCheck, permissions: ['Manage users', 'Manage roles', 'View system logs & health'] },
]
</script>

<template>
  <DashboardLayout title="Roles & Permissions" :nav-items="adminNav">
    <PageHeader title="Roles & permissions" subtitle="What each role can see and do across Auto Care." />

    <div class="grid gap-4 sm:grid-cols-2">
      <BaseCard
        v-for="(r, idx) in roles"
        :key="r.name"
        hover
        :class="['reveal p-5', `reveal-delay-${idx + 1}`]"
      >
        <div class="mb-3 flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <component :is="r.icon" :size="20" />
          </span>
          <p class="font-semibold capitalize">{{ r.name }}</p>
        </div>
        <ul class="space-y-1.5 text-sm text-muted-foreground">
          <li v-for="p in r.permissions" :key="p" class="flex items-center gap-2">
            <CheckCircle2 :size="14" class="shrink-0 text-success" /> {{ p }}
          </li>
        </ul>
      </BaseCard>
    </div>
  </DashboardLayout>
</template>
