<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <section class="not-found">
    <h1 class="not-found__title">Page not found</h1>
    <p class="not-found__message">The page you're looking for doesn't exist or has moved.</p>
    <button class="not-found__back" @click="goHome">Back to shop</button>
  </section>
</template>

<style scoped lang="scss">
.not-found {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.not-found__title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.not-found__message {
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-lg);
}

.not-found__back {
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.875rem;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}
</style>
