<script setup lang="ts">
import { onMounted, watch } from 'vue'
import Header from '@/components/layout/Header.vue'
import Toast from '@/components/ui/Toast.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'
import { useUiStore } from '@/stores/ui'
import type { Theme } from '@/stores/ui'

const ui = useUiStore()

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

// Hydrate DOM from localStorage on first mount
onMounted(() => applyTheme(ui.theme))
// React to toggles from ThemeToggle
watch(() => ui.theme, applyTheme)
</script>

<template>
  <Header />
  <main class="app-main">
    <div class="container">
      <router-view v-slot="{ Component }">
        <Transition name="route-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </div>
  </main>
  <Toast />
  <ErrorBanner />
</template>

<style scoped lang="scss">
.app-main {
  padding-bottom: var(--spacing-xl);
}

.route-fade-enter-active,
.route-fade-leave-active {
  transition: opacity var(--duration-normal) var(--ease-standard);
}

.route-fade-enter-from,
.route-fade-leave-to {
  opacity: 0;
}
</style>