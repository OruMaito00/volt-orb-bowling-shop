<script setup lang="ts">
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()

function handleRetry() {
  ui.retry()
}

function handleDismiss() {
  ui.clearError()
}
</script>

<template>
  <Transition name="banner">
    <div v-if="ui.error" class="error-banner" role="alert" aria-live="assertive">
      <div class="error-banner__content">
        <span class="error-banner__icon" aria-hidden="true">⚠</span>
        <span class="error-banner__message">{{ ui.error }}</span>
        <div class="error-banner__actions">
          <button
            v-if="ui.retryHandler"
            class="error-banner__retry"
            @click="handleRetry"
          >
            Retry
          </button>
          <button
            class="error-banner__dismiss"
            @click="handleDismiss"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.error-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 250;
  background-color: var(--color-surface);
  border-bottom: 2px solid var(--color-primary);
  box-shadow: var(--shadow-md);
}

.error-banner__content {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.error-banner__icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.error-banner__message {
  font-size: 0.875rem;
  font-weight: 500;
  flex: 1;
  min-width: 0;
}

.error-banner__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.error-banner__retry {
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}

.error-banner__dismiss {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 1rem;
  padding: var(--spacing-xs);
  line-height: 1;

  &:hover {
    color: var(--color-text);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}

// Slide-in from top
.banner-enter-active,
.banner-leave-active {
  transition: transform var(--duration-normal) var(--ease-decel),
    opacity var(--duration-normal) var(--ease-decel);
}

.banner-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.banner-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
