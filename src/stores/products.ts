import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FakeStoreProduct, Category } from '@/services/api/fakestore'
import { fakestoreApi } from '@/services/api/fakestore'

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

  // Fetches all categories for the header nav
  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      categories.value = await fakestoreApi.getCategories()
    } catch {
      error.value = 'Failed to load categories'
    } finally {
      loading.value = false
    }
  }

  // Fetches all products (no category filter)
  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      products.value = await fakestoreApi.getProducts()
    } catch {
      error.value = 'Failed to load products'
    } finally {
      loading.value = false
    }
  }

  // Fetches products filtered by a specific category
  async function fetchProductsByCategory(cat: string) {
    loading.value = true
    error.value = null
    try {
      products.value = await fakestoreApi.getProductsByCategory(cat)
    } catch {
      error.value = 'Failed to load products for category'
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