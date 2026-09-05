<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>(), { variant: 'primary', size: 'md', loading: false, disabled: false, type: 'button' })

const variants: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground shadow-soft hover:shadow-glow hover:brightness-[1.06]',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
  outline: 'border border-border bg-transparent hover:bg-accent/10 hover:border-primary/40',
  ghost: 'bg-transparent hover:bg-accent/10',
  destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
  success: 'bg-success text-white hover:opacity-90',
}
const sizes: Record<string, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10 p-0',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'btn-press relative inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium',
      'transition-all duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none focus-ring',
      variants[variant],
      sizes[size],
    ]"
  >
    <Loader2 v-if="loading" class="animate-spin" :size="16" />
    <slot v-else />
  </button>
</template>
