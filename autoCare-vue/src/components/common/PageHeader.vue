<script setup lang="ts">
withDefaults(defineProps<{ title: string; subtitle?: string }>(), {})
</script>

<template>
  <div class="mb-6 flex flex-col gap-4 animate-fade-in-down sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-sm text-muted-foreground">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
