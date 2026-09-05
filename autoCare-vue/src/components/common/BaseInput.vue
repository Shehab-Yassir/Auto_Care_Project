<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: string
  type?: string
  placeholder?: string
  required?: boolean
  label?: string
  error?: string
  disabled?: boolean
}>(), { type: 'text' })
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <label class="flex flex-col gap-1.5">
    <span v-if="label" class="text-sm font-medium text-foreground">{{ label }}</span>
    <span class="relative flex items-center">
      <span v-if="$slots.icon" class="pointer-events-none absolute left-3 text-muted-foreground">
        <slot name="icon" />
      </span>
      <input
        :type="type || 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :class="[
          'h-11 w-full rounded-lg border bg-background text-sm outline-none transition-all duration-200',
          'placeholder:text-muted-foreground/70 focus-ring disabled:cursor-not-allowed disabled:opacity-60',
          $slots.icon ? 'pl-9 pr-3' : 'px-3',
          error ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary/50',
        ]"
      />
    </span>
    <span v-if="error" class="text-xs text-destructive">{{ error }}</span>
  </label>
</template>
