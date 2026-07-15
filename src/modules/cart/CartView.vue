<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useProductResolver } from '@/composables/useProductResolver'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const { resolved, loading, resolveError, resolveAll } = useProductResolver()

const showCheckoutMsg = ref(false)

onMounted(() => {
  if (cart.items.length > 0) {
    resolveAll(cart.items.map((item) => item.productId))
  }
})

function removeItem(productId: number) {
  cart.removeFromCart(productId)
}

function increaseQuantity(productId: number) {
  cart.incrementQuantity(productId)
}

function decreaseQuantity(productId: number) {
  cart.decrementQuantity(productId)
}

function clearCart() {
  cart.clearCart()
}

function proceedToCheckout() {
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: '/cart' } })
    return
  }
  // Checkout endpoint doesn't exist on Fake Store API — honest feedback
  showCheckoutMsg.value = true
}

function continueShopping() {
  router.push('/')
}
</script>

<template>
  <section class="cart">
    <!-- Checkout confirmation message -->
    <div v-if="showCheckoutMsg" class="cart__notice">
      <p>Checkout is not implemented in this exercise. This is a demo using Fake Store API, which does not provide a checkout endpoint.</p>
      <button class="cart__back" @click="showCheckoutMsg = false">Back to cart</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="cart.items.length === 0" class="cart__empty">
      <p>Your cart is empty</p>
      <button class="cart__continue" @click="continueShopping">&larr; Continue shopping</button>
    </div>

    <!-- Cart with items -->
    <div v-else>
      <h1 class="cart__title">Your Cart ({{ cart.itemCount }} items)</h1>

      <p v-if="loading" class="cart__status">Loading product details...</p>
      <p v-if="resolveError" class="cart__error">{{ resolveError }}</p>

      <TransitionGroup name="list" tag="div" class="cart__items">
        <div
          v-for="item in cart.items"
          :key="item.productId"
          class="cart-item"
        >
          <button
            class="cart-item__remove"
            @click="removeItem(item.productId)"
            aria-label="Remove item"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8"/>
            </svg>
          </button>

          <div class="cart-item__image">
            <img
              v-if="resolved.get(item.productId)"
              :src="resolved.get(item.productId)!.image"
              :alt="resolved.get(item.productId)!.title"
            />
          </div>

          <div class="cart-item__info">
            <div class="cart-item__name">{{ resolved.get(item.productId)?.title ?? 'Loading...' }}</div>
            <div class="cart-item__category">{{ resolved.get(item.productId)?.category ?? '' }}</div>
          </div>

            <div class="cart-item__subtotal">${{ (item.price * item.quantity).toFixed(2) }}</div>
            <div class="cart-item__quantity" aria-label="Quantity controls">
              <button
                class="cart-item__qty-btn"
                @click="decreaseQuantity(item.productId)"
                aria-label="Decrease quantity"
              >
                &minus;
              </button>
              <span class="cart-item__qty-value" aria-live="polite">{{ item.quantity }}</span>
              <button
                class="cart-item__qty-btn"
                @click="increaseQuantity(item.productId)"
                aria-label="Increase quantity"
              >
                &plus;
              </button>
            </div>
        </div>
      </TransitionGroup>

      <div class="cart__summary">
        <p class="cart__total">Total: ${{ cart.totalPrice.toFixed(2) }}</p>
        <div class="cart__actions">
          <button class="cart__clear" @click="clearCart">Clear cart</button>
          <button class="cart__checkout" @click="proceedToCheckout">Proceed to checkout</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as m;

.cart {
  padding-top: var(--spacing-lg);
}

.cart__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
}

.cart__items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

// Cart item removal — fade + slide out so the list doesn't snap
.list-leave-active {
  transition: all var(--duration-slow) var(--ease-standard);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-1rem);
}

.cart-item {
  position: relative;
  display: grid;
  grid-template-columns: 64px 1fr;
  grid-template-rows: auto auto;
  align-items: center;
  justify-items: end;
  gap: var(--spacing-xs) var(--spacing-md);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  padding-top: calc(var(--spacing-md) + 0.25rem);

  // Product name/category stay left-aligned for readability while the rest
  // of the cart-item uses justify-items: end on mobile.
  .cart-item__info {
    justify-self: start;
    grid-column: 2;
    grid-row: 1;
  }

  .cart-item__image {
    grid-column: 1;
    grid-row: 1;
  }


  @include m.respond-to('tablet') {
    grid-template-columns: 64px 1fr auto;
    grid-template-rows: auto;
    justify-items: normal;
    gap: var(--spacing-md);

    .cart-item__info {
      grid-column: 2;
      grid-row: 1;
    }

    .cart-item__image {
      grid-row: 1;
    }

  }
}

.cart-item__image {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  overflow: hidden;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}

.cart-item__info {
  min-width: 0;
}

.cart-item__name {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.3;
}

.cart-item__category {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: capitalize;
}

.cart-item__quantity {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

.cart-item__qty-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition:
    border-color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard);

  &:hover {
    border-color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.97);
  }
}

.cart-item__qty-value {
  display: inline-block;
  min-width: 1.5rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.cart-item__subtotal {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-primary);
  white-space: nowrap;
}

.cart-item__remove {
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: none;
  color: var(--color-text-muted);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard);

  &:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.97);
  }
}

.cart__summary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.cart__total {
  font-size: 1.25rem;
  font-weight: 700;
  text-align: right;
}

.cart__actions {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.cart__clear {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.875rem;
  color: var(--color-text-muted);
  transition: border-color var(--duration-fast) var(--ease-standard);

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}

.cart__checkout {
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-xl);
  font-size: 0.875rem;
  font-weight: 600;
  transition: opacity var(--duration-fast) var(--ease-standard);

  &:hover {
    opacity: 0.9;
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}

.cart__status,
.cart__error {
  color: var(--color-text-muted);
  padding: var(--spacing-md) 0;
}

.cart__error {
  color: var(--color-primary);
}

.cart__empty {
  text-align: center;
  padding: var(--spacing-xl) 0;

  p {
    font-size: 1.125rem;
    color: var(--color-text-muted);
    margin-bottom: var(--spacing-md);
  }
}

.cart__continue {
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

.cart__notice {
  text-align: center;
  padding: var(--spacing-xl);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);

  p {
    color: var(--color-text-muted);
    margin-bottom: var(--spacing-md);
  }
}

.cart__back {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.875rem;
  color: var(--color-text);

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
}
</style>