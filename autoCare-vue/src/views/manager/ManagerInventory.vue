<script setup lang="ts">
import { Boxes } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { managerNav } from '@/navigation'
import { useInventoryStore } from '@/stores/data'

const inventory = useInventoryStore()
</script>

<template>
  <DashboardLayout title="Inventory" :nav-items="managerNav">
    <PageHeader title="Inventory" subtitle="Track parts stock levels across the shop." />

    <EmptyState v-if="inventory.items.length === 0" :icon="Boxes" title="No inventory items" description="Parts and stock levels will appear here once added." />

    <BaseCard v-else class="reveal overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-secondary/60 text-left">
            <tr>
              <th class="p-3">Part</th>
              <th class="p-3">Category</th>
              <th class="p-3">Qty</th>
              <th class="p-3">Unit price</th>
              <th class="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in inventory.items" :key="item.id" class="border-t border-border transition-colors hover:bg-secondary/30">
              <td class="p-3 font-medium">{{ item.name }}</td>
              <td class="p-3 text-muted-foreground">{{ item.category }}</td>
              <td class="p-3">{{ item.quantity }}</td>
              <td class="p-3">${{ item.unitPrice.toFixed(2) }}</td>
              <td class="p-3">
                <BaseBadge :tone="item.quantity <= item.minQuantity ? 'danger' : 'success'" dot>
                  {{ item.quantity <= item.minQuantity ? 'Low stock' : 'OK' }}
                </BaseBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>
  </DashboardLayout>
</template>
