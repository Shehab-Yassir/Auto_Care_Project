<script setup lang="ts">
import { Car, Sparkles } from 'lucide-vue-next'

interface Props {
  heading: string
  subtext: string
}

defineProps<Props>()

const features = [
  'Easy service booking',
  'Real-time job tracking',
  'Expert technician network',
  'Pickup & delivery included',
]
</script>

<template>
  <div class="hidden flex-col items-center justify-center gap-8 bg-gradient-to-br from-primary/5 to-accent/5 px-6 py-12 lg:flex">
    <div class="w-full max-w-xs text-center">
      <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg mx-auto">
        <Car class="text-primary-foreground" :size="32" />
      </div>
      <h1 class="text-3xl font-bold tracking-tight mb-3">{{ heading }}</h1>
      <p class="text-lg text-muted-foreground">{{ subtext }}</p>
    </div>

    <div class="w-full max-w-xs space-y-4">
      <div v-for="(feature, idx) in features" :key="idx" class="flex items-center gap-3 text-sm">
        <div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
          <Sparkles :size="14" />
        </div>
        <span class="text-foreground">{{ feature }}</span>
      </div>
    </div>

    <div class="mt-6 w-full max-w-xs rounded-lg border border-border bg-card/50 p-4 text-center">
      <p class="text-xs text-muted-foreground">
        Part of the modern car care platform trusted by <span class="font-semibold text-foreground">50,000+</span> vehicle owners
      </p>
    </div>
  </div>
</template>
