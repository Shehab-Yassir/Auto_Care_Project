<script setup lang="ts">
import { pendingRequests } from '@/services/apiClient'
</script>

<template>
  <Transition name="bar-fade">
    <div v-if="pendingRequests > 0" class="fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-primary/10">
      <div class="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent bg-gradient-animated animate-slide-in-right" style="animation: loading-sweep 1s ease-in-out infinite;" />
    </div>
  </Transition>
</template>

<style scoped>
.bar-fade-enter-active { transition: opacity 0.15s ease; }
.bar-fade-leave-active { transition: opacity 0.3s ease; }
.bar-fade-enter-from,
.bar-fade-leave-to { opacity: 0; }

@keyframes loading-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}
</style>
