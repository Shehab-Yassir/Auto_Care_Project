<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Car, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import AuthSidePanel from '@/components/layout/AuthSidePanel.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  if (!auth.selectedRole) {
    router.push('/select-role')
    return
  }
  loading.value = true
  const ok = await auth.login(email.value, password.value)
  loading.value = false
  if (ok) {
    toast.success(`Welcome back, ${auth.user?.name}!`)
    router.push(`/${auth.selectedRole}`)
  } else error.value = auth.error ?? 'Please enter a valid email and password.'
}
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <AuthSidePanel
      heading="Everything for your shop, in one place."
      subtext="Sign in to manage bookings, jobs, pickups and reports built for your role."
    />

    <div class="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div class="w-full max-w-sm animate-scale-in">
        <router-link to="/" class="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden">
          <ArrowLeft :size="15" /> Back home
        </router-link>

        <div class="mb-8 flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-soft lg:hidden">
            <Car class="text-primary-foreground" :size="24" />
          </div>
          <h1 class="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p class="text-sm capitalize text-muted-foreground">Signing in as {{ auth.selectedRole ?? '...' }}</p>
        </div>

        <p v-if="auth.selectedRole === 'customer'" class="mb-4 rounded-lg bg-primary/10 p-3 text-sm text-primary">
          Customer demo: enter any email address and any password. Explore sample data without creating a real account.
        </p>
        <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
          <BaseInput v-model="email" type="email" placeholder="you@example.com" label="Email" required>
            <template #icon><Mail :size="16" /></template>
          </BaseInput>
          <BaseInput v-model="password" type="password" placeholder="••••••••" label="Password" required>
            <template #icon><Lock :size="16" /></template>
          </BaseInput>

          <Transition name="shake-fade">
            <p v-if="error" class="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle :size="16" class="shrink-0" /> {{ error }}
            </p>
          </Transition>

          <BaseButton type="submit" size="lg" :loading="loading" class="mt-1 w-full">
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </BaseButton>
        </form>

        <p class="mt-6 text-center text-sm text-muted-foreground">
          No account?
          <router-link to="/register" class="font-medium text-primary transition-colors hover:text-primary/80">Register</router-link>
        </p>
        <p class="mt-2 text-center text-sm">
          <router-link to="/select-role" class="text-xs text-muted-foreground transition-colors hover:text-foreground">Not {{ auth.selectedRole ?? 'this role' }}? Choose a different role</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shake-fade-enter-active { animation: shake-fade-in 0.35s ease; }
@keyframes shake-fade-in {
  0% { opacity: 0; transform: translateX(0); }
  30% { opacity: 1; transform: translateX(-4px); }
  60% { transform: translateX(4px); }
  100% { transform: translateX(0); }
}
</style>
