import { ref } from 'vue'

export interface ToastState {
  message: string
  id: number
}

export const toast = ref<ToastState | null>(null)
let toastId = 0

export function showToast(message: string, duration = 2500) {
  const id = ++toastId
  toast.value = { message, id }
  setTimeout(() => {
    if (toast.value?.id === id) {
      toast.value = null
    }
  }, duration)
}
