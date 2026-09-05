<script setup lang="ts">
import { computed } from 'vue'
import { ScrollText } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { adminNav } from '@/navigation'
import { useJobsStore, useTasksStore, usePartRequestsStore } from '@/stores/data'

// Rather than maintaining a separate ActivityLog collection (as the React
// version did), logs are derived on the fly from the entities that already
// changed. One less store to keep in sync.
const jobs = useJobsStore()
const tasks = useTasksStore()
const partRequests = usePartRequestsStore()

const entries = computed(() => [
  ...jobs.items.map((j) => ({ text: `Job ${j.id} — ${j.serviceType} (${j.status})`, at: j.createdAt })),
  ...tasks.items.map((t) => ({ text: `Task ${t.id} — ${t.type} (${t.status})`, at: t.scheduledTime })),
  ...partRequests.items.map((p) => ({ text: `Part request ${p.id} — ${p.partName} (${p.status})`, at: p.requestedAt })),
].sort((a, b) => +new Date(b.at) - +new Date(a.at)))
</script>

<template>
  <DashboardLayout title="Activity Logs" :nav-items="adminNav">
    <PageHeader title="Activity logs" subtitle="A live timeline of activity across jobs, tasks, and parts." />

    <EmptyState v-if="entries.length === 0" :icon="ScrollText" title="No activity yet" description="System activity will appear here as it happens." />

    <BaseCard v-else class="reveal p-5">
      <TransitionGroup name="list" tag="div">
        <div v-for="(e, i) in entries" :key="i" class="flex items-center gap-3 border-b border-border py-2.5 text-sm last:border-0">
          <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span class="flex-1">{{ e.text }}</span>
          <span class="shrink-0 text-muted-foreground">{{ new Date(e.at).toLocaleString() }}</span>
        </div>
      </TransitionGroup>
    </BaseCard>
  </DashboardLayout>
</template>

<style scoped>
.list-enter-active { transition: opacity 0.3s ease; }
.list-enter-from { opacity: 0; }
</style>
