<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  Car, Calendar, MapPin, Wrench, Shield, Clock, MessageSquare, ArrowRight,
  Menu, X, Star, CheckCircle2, Gauge, Sparkles,
} from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import { useReveal } from '@/composables/useReveal'

const router = useRouter()
useReveal()

const mobileMenuOpen = ref(false)
const mobileMenuButton = ref<HTMLButtonElement | null>(null)

function closeMobileMenu() {
  mobileMenuOpen.value = false
  mobileMenuButton.value?.focus()
}

const features = [
  { icon: Calendar, title: 'Easy Booking', description: 'Schedule maintenance appointments in a few clicks' },
  { icon: MapPin, title: 'Pickup Service', description: 'We pick up your car and deliver it back' },
  { icon: Wrench, title: 'Expert Technicians', description: 'Certified professionals handling your vehicle' },
  { icon: Clock, title: 'Real-time Tracking', description: 'Track repair progress step by step' },
  { icon: Shield, title: 'Quality Guarantee', description: '12-month warranty on all repairs' },
  { icon: MessageSquare, title: 'AI Assistant', description: 'Instant help and car diagnosis via chatbot' },
]

const stats = [
  { value: 50, suffix: 'K+', label: 'Happy Customers' },
  { value: 150, suffix: '+', label: 'Expert Technicians' },
  { value: 99, suffix: '%', label: 'Satisfaction Rate' },
  { value: 24, suffix: '/7', label: 'Support Available' },
]

const services = [
  { name: 'Oil Change', price: 'From $49', time: '30 min', icon: Gauge },
  { name: 'Brake Service', price: 'From $149', time: '1-2 hours', icon: Shield },
  { name: 'Full Inspection', price: 'From $89', time: '45 min', icon: CheckCircle2 },
  { name: 'Tire Rotation', price: 'From $29', time: '20 min', icon: Sparkles },
]

const testimonials = [
  { name: 'Amelia R.', role: 'Toyota Camry owner', quote: 'Booking took two minutes and the pickup driver showed up right on time. My car came back cleaner than I dropped it off.', rating: 5 },
  { name: 'Marcus D.', role: 'Fleet manager, Delta Logistics', quote: 'We moved our whole van fleet to Auto Care. The manager dashboard makes scheduling maintenance across 40 vehicles painless.', rating: 5 },
  { name: 'Priya K.', role: 'Honda Civic owner', quote: 'The live progress tracker is what sold me. I could see exactly when my technician started and finished each step.', rating: 5 },
]

function go(feature: (typeof features)[number]) {
  if (feature.title === 'AI Assistant') router.push('/chatbot')
  else router.push('/select-role')
}

// Lightweight count-up for the stats band, triggered once it scrolls into view.
const displayedStats = ref(stats.map(() => 0))
const statsSection = ref<HTMLElement | null>(null)
let statsObserver: IntersectionObserver | null = null
let statsAnimationFrame: number | null = null

function animateStats() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    displayedStats.value = stats.map((s) => s.value)
    return
  }

  const duration = 1200
  const start = performance.now()
  function tick(now: number) {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    displayedStats.value = stats.map((s) => Math.round(s.value * eased))
    statsAnimationFrame = progress < 1 ? requestAnimationFrame(tick) : null
  }
  statsAnimationFrame = requestAnimationFrame(tick)
}

onMounted(() => {
  if (!statsSection.value || !('IntersectionObserver' in window)) {
    animateStats()
    return
  }
  statsObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        animateStats()
        statsObserver?.disconnect()
      }
    },
    { threshold: 0.4 },
  )
  statsObserver.observe(statsSection.value)
})

onBeforeUnmount(() => {
  statsObserver?.disconnect()
  if (statsAnimationFrame !== null) cancelAnimationFrame(statsAnimationFrame)
})
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-background">
    <!-- Navbar -->
    <header class="sticky top-0 z-50 border-b border-border/60 bg-card/75 backdrop-blur-xl">
      <div class="container flex h-16 items-center justify-between">
        <router-link to="/" class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-soft">
            <Car class="text-primary-foreground" :size="22" />
          </div>
          <span class="text-lg font-bold tracking-tight">Auto Care</span>
        </router-link>

        <nav class="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" class="transition-colors hover:text-foreground">Features</a>
          <a href="#services" class="transition-colors hover:text-foreground">Services</a>
          <a href="#testimonials" class="transition-colors hover:text-foreground">Testimonials</a>
        </nav>

        <div class="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <BaseButton variant="ghost" @click="router.push('/login')">Log in</BaseButton>
          <BaseButton @click="router.push('/select-role')">Get Started</BaseButton>
        </div>

        <button
          ref="mobileMenuButton"
          type="button"
          class="p-2 text-foreground md:hidden"
          :aria-expanded="mobileMenuOpen"
          aria-controls="mobile-menu"
          :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
          @click="mobileMenuOpen = !mobileMenuOpen"
          @keydown.esc="closeMobileMenu"
        >
          <Menu v-if="!mobileMenuOpen" :size="22" />
          <X v-else :size="22" />
        </button>
      </div>

      <Transition name="mobile-menu">
        <div v-show="mobileMenuOpen" id="mobile-menu" class="border-t border-border bg-card px-4 pb-4 pt-2 md:hidden" @keydown.esc="closeMobileMenu">
          <div class="flex flex-col gap-1 text-sm font-medium">
            <a href="#features" class="rounded-lg px-3 py-2 hover:bg-accent/10" @click="mobileMenuOpen = false">Features</a>
            <a href="#services" class="rounded-lg px-3 py-2 hover:bg-accent/10" @click="mobileMenuOpen = false">Services</a>
            <a href="#testimonials" class="rounded-lg px-3 py-2 hover:bg-accent/10" @click="mobileMenuOpen = false">Testimonials</a>
          </div>
          <div class="mt-3 flex items-center gap-2">
            <ThemeToggle />
            <BaseButton variant="outline" class="flex-1" @click="router.push('/login')">Log in</BaseButton>
            <BaseButton class="flex-1" @click="router.push('/select-role')">Get Started</BaseButton>
          </div>
        </div>
      </Transition>
    </header>

    <!-- Hero -->
    <section class="surface-glow relative overflow-hidden bg-dot-grid">
      <div class="container py-16 md:py-24">
        <div class="animate-fade-in-up text-center">
          <span class="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles :size="14" /> Trusted by 50,000+ drivers
          </span>
          <h1 class="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Car maintenance,
            <span class="text-gradient">simplified.</span>
          </h1>
          <p class="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Book, track, and manage all your vehicle maintenance needs from one place — with pickup, live updates, and expert technicians.
          </p>
          <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <BaseButton size="lg" @click="router.push('/select-role')">
              Book a service <ArrowRight :size="18" />
            </BaseButton>
            <BaseButton size="lg" variant="outline" @click="router.push('/chatbot')">Ask the AI assistant</BaseButton>
          </div>
        </div>
      </div>

      <!-- stats band -->
      <div ref="statsSection" class="border-t border-border/60 bg-card/50">
        <div class="container grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          <div v-for="(s, i) in stats" :key="s.label" class="reveal text-center" :class="`reveal-delay-${i + 1}`">
            <p class="text-3xl font-bold text-primary md:text-4xl">{{ displayedStats[i] }}{{ s.suffix }}</p>
            <p class="mt-1 text-sm text-muted-foreground">{{ s.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="container scroll-mt-20 py-20">
      <div class="reveal mx-auto mb-12 max-w-xl text-center">
        <h2 class="text-3xl font-bold tracking-tight">Everything you need</h2>
        <p class="mt-3 text-muted-foreground">One platform for booking, tracking, and completing every kind of vehicle service.</p>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <button
          v-for="(f, i) in features"
          :key="f.title"
          @click="go(f)"
          :class="['reveal group card-hover rounded-xl border border-border bg-card p-6 text-left', `reveal-delay-${(i % 3) + 1}`]"
        >
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
            <component :is="f.icon" :size="24" />
          </div>
          <h3 class="mb-1 font-semibold">{{ f.title }}</h3>
          <p class="text-sm text-muted-foreground">{{ f.description }}</p>
          <span class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            Learn more <ArrowRight :size="14" />
          </span>
        </button>
      </div>
    </section>

    <!-- Services -->
    <section id="services" class="scroll-mt-20 bg-secondary/40 py-20">
      <div class="container">
        <div class="reveal mx-auto mb-12 max-w-xl text-center">
          <h2 class="text-3xl font-bold tracking-tight">Popular services</h2>
          <p class="mt-3 text-muted-foreground">Transparent pricing, fast turnaround, no surprises.</p>
        </div>
        <div class="grid gap-4 md:grid-cols-4">
          <BaseCard
            v-for="(s, i) in services"
            :key="s.name"
            hover
            :class="['reveal p-5 text-center', `reveal-delay-${i + 1}`]"
          >
            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <component :is="s.icon" :size="22" />
            </div>
            <p class="font-semibold">{{ s.name }}</p>
            <p class="mt-1 text-primary">{{ s.price }}</p>
            <p class="text-xs text-muted-foreground">{{ s.time }}</p>
          </BaseCard>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section id="testimonials" class="container scroll-mt-20 py-20">
      <div class="reveal mx-auto mb-12 max-w-xl text-center">
        <h2 class="text-3xl font-bold tracking-tight">Loved by drivers and shops alike</h2>
        <p class="mt-3 text-muted-foreground">A few words from people who use Auto Care every week.</p>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <BaseCard
          v-for="(t, i) in testimonials"
          :key="t.name"
          hover
          :class="['reveal p-6', `reveal-delay-${i + 1}`]"
        >
          <div class="mb-3 flex gap-0.5 text-warning">
            <Star v-for="n in t.rating" :key="n" :size="16" fill="currentColor" stroke="none" />
          </div>
          <p class="text-sm leading-relaxed text-foreground/90">&ldquo;{{ t.quote }}&rdquo;</p>
          <div class="mt-5 flex items-center gap-3 border-t border-border pt-4">
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {{ t.name.charAt(0) }}
            </span>
            <div>
              <p class="text-sm font-semibold">{{ t.name }}</p>
              <p class="text-xs text-muted-foreground">{{ t.role }}</p>
            </div>
          </div>
        </BaseCard>
      </div>
    </section>

    <!-- CTA -->
    <section class="container pb-20">
      <div class="reveal relative overflow-hidden rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground shadow-glow sm:px-12">
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
        <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 animate-float-slow" />
        <div class="absolute -bottom-14 -left-10 h-48 w-48 rounded-full bg-white/10 animate-float" />
        <h2 class="relative mx-auto max-w-lg text-3xl font-bold tracking-tight">Ready to make car care effortless?</h2>
        <p class="relative mx-auto mt-3 max-w-md text-primary-foreground/85">
          Create an account in under a minute and book your first service today.
        </p>
        <div class="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <BaseButton size="lg" variant="secondary" @click="router.push('/select-role')">
            Get started free <ArrowRight :size="18" />
          </BaseButton>
          <BaseButton size="lg" variant="outline" class="border-white/40 text-primary-foreground hover:bg-white/10" @click="router.push('/chatbot')">
            Talk to the AI assistant
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-border bg-card/40 py-12">
      <div class="container grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div class="mb-3 flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Car class="text-primary-foreground" :size="16" />
            </div>
            <span class="font-bold">Auto Care</span>
          </div>
          <p class="text-sm text-muted-foreground">Car maintenance, booking, and fleet operations — all in one modern platform.</p>
        </div>
        <div>
          <p class="mb-3 text-sm font-semibold">Product</p>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><a href="#features" class="transition-colors hover:text-foreground">Features</a></li>
            <li><a href="#services" class="transition-colors hover:text-foreground">Services</a></li>
            <li><router-link to="/chatbot" class="transition-colors hover:text-foreground">AI Assistant</router-link></li>
          </ul>
        </div>
        <div>
          <p class="mb-3 text-sm font-semibold">Company</p>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><router-link to="/select-role" class="transition-colors hover:text-foreground">Get started</router-link></li>
            <li><router-link to="/login" class="transition-colors hover:text-foreground">Sign in</router-link></li>
          </ul>
        </div>
        <div>
          <p class="mb-3 text-sm font-semibold">Support</p>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li>24/7 live chat</li>
            <li>support@autocare.app</li>
          </ul>
        </div>
      </div>
      <div class="container mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        © {{ new Date().getFullYear() }} Auto Care. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.mobile-menu-enter-from,
.mobile-menu-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
