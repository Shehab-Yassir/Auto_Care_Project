<script setup lang="ts">
import { ref, computed } from 'vue'
import { PackageSearch, Send } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { technicianNav } from '@/navigation'
import { useJobsStore, usePartRequestsStore } from '@/stores/data'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const partRequests = usePartRequestsStore()
const auth = useAuthStore()
const jobs = useJobsStore()
const toast = useToast()

const partName = ref('')
const quantity = ref(1)
const jobId = ref('')

const myRequests = computed(() => partRequests.items.filter((r) => r.technicianName === auth.user?.name))

function submit() {
  if (!jobs.items.some((job) => job.id === jobId.value.trim() && job.technicianName === auth.user?.name)) {
    toast.error('Enter the ID of a job assigned to you.')
    return
  }
  if (!partName.value.trim() || !Number.isInteger(quantity.value) || quantity.value < 1) {
    toast.error('Enter a part name and a positive whole-number quantity.')
    return
  }
  const created = partRequests.add({
    jobId: jobId.value.trim(),
    technicianName: auth.user?.name ?? 'Unknown',
    partName: partName.value.trim(),
    quantity: quantity.value,
    urgency: 'normal',
    status: 'pending',
    requestedAt: new Date().toISOString(),
  })
  if (!created) {
    toast.error(partRequests.error ?? 'Could not save the request.')
    return
  }
  toast.success('Part request submitted.')
  partName.value = ''
  jobId.value = ''
  quantity.value = 1
}

const toneFor = (s: string) => (s === 'approved' ? 'success' : s === 'rejected' ? 'danger' : 'warning')
</script>

<template>
  <DashboardLayout title="Parts Requests" :nav-items="technicianNav">
    <PageHeader title="Parts requests" subtitle="Request parts you need and track approval status." />

    <BaseCard class="reveal mb-6 p-5">
      <h2 class="mb-4 font-semibold">Request a part</h2>
      <form @submit.prevent="submit" class="grid gap-3 sm:grid-cols-3">
        <BaseInput v-model="jobId" placeholder="Job ID (e.g. job-001)" required />
        <BaseInput v-model="partName" placeholder="Part name" required />
        <input
          v-model.number="quantity"
          type="number"
          min="1"
          placeholder="Quantity"
          required
          class="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-shadow focus-ring"
        />
        <BaseButton type="submit" class="sm:col-span-3"><Send :size="16" /> Submit request</BaseButton>
      </form>
    </BaseCard>

    <EmptyState v-if="myRequests.length === 0" :icon="PackageSearch" title="No part requests yet" description="Requests you submit will show up here with their status." />

    <BaseCard
      v-for="(r, idx) in myRequests"
      :key="r.id"
      hover
      :class="['reveal mb-3 flex items-center justify-between p-4', `reveal-delay-${Math.min(idx + 1, 5)}`]"
    >
      <div>
        <p class="font-medium">{{ r.partName }} × {{ r.quantity }}</p>
        <p class="text-sm text-muted-foreground">Job {{ r.jobId }}</p>
      </div>
      <BaseBadge :tone="toneFor(r.status)" dot>{{ r.status }}</BaseBadge>
    </BaseCard>
  </DashboardLayout>
</template>
