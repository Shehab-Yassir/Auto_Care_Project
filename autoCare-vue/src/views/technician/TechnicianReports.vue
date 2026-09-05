<script setup lang="ts">
import { ref } from 'vue'
import { FileText, Send } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { technicianNav } from '@/navigation'
import { useReportsStore } from '@/stores/data'
import { useAuthStore } from '@/stores/auth'

const reports = useReportsStore()
const auth = useAuthStore()

const jobId = ref('')
const diagnosis = ref('')
const workPerformed = ref('')

function submit() {
  reports.add({
    jobId: jobId.value,
    technicianName: auth.user?.name ?? 'Unknown',
    diagnosis: diagnosis.value,
    workPerformed: workPerformed.value,
    status: 'submitted',
    createdAt: new Date().toISOString(),
  })
  jobId.value = ''
  diagnosis.value = ''
  workPerformed.value = ''
}
</script>

<template>
  <DashboardLayout title="Repair Reports" :nav-items="technicianNav">
    <PageHeader title="Repair reports" subtitle="Document diagnosis and work performed for each job." />

    <BaseCard class="reveal mb-6 p-5">
      <h2 class="mb-4 font-semibold">Submit a report</h2>
      <form @submit.prevent="submit" class="flex flex-col gap-3">
        <BaseInput v-model="jobId" placeholder="Job ID" required />
        <textarea v-model="diagnosis" placeholder="Diagnosis" required class="min-h-[70px] rounded-lg border border-border bg-background p-3 text-sm outline-none transition-shadow focus-ring" />
        <textarea v-model="workPerformed" placeholder="Work performed" required class="min-h-[70px] rounded-lg border border-border bg-background p-3 text-sm outline-none transition-shadow focus-ring" />
        <BaseButton type="submit"><Send :size="16" /> Submit report</BaseButton>
      </form>
    </BaseCard>

    <EmptyState
      v-if="reports.items.filter(x => x.technicianName === auth.user?.name).length === 0"
      :icon="FileText"
      title="No reports submitted yet"
      description="Reports you submit will appear here."
    />

    <BaseCard
      v-for="(r, idx) in reports.items.filter(x => x.technicianName === auth.user?.name)"
      :key="r.id"
      hover
      :class="['reveal mb-3 p-4', `reveal-delay-${Math.min(idx + 1, 5)}`]"
    >
      <p class="font-medium">Job {{ r.jobId }} — <span class="capitalize">{{ r.status }}</span></p>
      <p class="text-sm text-muted-foreground">{{ r.diagnosis }}</p>
    </BaseCard>
  </DashboardLayout>
</template>
