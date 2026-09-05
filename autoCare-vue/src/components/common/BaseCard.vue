<script setup lang="ts">
withDefaults(defineProps<{ hover?: boolean }>(), { hover: false })
</script>

<template>
  <div
    :class="[
      'rounded-xl border border-border bg-card text-card-foreground shadow-soft',
      hover ? 'card-hover' : '',
    ]"
  >
    <slot />
  </div>
</template>
