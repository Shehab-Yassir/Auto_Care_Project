<script setup lang="ts">
import { ref } from 'vue'
import { CheckCircle2, MapPin, AlertCircle } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { customerNav } from '@/navigation'
import { useTasksStore } from '@/stores/data'
import { useAuthStore } from '@/stores/auth'

const tasks = useTasksStore()
const auth = useAuthStore()

const address = ref('')
const model = ref('')
const plate = ref('')
const scheduledTime = ref('')
const requested = ref(false)

async function submit() {
  const created = await tasks.add({
    jobId: '',
    type: 'pickup',
    name: auth.user?.name ?? 'Guest',
    phone: '+1 555-0000',
    address: address.value,
    model: model.value,
    plate: plate.value,
    scheduledTime: scheduledTime.value ? new Date(scheduledTime.value).toISOString() : new Date().toISOString(),
    status: 'pending',
    notes: '',
  })
  if (created) requested.value = true
}
</script>

<template>
  <DashboardLayout title="Request Pickup" :nav-items="customerNav">
    <PageHeader title="Request a pickup" subtitle="We'll send a driver to collect your vehicle." />

    <BaseCard class="reveal mx-auto max-w-xl p-6">
      <Transition name="scale-fade" mode="out-in">
        <div v-if="requested" key="success" class="flex flex-col items-center py-4 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success animate-bounce-in">
            <CheckCircle2 :size="32" />
          </div>
          <p class="text-lg font-semibold text-success">Pickup requested!</p>
          <p class="mt-2 text-sm text-muted-foreground">A driver will be assigned shortly.</p>
        </div>
        <form v-else key="form" @submit.prevent="submit" class="flex flex-col gap-4">
          <BaseInput v-model="address" placeholder="Pickup address" label="Address" required />
          <BaseInput v-model="model" placeholder="Car model" label="Car model" required />
          <BaseInput v-model="plate" placeholder="License plate" label="License plate" required />
          <BaseInput v-model="scheduledTime" type="datetime-local" label="Preferred time" required />
          <Transition name="shake-fade">
            <p v-if="tasks.error" class="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle :size="16" class="shrink-0" /> {{ tasks.error }}
            </p>
          </Transition>

          <BaseButton type="submit" size="lg" :loading="tasks.loading" class="mt-1">
            <MapPin v-if="!tasks.loading" :size="18" /> {{ tasks.loading ? 'Requesting...' : 'Request pickup' }}
          </BaseButton>
        </form>
      </Transition>
    </BaseCard>
  </DashboardLayout>
</template>

<style scoped>
.scale-fade-enter-active { transition: opacity 0.3s ease, transform 0.3s cubic-bezier(.22,1,.36,1); }
.scale-fade-enter-from { opacity: 0; transform: scale(0.97); }
.shake-fade-enter-active { animation: shake-fade-in 0.35s ease; }
@keyframes shake-fade-in {
  0% { opacity: 0; transform: translateX(0); }
  30% { opacity: 1; transform: translateX(-4px); }
  60% { transform: translateX(4px); }
  100% { transform: translateX(0); }
}
</style>
