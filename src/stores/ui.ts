import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Theme = 'light' | 'dark'

export const useUiStore = defineStore('ui', () => {
  // Restore theme from localStorage (defaults to 'light' if missing or invalid)
  const stored = localStorage.getItem('ui_theme')
  const theme = ref<Theme>(stored === 'dark' ? 'dark' : 'light')

  // Global loading flag for app-wide loading states (skeletons, full-page spinners)
  const loading = ref(false)
  // Global error message (null = no error shown)
  const error = ref<string | null>(null)
  // Retry callback stored alongside the error so ErrorBanner can offer a retry action
  const retryHandler = ref<(() => void) | null>(null)
  // Generic modal visibility flag (extend with specific flags when Phase 2 adds modals)
  const isModalOpen = ref(false)

  // Sets and persists the theme preference
  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem('ui_theme', newTheme)
  }

  // Sets a global error message and optionally stores a retry callback
  function setError(message: string | null, retryFn?: () => void) {
    error.value = message
    retryHandler.value = retryFn ?? null
  }

  // Convenience: quickly clear any active error
  function clearError() {
    error.value = null
    retryHandler.value = null
  }

  // Invokes the stored retry callback if one exists, then clears the error
  function retry() {
    retryHandler.value?.()
    clearError()
  }

  // Controls the global loading flag
  function setLoading(value: boolean) {
    loading.value = value
  }

  // Controls modal visibility (generic — can be split into specific flags later)
  function setModalOpen(value: boolean) {
    isModalOpen.value = value
  }

  return { theme, loading, error, retryHandler, isModalOpen, setTheme, setError, clearError, retry, setLoading, setModalOpen }
})