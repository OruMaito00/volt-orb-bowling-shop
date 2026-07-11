<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import CategoryTabs from '@/components/ui/CategoryTabs.vue'
import type { Category } from '@/services/api/fakestore'

const route = useRoute()
const router = useRouter()
const products = useProductsStore()
const cart = useCartStore()
const auth = useAuthStore()

const isMenuOpen = ref(false)

// Fetch categories on mount so the nav has something to show
onMounted(() => {
  if (products.categories.length === 0) {
    products.fetchCategories()
  }
})

// Close mobile menu when navigating away
watch(() => route.fullPath, () => {
  isMenuOpen.value = false
})

function onCategorySelect(cat: Category | null) {
  if (cat) {
    router.push({ path: '/products', query: { category: cat } })
  } else {
    router.push({ path: '/' })
  }
  isMenuOpen.value = false
}

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <header class="header">
    <div class="container header__inner">
      <!-- Brand: logo + name -->
      <router-link to="/" class="header__brand">
        <img
          src="/logo/voltorb-logo.webp"
          alt="Volt-Orb Bowling Shop logo"
          class="header__logo"
        />
        <span class="header__name">Volt-Orb Bowling Shop</span>
      </router-link>

      <!-- Desktop category nav (hidden on mobile) -->
      <CategoryTabs
        class="header__nav--desktop"
        :categories="products.categories"
        :active="products.selectedCategory"
        @select="onCategorySelect"
      />

      <!-- Right side actions -->
      <nav class="header__actions" aria-label="Account and cart">
        <!-- Mobile hamburger -->
        <button
          class="header__hamburger"
          :aria-expanded="isMenuOpen"
          aria-label="Toggle category menu"
          @click="isMenuOpen = !isMenuOpen"
        >
          ☰
        </button>

        <!-- Cart with counter badge -->
        <router-link to="/cart" class="header__cart" aria-label="Shopping cart">
          🛒
          <span class="header__cart-count">{{ cart.itemCount }}</span>
        </router-link>

        <!-- Auth links -->
        <template v-if="auth.isAuthenticated">
          <router-link to="/wishlist" class="header__link">Wishlist</router-link>
          <button class="header__link header__logout" @click="handleLogout">
            Logout
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="header__link">Login</router-link>
        </template>
      </nav>
    </div>

    <!-- Mobile dropdown category nav -->
    <div v-if="isMenuOpen" class="header__mobile-nav">
      <div class="container">
        <CategoryTabs
          :categories="products.categories"
          :active="products.selectedCategory"
          @select="onCategorySelect"
        />
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as m;

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  gap: var(--spacing-md);
}

// Brand
.header__brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-text);
  text-decoration: none;
  flex-shrink: 0;

  &:hover {
    text-decoration: none;
  }
}

.header__logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.header__name {
  font-weight: 700;
  font-size: 1.125rem;
  white-space: nowrap;

  // Hide the name on very small screens to save space
  @media (max-width: 400px) {
    display: none;
  }
}

// Desktop nav — hidden on mobile, visible on desktop
.header__nav--desktop {
  display: none;
  flex: 1;
  justify-content: center;
}

// Actions
.header__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

// Hamburger — visible on mobile, hidden on desktop
.header__hamburger {
  display: block;
  font-size: 1.25rem;
  background: none;
  border: none;
  color: var(--color-text);
  padding: var(--spacing-xs);

  @include m.respond-to('desktop') {
    display: none;
  }
}

// Cart
.header__cart {
  position: relative;
  text-decoration: none;
  font-size: 1.25rem;
  color: var(--color-text);
  display: flex;
  align-items: center;

  &:hover {
    text-decoration: none;
  }
}

.header__cart-count {
  position: absolute;
  top: -4px;
  right: -8px;
  background-color: var(--color-primary);
  color: #ffffff;
  font-size: 0.625rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

// Auth links
.header__link {
  font-size: 0.875rem;
  color: var(--color-text);
  text-decoration: none;
  background: none;
  border: none;

  &:hover {
    color: var(--color-primary);
    text-decoration: none;
  }
}

.header__logout {
  cursor: pointer;
}

// Mobile nav dropdown
.header__mobile-nav {
  padding-bottom: var(--spacing-sm);

  .category-tabs {
    flex-direction: column;

    .category-tab {
      text-align: left;
    }
  }

  @include m.respond-to('desktop') {
    display: none;
  }
}

// Show desktop nav at desktop breakpoint
@include m.respond-to('desktop') {
  .header__nav--desktop {
    display: flex;
  }

  .header__mobile-nav {
    display: none;
  }
}
</style>