<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fakestoreApi } from '@/services/api/fakestore'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

// Redirect already-authenticated users away from the login page
onMounted(() => {
  if (auth.isAuthenticated) {
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  }
})

async function handleLogin() {
  loading.value = true
  error.value = null
  try {
    const res = await fakestoreApi.login({
      username: username.value,
      password: password.value,
    })
    auth.login(res.token, username.value)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e) {
    // Distinguish API credential errors (e.g. 401) from actual network failures
    const isApiError = e instanceof Error && e.message.startsWith('API')
    if (isApiError) {
      error.value = 'Invalid username or password'
    } else {
      ui.setError('Unable to reach the server. Please check your connection.', handleLogin)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="login">
    <form class="login__form" @submit.prevent="handleLogin">
      <h1 class="login__title">Sign in</h1>
      <p class="login__hint">
        Demo: <code>mor_2314</code> / <code>83r5^_</code> &nbsp;or&nbsp; <code>johnd</code> / <code>m38rmF$</code>
      </p>

      <label class="login__field">
        <span>Username</span>
        <input v-model.trim="username" type="text" autocomplete="username" />
      </label>

      <label class="login__field">
        <span>Password</span>
        <div class="login__input-wrap">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
          />
          <button
            type="button"
            class="login__toggle"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
          >
            <svg
              v-if="showPassword"
              class="login__toggle-icon"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            <svg
              v-else
              class="login__toggle-icon"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </label>

      <p v-if="error" class="login__error">{{ error }}</p>

      <button class="login__submit" type="submit" :disabled="loading">
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>
  </section>
</template>

<style scoped lang="scss">
.login {
  display: flex;
  justify-content: center;
  padding-top: var(--spacing-xl);
}

.login__form {
  width: 100%;
  max-width: 360px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
}

.login__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
}

.login__hint {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-lg);

  code {
    background-color: var(--color-bg);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    font-size: 0.8125rem;
  }
}

.login__field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);

  span {
    font-size: 0.875rem;
    font-weight: 500;
  }

  input {
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: 1rem;
    color: var(--color-text);
    background-color: var(--color-bg);

    &:focus {
      border-color: var(--color-primary);
      outline: 2px solid var(--color-primary);
      outline-offset: -1px;
    }
  }
}

.login__input-wrap {
  position: relative;

  input {
    width: 100%;
    padding-right: 2.5rem;
  }
}

.login__toggle {
  position: absolute;
  right: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-muted);
  padding: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}

.login__toggle-icon {
  width: 1rem;
  height: 1rem;
}

.login__error {
  color: var(--color-primary);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-sm);
}

.login__submit {
  width: 100%;
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 1rem;
  font-weight: 600;
  transition: opacity var(--duration-fast) var(--ease-standard);

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}
</style>