<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { FakeStoreProduct } from '@/services/api/fakestore'
import { useCartStore } from '@/stores/cart'

const props = defineProps<{
  product: FakeStoreProduct
}>()

const router = useRouter()
const cart = useCartStore()

function goToProduct() {
  router.push({ name: 'product-detail', params: { id: props.product.id } })
}

function addToCart() {
  cart.addToCart(props.product.id, props.product.price)
}
</script>

<template>
  <article
    class="product-card"
    tabindex="0"
    @click="goToProduct"
    @keydown.enter="goToProduct"
  >
    <div class="product-card__image">
      <img :src="product.image" :alt="product.title" loading="lazy" />
    </div>
    <div class="product-card__body">
      <h3 class="product-card__title">{{ product.title }}</h3>
      <div class="product-card__footer">
        <p class="product-card__price">${{ product.price.toFixed(2) }}</p>
        <button
          class="product-card__add"
          @click.stop="addToCart"
          @keydown.stop
          aria-label="Add to cart"
        >
          Add to cart
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as m;

.product-card {
  @include m.card-layout;
  cursor: pointer;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: var(--shadow-md);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}

.product-card__image {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background-color: var(--color-bg);

  img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
  }
}

.product-card__body {
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-md);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-card__title {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: var(--spacing-sm);
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  margin-top: auto;
}

.product-card__price {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-primary);
}

.product-card__add {
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.9;
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}
</style>