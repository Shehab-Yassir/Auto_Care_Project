<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import type { Component } from 'vue'
defineProps<{ items: { to: string; title: string; description: string; icon: Component }[] }>()
</script>

<template>
  <div class="my-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <router-link v-for="(item, index) in items" :key="item.to" :to="item.to" class="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
      <span :class="['mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-white', index % 3 === 0 ? 'bg-primary' : index % 3 === 1 ? 'bg-teal-500' : 'bg-cyan-500']"><component :is="item.icon" :size="23" /></span>
      <h2 class="font-bold">{{ item.title }}</h2>
      <p class="mt-2 text-sm text-muted-foreground">{{ item.description }}</p>
      <span class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">Get started <ArrowRight :size="16" /></span>
    </router-link>
  </div>
</template>
