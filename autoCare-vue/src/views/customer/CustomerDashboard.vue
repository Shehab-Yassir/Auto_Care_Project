<script setup lang="ts">
import { computed } from 'vue'
import { Activity, Briefcase, Award, ClipboardList, Calendar, MapPin, Wrench } from 'lucide-vue-next'
import DashboardActions from '@/components/common/DashboardActions.vue'
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

const myJobs = computed(() => jobs.items.filter((j) => j.name === auth.user?.name))
const activeCount = computed(() => myJobs.value.filter((j) => j.status !== 'completed').length)
const activeService = computed(() => myJobs.value.find((j) => j.status !== 'completed'))
const progress = computed(() => ({ pending: 10, assigned: 30, 'in-progress': 65, 'waiting-parts': 75, completed: 100 })[activeService.value?.status ?? 'pending'])
const actions = [
  { to: '/customer/booking', title: 'Book Service', description: 'Schedule a maintenance appointment', icon: Calendar },
  { to: '/customer/pickup', title: 'Request Pickup', description: "We'll pick up your car", icon: MapPin },
  { to: '/customer/progress', title: 'Track Progress', description: 'View repair status', icon: ClipboardList },
]
const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'

const toneFor = (status: string) =>
  status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'info'
</script>

<template>
  <DashboardLayout title="My Dashboard" :nav-items="customerNav">
    <PageHeader :title="`${greeting}, ${auth.user?.name.split(' ')[0] ?? 'friend'}!`" subtitle="Here's what's happening with your vehicles" />
    <DashboardActions :items="actions" />

    <section v-if="activeService" class="mb-8 rounded-2xl bg-gradient-to-r from-[#103b78] to-[#3c608c] p-6 text-white">
      <div class="flex flex-wrap items-center gap-4">
        <span class="rounded-xl bg-white/15 p-3"><Wrench :size="28" /></span>
        <div class="flex-1"><p class="text-sm text-blue-100">Active Service</p><h2 class="text-xl font-bold">{{ activeService.serviceType }} — {{ activeService.model }}</h2><p class="text-sm capitalize text-blue-100">{{ activeService.status.replace(/-/g, ' ') }}</p></div>
        <router-link to="/customer/progress" class="rounded-xl bg-white/90 px-4 py-3 text-sm font-medium text-slate-800">Track Progress →</router-link>
      </div>
      <div class="mb-2 mt-6 flex justify-between text-sm"><span>Progress</span><span>{{ progress }}%</span></div>
      <div role="progressbar" :aria-valuenow="progress" :aria-valuemin="0" :aria-valuemax="100" aria-label="Service progress" class="h-2 rounded-full bg-white/20"><div class="h-full rounded-full bg-white" :style="{ width: `${progress}%` }" /></div>
    </section>

    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard label="Active jobs" :value="activeCount" :icon="Activity" tone="primary" />
      <StatCard label="Total jobs" :value="myJobs.length" :icon="ClipboardList" tone="accent" />
      <StatCard label="Loyalty tier" value="Gold" :icon="Award" tone="warning" />
    </div>

    <BaseCard class="reveal reveal-delay-2 mt-6 p-5">
      <div class="mb-4 flex items-center justify-between"><h2 class="font-semibold">Recent Bookings</h2><router-link to="/customer/progress" class="text-sm text-primary">View all →</router-link></div>
      <EmptyState
        v-if="myJobs.length === 0"
        :icon="Briefcase"
        title="No service history yet"
        description="Book your first appointment to see activity here."
      />
      <TransitionGroup v-else name="list" tag="div">
        <div v-for="job in myJobs.slice(0, 5)" :key="job.id" class="flex items-center justify-between border-b border-border py-3 last:border-0">
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
