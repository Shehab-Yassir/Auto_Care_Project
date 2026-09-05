<script setup lang="ts">
import { Users } from 'lucide-vue-next'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { adminNav } from '@/navigation'
import { useUsersStore } from '@/stores/data'

const users = useUsersStore()

function toggle(id: string, status: 'active' | 'suspended') {
  users.update(id, { status: status === 'active' ? 'suspended' : 'active' })
}
</script>

<template>
  <DashboardLayout title="Users" :nav-items="adminNav">
    <PageHeader title="Users" subtitle="Manage every account across the platform." />

    <EmptyState v-if="users.items.length === 0" :icon="Users" title="No users yet" description="Registered accounts will appear here." />

    <BaseCard v-else class="reveal overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-secondary/60 text-left">
            <tr>
              <th class="p-3">Name</th>
              <th class="p-3">Email</th>
              <th class="p-3">Role</th>
              <th class="p-3">Status</th>
              <th class="p-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users.items" :key="u.id" class="border-t border-border transition-colors hover:bg-secondary/30">
              <td class="p-3 font-medium">{{ u.name }}</td>
              <td class="p-3 text-muted-foreground">{{ u.email }}</td>
              <td class="p-3 capitalize">{{ u.role }}</td>
              <td class="p-3"><BaseBadge :tone="u.status === 'active' ? 'success' : 'danger'" dot>{{ u.status }}</BaseBadge></td>
              <td class="p-3">
                <BaseButton size="sm" variant="outline" @click="toggle(u.id, u.status)">
                  {{ u.status === 'active' ? 'Suspend' : 'Reactivate' }}
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>
  </DashboardLayout>
</template>
