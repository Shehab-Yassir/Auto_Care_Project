<script setup lang="ts">
import { ref } from 'vue'
import { CheckCircle2, Calendar, AlertCircle } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { customerNav } from '@/navigation'
import { useJobsStore } from '@/stores/data'
import { useAuthStore } from '@/stores/auth'

const jobs = useJobsStore()
const auth = useAuthStore()

const serviceType = ref('Oil Change')
const model = ref('')
const plate = ref('')
const address = ref('')
const description = ref('')
const submitted = ref(false)

const services = ['Oil Change', 'Brake Service', 'Full Inspection', 'Tire Rotation', 'AC Service', 'Engine Diagnostics']

async function submit() {
  if (![model.value, plate.value, address.value].every((value) => value.trim())) {
    jobs.error = 'Enter a car model, license plate, and address.'
    return
  }
  const created = await jobs.add({
    name: auth.user?.name ?? 'Guest',
    phone: '+1 555-0000',
    address: address.value.trim(),
    model: model.value.trim(),
    plate: plate.value.trim(),
    serviceType: serviceType.value,
    description: description.value,
    status: 'pending',
    priority: 'normal',
    createdAt: new Date().toISOString(),
    notes: [],
    laborCost: 0,
    partsCost: 0,
  })
  if (created) submitted.value = true
}
</script>

<template>
  <DashboardLayout title="Book a Service" :nav-items="customerNav">
    <PageHeader title="Book a service" subtitle="Tell us about your vehicle and we'll confirm a time." />

    <BaseCard class="reveal mx-auto max-w-xl p-6">
      <Transition name="scale-fade" mode="out-in">
        <div v-if="submitted" key="success" class="flex flex-col items-center py-4 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success animate-bounce-in">
            <CheckCircle2 :size="32" />
          </div>
          <p class="text-lg font-semibold text-success">{{ auth.isDemo ? 'Demo booking saved!' : 'Booking received!' }}</p>
          <p class="mt-2 text-sm text-muted-foreground">{{ auth.isDemo ? 'Your sample booking is available in Progress. No real appointment was made.' : "We'll confirm your appointment shortly." }}</p>
          <router-link to="/customer/progress" class="mt-4 font-medium text-primary underline">View progress</router-link>
        </div>
        <form v-else key="form" @submit.prevent="submit" class="flex flex-col gap-4">
          <div>
            <label for="service-type" class="mb-1.5 block text-sm font-medium">Service type</label>
            <select id="service-type" v-model="serviceType" class="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-shadow focus-ring">
              <option v-for="s in services" :key="s">{{ s }}</option>
            </select>
          </div>
          <BaseInput v-model="model" placeholder="e.g. Toyota Camry 2022" label="Car model" required />
          <BaseInput v-model="plate" placeholder="License plate" label="License plate" required />
          <BaseInput v-model="address" placeholder="Address" label="Address" required />
          <div>
            <label for="service-description" class="mb-1.5 block text-sm font-medium">Describe the issue</label>
            <textarea
              id="service-description"
              v-model="description"
              placeholder="What's going on with your car?"
              class="min-h-[90px] w-full rounded-lg border border-border bg-background p-3 text-sm outline-none transition-shadow focus-ring"
            />
          </div>
          <Transition name="shake-fade">
            <p v-if="jobs.error" class="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle :size="16" class="shrink-0" /> {{ jobs.error }}
            </p>
          </Transition>

          <BaseButton type="submit" size="lg" :loading="jobs.loading" class="mt-1">
            <Calendar v-if="!jobs.loading" :size="18" /> {{ jobs.loading ? 'Booking...' : 'Confirm booking' }}
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
