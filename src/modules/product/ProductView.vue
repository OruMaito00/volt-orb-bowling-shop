<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fakestoreApi } from '@/services/api/fakestore'
import type { FakeStoreProduct } from '@/services/api/fakestore'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useAuthStore } from '@/stores/auth'
import { isBowlingProduct } from '@/data/bowlingProducts'
import BowlingBallViewer from '@/3d/BowlingBallViewer.vue'

const props = defineProps<{
  id: number
}>()

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const wishlist = useWishlistStore()
const auth = useAuthStore()

const product = ref<FakeStoreProduct | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const showLoginPrompt = ref(false)
const loginPromptCancelRef = ref<HTMLButtonElement | null>(null)
const dialogCardRef = ref<HTMLElement | null>(null)
let lastActiveElement: HTMLElement | null = null

async function fetchProduct() {
  loading.value = true
  error.value = null
  try {
    // Check local bowling products first — instant, no API call
    const local = isBowlingProduct(props.id)
    if (local) {
      product.value = local
      return
    }
    // Not a bowling product — fetch from the API
    product.value = await fakestoreApi.getProduct(props.id)
  } catch {
    error.value = 'Failed to load product'
  } finally {
    loading.value = false
  }
}

onMounted(fetchProduct)

// Router reuses the same component for /products/1 → /products/2
// so we watch the id prop and re-fetch when it changes
watch(() => props.id, fetchProduct)

function addToCart() {
  if (product.value) {
    cart.addToCart(product.value.id, product.value.price)
  }
}

function toggleWishlist() {
  if (!product.value) return
  if (!auth.isAuthenticated) {
    showLoginPrompt.value = true
    return
  }
  if (wishlist.isInWishlist(product.value.id)) {
    wishlist.removeFromWishlist(product.value.id)
  } else {
    wishlist.addToWishlist(product.value.id)
  }
}

function goToLogin() {
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}

function goBack() {
  router.back()
}

function closeLoginPrompt() {
  showLoginPrompt.value = false
}

watch(showLoginPrompt, (open) => {
  if (open) {
    lastActiveElement = document.activeElement as HTMLElement
    nextTick(() => {
      loginPromptCancelRef.value?.focus()
    })
  } else if (lastActiveElement) {
    lastActiveElement.focus()
    lastActiveElement = null
  }
})

function handleDialogTab(event: KeyboardEvent) {
  const card = dialogCardRef.value
  if (!card) return
  const focusables = card.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  if (focusables.length === 0) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  const active = document.activeElement as HTMLElement
  if (event.shiftKey) {
    if (active === first) {
      event.preventDefault()
      last.focus()
    }
  } else {
    if (active === last) {
      event.preventDefault()
      first.focus()
    }
  }
}
</script>

<template>
  <section class="product-detail" v-if="product">
    <button class="product-detail__back" @click="goBack">&larr; Back</button>
    <div class="product-detail__layout">
      <div class="product-detail__image">
        <BowlingBallViewer
          v-if="product.model3d"
          :src="product.model3d"
          :poster="product.image"
          :alt="product.title"
          :camera-position="{ x: 1, y: 4.0, z: 9.0 }"
          :camera-target="{ x: 0, y: 0, z: 0 }"
        />
        <img v-else :src="product.image" :alt="product.title" />
      </div>
      <div class="product-detail__info">
        <p class="product-detail__category">{{ product.category }}</p>
        <h1 class="product-detail__title">{{ product.title }}</h1>
        <p class="product-detail__price">${{ product.price.toFixed(2) }}</p>
        <p class="product-detail__desc">{{ product.description }}</p>
        <div class="product-detail__actions">
          <button class="product-detail__cta" @click="addToCart">Add to cart</button>
          <button
            class="product-detail__wishlist"
            :class="{ 'is-saved': product && wishlist.isInWishlist(product.id) }"
            @click="toggleWishlist"
            :aria-label="product && wishlist.isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'"
          >
            {{ product && wishlist.isInWishlist(product.id) ? '&#9829;' : '&#9825;' }}
          </button>
        </div>
      </div>
    </div>
  </section>

  <p v-if="loading" class="product-detail__status">Loading...</p>
  <p v-if="error" class="product-detail__error">{{ error }}</p>

  <!-- Login required dialog -->
  <div
    v-if="showLoginPrompt"
    class="login-prompt"
    role="dialog"
    aria-modal="true"
    aria-labelledby="login-prompt-title"
    @click.self="closeLoginPrompt"
    @keydown.escape="closeLoginPrompt"
    @keydown.tab="handleDialogTab"
  >
    <div ref="dialogCardRef" class="login-prompt__card">
      <p id="login-prompt-title" class="login-prompt__title">Login required</p>
      <p class="login-prompt__message">You need to be signed in to save items to your wishlist.</p>
      <div class="login-prompt__actions">
        <button ref="loginPromptCancelRef" class="login-prompt__cancel" @click="closeLoginPrompt">Cancel</button>
        <button class="login-prompt__login" @click="goToLogin">Sign in</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as m;

.product-detail {
  padding-top: var(--spacing-lg);
}

.product-detail__back {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-md);
  padding: 0;

  &:hover {
    color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}

.product-detail__layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);

  @include m.respond-to('desktop') {
    flex-direction: row;
    align-items: flex-start;
  }
}

.product-detail__image {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;

  @include m.respond-to('desktop') {
    flex: 0 0 400px;
  }

  img {
    max-width: 100%;
    max-height: 400px;
    object-fit: contain;
  }
}

.product-detail__info {
  flex: 1;
}

.product-detail__category {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.product-detail__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.product-detail__price {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.product-detail__desc {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-lg);
}

.product-detail__actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: stretch;
}

.product-detail__cta {
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-xl);
  font-size: 1rem;
  font-weight: 600;
  flex: 1;
  transition: opacity 0.15s;

  @include m.respond-to('desktop') {
    flex: 0 0 auto;
  }

  &:hover {
    opacity: 0.9;
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}

.product-detail__wishlist {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  width: 3rem;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--color-text-muted);
  transition: color 0.15s, border-color 0.15s;
  flex-shrink: 0;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  &.is-saved {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}

.product-detail__status,
.product-detail__error {
  text-align: center;
  padding: var(--spacing-xl) 0;
  color: var(--color-text-muted);
}

.product-detail__error {
  color: var(--color-primary);
}

// Login required popup
.login-prompt {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.login-prompt__card {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  max-width: 320px;
  width: calc(100% - 2rem);
  text-align: center;
}

.login-prompt__title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.login-prompt__message {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-lg);
}

.login-prompt__actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
}

.login-prompt__cancel {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.875rem;
  color: var(--color-text-muted);

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}

.login-prompt__login {
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.875rem;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}
</style>