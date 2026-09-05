<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const props = defineProps<{ to: string }>()
const emit = defineEmits<{ navigate: [] }>()
const route = useRoute()
const isActive = computed(() => route.path === props.to)
</script>

<template>
  <router-link
    :to="to"
    @click="emit('navigate')"
    :class="[
      'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
      isActive
        ? 'bg-primary text-primary-foreground shadow-soft'
        : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground hover:translate-x-0.5',
    ]"
  >
    <span
      v-if="isActive"
      class="absolute -left-4 top-1/2 hidden h-5 w-1 -translate-y-1/2 rounded-full bg-primary md:block"
    />
    <slot />
  </router-link>
</template>
