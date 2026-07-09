import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWishlistStore = defineStore('wishlist', () => {
  const productIds = ref<number[]>([])

  function addToWishlist(productId: number) {
    if (!productIds.value.includes(productId)) {
      productIds.value.push(productId)
    }
  }

  function removeFromWishlist(productId: number) {
    productIds.value = productIds.value.filter((id) => id !== productId)
  }

  function clearWishlist() {
    productIds.value = []
  }

  return { productIds, addToWishlist, removeFromWishlist, clearWishlist }
})
