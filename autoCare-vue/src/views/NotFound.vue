<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
const router = useRouter()
</script>

<template>
  <div class="surface-glow bg-dot-grid flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
    <svg viewBox="0 0 240 140" class="w-64 animate-float-slow" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="120" cy="122" rx="90" ry="8" fill="hsl(var(--foreground))" opacity="0.08" />
      <rect x="20" y="96" width="200" height="6" rx="3" fill="hsl(var(--border))" />
      <g style="transform-origin: 90px 96px" class="animate-wheel">
        <circle cx="90" cy="96" r="14" fill="hsl(var(--foreground))" opacity="0.85" />
        <circle cx="90" cy="96" r="6" fill="hsl(var(--card))" />
      </g>
      <g style="transform-origin: 165px 96px" class="animate-wheel">
        <circle cx="165" cy="96" r="14" fill="hsl(var(--foreground))" opacity="0.85" />
        <circle cx="165" cy="96" r="6" fill="hsl(var(--card))" />
      </g>
      <path d="M 20 90 Q 60 60 120 60 Q 180 60 220 90" stroke="hsl(var(--border))" stroke-width="4" stroke-linecap="round" />
    </svg>

    <div>
      <h1 class="text-5xl font-bold tracking-tight">Page not found</h1>
      <p class="mt-2 text-lg text-muted-foreground">Sorry, we couldn't find what you're looking for.</p>
    </div>

    <BaseButton variant="outline" @click="router.back()" class="mt-4">
      <ArrowLeft :size="16" /> Go back
    </BaseButton>
  </div>
</template>

<style scoped>
@keyframes wheel {
  0%, 100% { transform: rotateZ(0deg); }
  100% { transform: rotateZ(360deg); }
}

.animate-wheel {
  animation: wheel 2s linear infinite;
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.animate-float-slow {
  animation: float-slow 4s ease-in-out infinite;
}

.surface-glow::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(var(--primary), 0.1), transparent 70%);
  pointer-events: none;
}

.surface-glow {
  position: relative;
}

.bg-dot-grid {
  background-image: radial-gradient(circle, rgba(var(--foreground), 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}
</style>
