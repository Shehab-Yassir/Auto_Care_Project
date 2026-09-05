import { ref, watch } from 'vue'

const STORAGE_KEY = 'autocare:theme'

function getInitial(): boolean {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) return saved === 'dark'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

const isDark = ref(getInitial())

function applyClass() {
  document.documentElement.classList.toggle('dark', isDark.value)
}
applyClass()

watch(isDark, () => {
  localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
  applyClass()
})

export function useDarkMode() {
  function toggle() {
    isDark.value = !isDark.value
  }
  return { isDark, toggle }
}
