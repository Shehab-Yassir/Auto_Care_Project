import { ref } from 'vue'

export const demoSession = ref(['customer', 'all'].includes(localStorage.getItem('autocare:demo') ?? ''))

export function setDemoSession(enabled: boolean) {
  demoSession.value = enabled
  if (enabled) localStorage.setItem('autocare:demo', 'all')
  else localStorage.removeItem('autocare:demo')
}
