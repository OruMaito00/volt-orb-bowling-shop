import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Restore from localStorage so users survive page refreshes
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const username = ref<string | null>(localStorage.getItem('auth_username'))

  // Derived: true if token exists — read by the router guard
  const isAuthenticated = computed(() => token.value !== null)

  // Low-level setter (kept for future token refresh flows)
  function setToken(newToken: string) {
    token.value = newToken
  }

  // Called by LoginView after a successful API login
  function login(newToken: string, newUsername?: string) {
    token.value = newToken
    localStorage.setItem('auth_token', newToken)

    if (newUsername) {
      username.value = newUsername
      localStorage.setItem('auth_username', newUsername)
    }
  }

  // Clears in-memory state + persisted storage
  function logout() {
    token.value = null
    username.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_username')
  }

  return { token, username, isAuthenticated, setToken, login, logout }
})