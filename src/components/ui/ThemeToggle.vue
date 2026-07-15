<script setup lang="ts">
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()

function toggleTheme() {
  ui.setTheme(ui.theme === 'light' ? 'dark' : 'light')
}
</script>

<template>
  <button
    class="theme-toggle"
    :aria-label="ui.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
    :aria-pressed="ui.theme === 'dark'"
    @click="toggleTheme"
  >
    <span v-if="ui.theme === 'light'" aria-hidden="true">☾</span>
    <span v-else aria-hidden="true">☀</span>
  </button>
</template>

<style scoped lang="scss">
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  font-size: 1.25rem;
  background: none;
  border: none;
  color: var(--color-text);
  padding: 0;
  line-height: 1;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-standard);

  &:hover {
    color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}
</style>
