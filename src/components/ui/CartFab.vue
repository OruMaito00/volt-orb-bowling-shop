<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
const cartPulsing = ref(false)

watch(() => cart.itemCount, (newCount, oldCount) => {
  if (newCount > (oldCount ?? 0)) {
    cartPulsing.value = true
    setTimeout(() => {
      cartPulsing.value = false
    }, 400)
  }
})
</script>

<template>
  <router-link
    to="/cart"
    class="cart-fab"
    aria-label="Shopping cart"
  >
    <span class="cart-fab__icon" aria-hidden="true">🛒</span>
    <span
      v-if="cart.itemCount > 0"
      class="cart-fab__count"
      :class="{ 'is-pulsing': cartPulsing }"
    >
      {{ cart.itemCount }}
    </span>
  </router-link>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as m;

.cart-fab {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 100;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-shadow: var(--shadow-lg);
  transition: transform var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}

.cart-fab__icon {
  font-size: 1.25rem;
}

.cart-fab__count {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #ffffff;
  color: var(--color-primary);
  font-size: 0.625rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  transition: transform var(--duration-normal) var(--ease-decel);

  &.is-pulsing {
    transform: scale(1.25);
  }
}

@include m.respond-to('desktop') {
  .cart-fab {
    display: none;
  }
}
</style>
