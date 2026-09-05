<script setup lang="ts">
// Root shell. Auth + data are Pinia stores (see src/stores), so there is
// no context-provider nesting to do here like in the React version.
// A lightweight fade/slide transition wraps every route change, and a
// slim progress bar reflects live activity from the simulated API layer.
import NetworkActivityBar from '@/components/common/NetworkActivityBar.vue'
import Toast from '@/components/common/Toast.vue'
</script>

<template>
  <NetworkActivityBar />
  <Toast />
  <router-view v-slot="{ Component, route }">
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </router-view>
</template>

<style>
.page-enter-active {
  transition: opacity 0.28s ease, transform 0.28s cubic-bezier(.22, 1, .36, 1);
}
.page-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
