<script setup lang="ts">
import type { Category } from '@/services/api/fakestore'

defineProps<{
  categories: Category[]
  active: Category | null
}>()

const emit = defineEmits<{
  select: [category: Category | null]
}>()

function select(cat: Category | null) {
  emit('select', cat)
}
</script>

<template>
  <nav class="category-tabs" aria-label="Product categories">
    <button
      class="category-tab"
      :class="{ 'is-active': active === null }"
      @click="select(null)"
    >
      All
    </button>
    <button
      v-for="cat in categories"
      :key="cat"
      class="category-tab"
      :class="{ 'is-active': active === cat }"
      @click="select(cat)"
    >
      {{ cat }}
    </button>
  </nav>
</template>

<style scoped lang="scss">
.category-tabs {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.category-tab {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: transparent;
  color: var(--color-text);
  font-size: 0.875rem;
  transition: background-color var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard);

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  &.is-active {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    color: #ffffff;
  }
}
</style>