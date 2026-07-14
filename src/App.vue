<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Toast from '@/components/ui/Toast.vue'
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