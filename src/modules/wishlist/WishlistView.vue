<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWishlistStore } from '@/stores/wishlist'
import { useProductResolver } from '@/composables/useProductResolver'

const router = useRouter()
const wishlist = useWishlistStore()
const { resolved, loading, resolveError, resolveAll } = useProductResolver()

onMounted(() => {
  if (wishlist.productIds.length > 0) {
    resolveAll(wishlist.productIds)
  }
})

function removeItem(productId: number) {
  wishlist.removeFromWishlist(productId)
  resolved.value.delete(productId)
}

function clearWishlist() {
  wishlist.clearWishlist()
  resolved.value.clear()
}

function continueShopping() {
  router.push('/')
}
</script>

<template>
  <section class="wishlist">
    <!-- Empty state -->
    <div v-if="wishlist.productIds.length === 0" class="wishlist__empty">
      <p>Your wishlist is empty</p>
      <button class="wishlist__continue" @click="continueShopping">&larr; Continue shopping</button>
    </div>

    <!-- Wishlist with items -->
    <div v-else>
      <h1 class="wishlist__title">Your Wishlist ({{ wishlist.productIds.length }} items)</h1>

      <p v-if="loading" class="wishlist__status">Loading product details...</p>
      <p v-if="resolveError" class="wishlist__error">{{ resolveError }}</p>

      <div class="wishlist__items">
        <div
          v-for="id in wishlist.productIds"
          :key="id"
          class="wishlist-item"
        >
          <div class="wishlist-item__image">
            <img
              v-if="resolved.get(id)"
              :src="resolved.get(id)!.image"
              :alt="resolved.get(id)!.title"
            />
          </div>
          <div class="wishlist-item__info">
            <div class="wishlist-item__name">{{ resolved.get(id)?.title ?? 'Loading...' }}</div>
            <div class="wishlist-item__category">{{ resolved.get(id)?.category ?? '' }}</div>
          </div>
          <div class="wishlist-item__price">${{ resolved.get(id)?.price.toFixed(2) ?? '--' }}</div>
          <button
            class="wishlist-item__remove"
            @click="removeItem(id)"
            aria-label="Remove from wishlist"
          >
            Remove
          </button>
        </div>
      </div>

      <div class="wishlist__actions">
        <button class="wishlist__clear" @click="clearWishlist">Clear wishlist</button>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.wishlist {
  padding-top: var(--spacing-lg);
}

.wishlist__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
}

.wishlist__items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.wishlist-item {
  display: grid;
  grid-template-columns: 64px 1fr auto auto;
  align-items: center;
  gap: var(--spacing-md);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);

  // Stack vertically on mobile
  @media (max-width: 640px) {
    grid-template-columns: 64px 1fr auto;
    grid-template-rows: auto auto;

    .wishlist-item__price {
      grid-column: 2 / 3;
    }
  }
}

.wishlist-item__image {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
  border-radius: var(--radius-sm);
  overflow: hidden;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}

.wishlist-item__info {
  min-width: 0;
}

.wishlist-item__name {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.3;
}

.wishlist-item__category {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: capitalize;
}

.wishlist-item__price {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary);
  white-space: nowrap;
}

.wishlist-item__remove {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  padding: var(--spacing-xs);
  transition: color 0.15s;

  &:hover {
    color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}

.wishlist__actions {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.wishlist__clear {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.875rem;
  color: var(--color-text-muted);
  transition: border-color 0.15s;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}

.wishlist__status,
.wishlist__error {
  color: var(--color-text-muted);
  padding: var(--spacing-md) 0;
}

.wishlist__error {
  color: var(--color-primary);
}

.wishlist__empty {
  text-align: center;
  padding: var(--spacing-xl) 0;

  p {
    font-size: 1.125rem;
    color: var(--color-text-muted);
    margin-bottom: var(--spacing-md);
  }
}

.wishlist__continue {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 1rem;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}
</style>