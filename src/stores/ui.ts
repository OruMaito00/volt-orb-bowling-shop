import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Theme = 'light' | 'dark'

export const useUiStore = defineStore('ui', () => {
  const theme = ref<Theme>('light')
  const loading = ref(false)
  const error = ref<string | null>(null)

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
  }

  function setError(message: string | null) {
    error.value = message
  }

  function clearError() {
    error.value = null
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  return { theme, loading, error, setTheme, setError, clearError, setLoading }
})
