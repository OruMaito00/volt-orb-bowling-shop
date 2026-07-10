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
  // Generic modal visibility flag (extend with specific flags when Phase 2 adds modals)
  const isModalOpen = ref(false)

  // Sets and persists the theme preference
  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem('ui_theme', newTheme)
  }

  // Sets a global error message (shows ErrorBanner when wired in Phase 2)
  function setError(message: string | null) {
    error.value = message
  }

  // Convenience: quickly clear any active error
  function clearError() {
    error.value = null
  }

  // Controls the global loading flag
  function setLoading(value: boolean) {
    loading.value = value
  }

  // Controls modal visibility (generic — can be split into specific flags later)
  function setModalOpen(value: boolean) {
    isModalOpen.value = value
  }

  return { theme, loading, error, isModalOpen, setTheme, setError, clearError, setLoading, setModalOpen }
})