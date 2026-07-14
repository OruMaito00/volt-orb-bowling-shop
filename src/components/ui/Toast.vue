<script setup lang="ts">
import { toast } from '@/composables/useToast'
</script>

<template>
  <Transition name="toast">
    <div v-if="toast" class="toast">
      {{ toast.message }}
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  z-index: 300;
  background-color: var(--color-surface);
  color: var(--color-text);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  font-size: 0.875rem;
  font-weight: 500;
  transform: translateX(-50%);
}

.toast-enter-active,
.toast-leave-active {
  transition: all var(--duration-normal) var(--ease-decel);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(1rem);
}

.toast-leave-to {
  opacity: 0;
}
</style>
