import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => token.value !== null)

  function setToken(newToken: string) {
    token.value = newToken
  }

  function login(newToken: string) {
    setToken(newToken)
  }

  function logout() {
    token.value = null
  }

  return { token, isAuthenticated, setToken, login, logout }
})
