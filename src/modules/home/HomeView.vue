<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import ProductCard from '@/components/products/ProductCard.vue'

const route = useRoute()
const products = useProductsStore()

// Fetch products based on the category query param (or all if absent)
function load() {
  const cat = route.query.category as string | undefined
  if (cat) {
    products.setSelectedCategory(cat)
    products.fetchProductsByCategory(cat)
  } else {
    products.setSelectedCategory(null)
    products.fetchProducts()
  }
}

onMounted(() => {
  // Defensive: ensure categories are loaded for the header nav
  if (products.categories.length === 0) {
    products.fetchCategories()
  }
  load()
})

// Re-fetch when the category query changes (Header CategoryTabs navigation)
watch(() => route.query.category, load)
</script>

<template>
  <section class="home">
    <h1 class="home__title">Shop</h1>

    <Transition name="grid-fade" mode="out-in">
      <div v-if="!products.loading" :key="products.selectedCategory ?? 'all'">
        <p class="home__count">{{ products.products.length }} products</p>
        <div class="home__grid">
          <ProductCard
            v-for="p in products.products"
            :key="p.id"
            :product="p"
          />
        </div>
      </div>
    </Transition>

    <p v-if="products.loading" class="home__status">Loading products...</p>
    <p v-if="products.error" class="home__error">{{ products.error }}</p>
    <p
      v-if="!products.loading && products.products.length === 0 && !products.error"
      class="home__empty"
    >
      No products found
    </p>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as m;

.home {
  padding-top: var(--spacing-lg);
}

.home__title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
}

.home__count {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-lg);
}

.home__grid {
  @include m.grid-spacing;
}

.home__status,
.home__error,
.home__empty {
  text-align: center;
  padding: var(--spacing-xl) 0;
  color: var(--color-text-muted);
}

.home__error {
  color: var(--color-primary);
}

// Category grid — fade out old, fade in new so switching doesn't snap
.grid-fade-enter-active,
.grid-fade-leave-active {
  transition: opacity var(--duration-normal) var(--ease-standard);
}

.grid-fade-enter-from,
.grid-fade-leave-to {
  opacity: 0;
}
</style>