import { ref } from 'vue'

export const customerDemo = ref(localStorage.getItem('autocare:demo') === 'customer')

export function setCustomerDemo(enabled: boolean) {
  customerDemo.value = enabled
  if (enabled) localStorage.setItem('autocare:demo', 'customer')
  else localStorage.removeItem('autocare:demo')
}
