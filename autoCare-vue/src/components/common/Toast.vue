<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useToast, type Toast } from '@/composables/useToast'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next'

const { subscribe } = useToast()
const toasts = ref<Toast[]>([])

let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = subscribe((newToasts) => {
    toasts.value = newToasts
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: 'bg-success/10 text-success border-success/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  info: 'bg-accent/10 text-accent border-accent/20',
}

const { remove } = useToast()
</script>

<template>
  <div class="fixed bottom-4 left-4 right-4 z-50 space-y-2 md:left-auto md:right-4 md:w-96">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['flex items-start gap-3 rounded-lg border p-4 backdrop-blur-sm animate-scale-in', colors[toast.type]]"
      >
        <component :is="icons[toast.type]" :size="20" class="shrink-0 mt-0.5" />
        <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
        <button @click="remove(toast.id)" class="shrink-0 hover:opacity-70 transition-opacity">
          <X :size="18" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
