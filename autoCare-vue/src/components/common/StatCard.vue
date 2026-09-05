<script setup lang="ts">
import BaseCard from './BaseCard.vue'

withDefaults(defineProps<{
  label: string
  value: string | number
  icon?: any
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'accent'
  hint?: string
}>(), { tone: 'primary' })

const toneClasses: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-destructive/10 text-destructive',
  accent: 'bg-accent/10 text-accent',
}
</script>

<template>
  <BaseCard hover class="reveal p-5">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm text-muted-foreground">{{ label }}</p>
        <p class="mt-1 text-3xl font-bold tracking-tight">{{ value }}</p>
        <p v-if="hint" class="mt-1 text-xs text-muted-foreground">{{ hint }}</p>
      </div>
      <div v-if="icon" :class="['flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110', toneClasses[tone]]">
        <component :is="icon" :size="20" />
      </div>
    </div>
  </BaseCard>
</template>
