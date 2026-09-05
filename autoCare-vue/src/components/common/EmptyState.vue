<script setup lang="ts">
withDefaults(defineProps<{
  icon?: any
  title: string
  description?: string
}>(), {})
</script>

<template>
  <div class="animate-fade-in-up flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-secondary/30 px-6 py-14 text-center">
    <div v-if="icon" class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary animate-float">
      <component :is="icon" :size="26" />
    </div>
    <p class="font-semibold">{{ title }}</p>
    <p v-if="description" class="max-w-sm text-sm text-muted-foreground">{{ description }}</p>
    <div v-if="$slots.default" class="mt-1">
      <slot />
    </div>
  </div>
</template>
