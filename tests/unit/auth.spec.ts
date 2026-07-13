import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    // Start with a fresh Pinia instance for each test
    setActivePinia(createPinia())
    // Clear localStorage so tests don't affect each other
    localStorage.clear()
  })

  //initial state
  describe('initial state', () => {
    it('has null token and username when localStorage is empty', () => {
      const auth = useAuthStore()
      expect(auth.token).toBeNull()
      expect(auth.username).toBeNull()
      expect(auth.isAuthenticated).toBe(false)
    })

    it('restores token from localStorage on init', () => {
      localStorage.setItem('auth_token', 'saved-token-123')

      const auth = useAuthStore()
      expect(auth.token).toBe('saved-token-123')
      expect(auth.isAuthenticated).toBe(true)
    })

    it('restores username from localStorage on init', () => {
      localStorage.setItem('auth_username', 'voltorb')

      const auth = useAuthStore()
      expect(auth.username).toBe('voltorb')
    })
  })

  //login
  describe('login()', () => {
    it('stores the token in state and localStorage', () => {
      const auth = useAuthStore()
      auth.login('my-token')

      expect(auth.token).toBe('my-token')
      expect(localStorage.getItem('auth_token')).toBe('my-token')
      expect(auth.isAuthenticated).toBe(true)
    })

    it('stores username when provided', () => {
      const auth = useAuthStore()
      auth.login('my-token', 'voltorb')

      expect(auth.username).toBe('voltorb')
      expect(localStorage.getItem('auth_username')).toBe('voltorb')
    })

    it('does not set username when not provided', () => {
      const auth = useAuthStore()
      auth.login('my-token')

      expect(auth.username).toBeNull()
      expect(localStorage.getItem('auth_username')).toBeNull()
    })
  })

  //logout
  describe('logout()', () => {
    it('clears token and username from state', () => {
      const auth = useAuthStore()
      auth.login('my-token', 'voltorb')

      auth.logout()

      expect(auth.token).toBeNull()
      expect(auth.username).toBeNull()
      expect(auth.isAuthenticated).toBe(false)
    })

    it('removes token and username from localStorage', () => {
      const auth = useAuthStore()
      auth.login('my-token', 'voltorb')

      auth.logout()

      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('auth_username')).toBeNull()
    })

    it('is a no-op (and does not throw) when called from a logged-out state', () => {
      const auth = useAuthStore()

      expect(() => auth.logout()).not.toThrow()
      expect(auth.token).toBeNull()
      expect(auth.username).toBeNull()
      expect(auth.isAuthenticated).toBe(false)
      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('auth_username')).toBeNull()
    })
  })

  //isAuthenticated
  describe('isAuthenticated', () => {
    it('is false when no token', () => {
      const auth = useAuthStore()
      expect(auth.isAuthenticated).toBe(false)
    })

    it('becomes true after login', () => {
      const auth = useAuthStore()
      auth.login('token-xyz')
      expect(auth.isAuthenticated).toBe(true)
    })

    it('becomes false after logout', () => {
      const auth = useAuthStore()
      auth.login('token-xyz')
      auth.logout()
      expect(auth.isAuthenticated).toBe(false)
    })
  })

  //setToken
  describe('setToken()', () => {
    it('updates only the token in state', () => {
      const auth = useAuthStore()

      auth.setToken('replaced-token')

      expect(auth.token).toBe('replaced-token')
      expect(auth.isAuthenticated).toBe(true)
    })

    it('does not persist to localStorage', () => {
      const auth = useAuthStore()

      auth.setToken('temp-token')

      expect(localStorage.getItem('auth_token')).toBeNull()
    })

    it('leaves username and its localStorage entry untouched', () => {
      const auth = useAuthStore()
      auth.login('my-token', 'voltorb')

      auth.setToken('replaced-token')

      expect(auth.token).toBe('replaced-token')
      expect(auth.username).toBe('voltorb')
      expect(localStorage.getItem('auth_username')).toBe('voltorb')
    })
  })

  //re-login
  describe('re-login (overwrite)', () => {
    it('replaces old token and username with new ones', () => {
      const auth = useAuthStore()
      auth.login('first-token', 'first-user')

      auth.login('second-token', 'second-user')

      expect(auth.token).toBe('second-token')
      expect(auth.username).toBe('second-user')
      expect(localStorage.getItem('auth_token')).toBe('second-token')
    })

    it('preserves the existing username when re-login omits one', () => {
      const auth = useAuthStore()
      auth.login('first-token', 'first-user')

      auth.login('second-token')

      expect(auth.token).toBe('second-token')
      expect(auth.username).toBe('first-user')
      expect(localStorage.getItem('auth_token')).toBe('second-token')
      expect(localStorage.getItem('auth_username')).toBe('first-user')
    })
  })
})