<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Car, Send, ArrowLeft, Sparkles } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()

interface Message { role: 'user' | 'assistant'; text: string }

const messages = ref<Message[]>([
  { role: 'assistant', text: "Hi! I'm the Auto Care assistant. Describe an issue with your car and I'll suggest what it might be." },
])
const input = ref('')
const listEl = ref<HTMLElement | null>(null)
const typing = ref(false)

const canned: [RegExp, string][] = [
  [/brake|squeak/i, 'That sounds like worn brake pads. Book a Brake Service and avoid hard stops until it is checked.'],
  [/oil/i, 'If it has been 5,000+ miles since your last change, an Oil Change is due. Takes about 30 minutes.'],
  [/ac|air ?con/i, 'Weak cooling is usually low refrigerant or a failing compressor. Our AC Service covers diagnosis and recharge.'],
  [/engine light|check engine/i, 'A check engine light needs a diagnostics scan to read the fault code — book Engine Diagnostics.'],
]

const suggestions = ['My brakes are squeaking', 'Check engine light is on', 'AC blows warm air']

function scrollToBottom() {
  nextTick(() => listEl.value?.scrollTo({ top: listEl.value.scrollHeight, behavior: 'smooth' }))
}

function send(text?: string) {
  const value = (text ?? input.value).trim()
  if (!value) return
  messages.value.push({ role: 'user', text: value })
  input.value = ''
  scrollToBottom()

  typing.value = true
  const match = canned.find(([re]) => re.test(value))
  const reply = match ? match[1] : "I'd recommend booking a Full Inspection so a technician can take a closer look."
  setTimeout(() => {
    typing.value = false
    messages.value.push({ role: 'assistant', text: reply })
    scrollToBottom()
  }, 600)
}
</script>

<template>
  <div class="surface-glow flex min-h-screen flex-col bg-background">
    <header class="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-lg">
      <button @click="router.push('/')" class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground focus-ring">
        <ArrowLeft :size="20" />
      </button>
      <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
        <Car class="text-primary-foreground" :size="18" />
      </div>
      <div>
        <p class="font-semibold leading-none">Auto Care Assistant</p>
        <p class="mt-0.5 flex items-center gap-1 text-xs text-success">
          <span class="h-1.5 w-1.5 rounded-full bg-success animate-pulse-ring" /> Online
        </p>
      </div>
    </header>

    <div ref="listEl" class="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 overflow-y-auto p-4">
      <TransitionGroup name="msg">
        <div
          v-for="(m, i) in messages"
          :key="i"
          :class="['max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-soft', m.role === 'user' ? 'ml-auto rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-secondary']"
        >
          {{ m.text }}
        </div>
      </TransitionGroup>

      <div v-if="typing" class="animate-fade-in flex items-center gap-1 rounded-2xl rounded-bl-sm bg-secondary px-4 py-3">
        <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style="animation-delay: 0ms" />
        <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style="animation-delay: 150ms" />
        <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style="animation-delay: 300ms" />
      </div>

      <div v-if="messages.length === 1" class="mt-2 flex flex-wrap gap-2 animate-fade-in-up">
        <button
          v-for="s in suggestions"
          :key="s"
          @click="send(s)"
          class="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-ring"
        >
          <Sparkles :size="12" class="text-primary" /> {{ s }}
        </button>
      </div>
    </div>

    <form @submit.prevent="send()" class="mx-auto flex w-full max-w-2xl gap-2 border-t border-border p-4">
      <input
        v-model="input"
        placeholder="Describe the issue..."
        class="h-11 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-shadow focus-ring"
      />
      <BaseButton type="submit" size="icon"><Send :size="18" /></BaseButton>
    </form>
  </div>
</template>

<style scoped>
.msg-enter-active { transition: opacity 0.25s ease, transform 0.25s cubic-bezier(.22,1,.36,1); }
.msg-enter-from { opacity: 0; transform: translateY(8px) scale(0.98); }
</style>
