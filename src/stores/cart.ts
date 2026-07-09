import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
  productId: number
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  const totalPrice = computed(() => items.value.length)

  function addToCart(productId: number) {
    const existing = items.value.find((item) => item.productId === productId)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({ productId, quantity: 1 })
    }
  }

  function removeFromCart(productId: number) {
    items.value = items.value.filter((item) => item.productId !== productId)
  }

  function clearCart() {
    items.value = []
  }

  return { items, itemCount, totalPrice, addToCart, removeFromCart, clearCart }
})
