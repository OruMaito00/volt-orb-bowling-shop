import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FakeStoreProduct, Category } from '@/services/api/fakestore'
import { fakestoreApi } from '@/services/api/fakestore'
import { bowlingProducts, BOWLING_CATEGORY } from '@/data/bowlingProducts'
import { useUiStore } from '@/stores/ui'

export const useProductsStore = defineStore('products', () => {
  // Product list shown on the home grid
  const products = ref<FakeStoreProduct[]>([])
  // Category list rendered in the header navigation
  const categories = ref<Category[]>([])
  // Currently active category filter (null = all products)
  const selectedCategory = ref<Category | null>(null)
  // Loading/error flags the UI reads for spinners and error messages
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Wire global error banner so users get a retry button on fetch failures
  const ui = useUiStore()

  // Fetches API categories and injects our local bowling category
  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const apiCategories = await fakestoreApi.getCategories()
      categories.value = [...apiCategories, BOWLING_CATEGORY]
    } catch {
      error.value = 'Failed to load categories'
      ui.setError('Failed to load categories', fetchCategories)
    } finally {
      loading.value = false
    }
  }

  // Fetches all API products and merges with local bowling products
  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      const apiProducts = await fakestoreApi.getProducts()
      products.value = [...bowlingProducts, ...apiProducts]
    } catch {
      error.value = 'Failed to load products'
      ui.setError('Failed to load products', fetchProducts)
    } finally {
      loading.value = false
    }
  }

  // Fetches products filtered by a specific category
  // Bowling category uses local data only — no API call needed
  async function fetchProductsByCategory(cat: string) {
    if (cat === BOWLING_CATEGORY) {
      products.value = bowlingProducts
      return
    }
    loading.value = true
    error.value = null
    try {
      products.value = await fakestoreApi.getProductsByCategory(cat)
    } catch {
      error.value = 'Failed to load products for category'
      ui.setError('Failed to load products for category', () => fetchProductsByCategory(cat))
    } finally {
      loading.value = false
    }
  }

  // Sets the active category filter (null resets to "all products")
  function setSelectedCategory(cat: Category | null) {
    selectedCategory.value = cat
  }

  return {
    products,
    categories,
    selectedCategory,
    loading,
    error,
    fetchCategories,
    fetchProducts,
    fetchProductsByCategory,
    setSelectedCategory,
  }
})