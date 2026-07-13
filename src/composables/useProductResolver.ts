import { ref } from 'vue'
import { fakestoreApi } from '@/services/api/fakestore'
import type { FakeStoreProduct } from '@/services/api/fakestore'
import { isBowlingProduct } from '@/data/bowlingProducts'
import { useProductsStore } from '@/stores/products'

// Resolves product IDs into full FakeStoreProduct objects using a 3-tier lookup:
// 1. Local bowling products (instant)
// 2. Products store cache (instant, if user visited home)
// 3. API fetch (network fallback)
export function useProductResolver() {
  const productsStore = useProductsStore()
  const resolved = ref<Map<number, FakeStoreProduct>>(new Map())
  const loading = ref(false)
  const resolveError = ref<string | null>(null)

  async function resolveAll(ids: number[]) {
    loading.value = true
    resolveError.value = null
    const map = new Map<number, FakeStoreProduct>()

    for (const id of ids) {
      // Tier 1: local bowling products
      const local = isBowlingProduct(id)
      if (local) {
        map.set(id, local)
        continue
      }
      // Tier 2: products store cache
      const cached = productsStore.products.find((p) => p.id === id)
      if (cached) {
        map.set(id, cached)
        continue
      }
      // Tier 3: API fetch
      try {
        const product = await fakestoreApi.getProduct(id)
        map.set(id, product)
      } catch {
        resolveError.value = `Failed to load product ${id}`
      }
    }

    resolved.value = map
    loading.value = false
  }

  return { resolved, loading, resolveError, resolveAll }
}