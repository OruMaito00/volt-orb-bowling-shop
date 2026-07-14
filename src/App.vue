<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
</script>

<template>
  <Header />
  <main class="app-main">
    <div class="container">
      <router-view />
    </div>
  </main>
</template>

<style scoped lang="scss">
.app-main {
  padding-bottom: var(--spacing-xl);
}
</style>