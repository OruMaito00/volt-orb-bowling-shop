import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWishlistStore = defineStore('wishlist', () => {
  // Restore from localStorage so users don't lose their wishlist on refresh
  const stored = localStorage.getItem('wishlist_ids')
  const productIds = ref<number[]>(stored ? JSON.parse(stored) : [])

  // Helper: sync productIds to localStorage after every mutation
  function persist() {
    localStorage.setItem('wishlist_ids', JSON.stringify(productIds.value))
  }

  // Adds a product to the wishlist (does nothing if it's already saved)
  function addToWishlist(productId: number) {
    if (!productIds.value.includes(productId)) {
      productIds.value.push(productId)
      persist()
    }
  }

  // Removes a product from the wishlist
  function removeFromWishlist(productId: number) {
    productIds.value = productIds.value.filter((id) => id !== productId)
    persist()
  }

  // Empties the wishlist
  function clearWishlist() {
    productIds.value = []
    persist()
  }

  // Read helper: check if a product is already saved (used for heart icons)
  function isInWishlist(productId: number): boolean {
    return productIds.value.includes(productId)
  }

  return { productIds, addToWishlist, removeFromWishlist, clearWishlist, isInWishlist }
})