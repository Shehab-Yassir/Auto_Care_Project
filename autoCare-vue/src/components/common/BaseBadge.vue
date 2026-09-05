<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'default' | 'success' | 'warning' | 'danger' | 'info'; dot?: boolean }>(), {
  tone: 'default',
  dot: false,
})
const tones: Record<string, string> = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/15 text-success dark:text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-destructive/15 text-destructive',
  info: 'bg-primary/15 text-primary',
}
const dots: Record<string, string> = {
  default: 'bg-muted-foreground',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
  info: 'bg-primary',
}
</script>

<template>
  <span :class="['inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors', tones[tone]]">
    <span v-if="dot" :class="['h-1.5 w-1.5 rounded-full', dots[tone]]" />
    <slot />
  </span>
</template>
