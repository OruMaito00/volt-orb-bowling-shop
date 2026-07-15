import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
  productId: number
  quantity: number
  price: number // unit price snapshot at add time
}

export const useCartStore = defineStore('cart', () => {
  // Restore from localStorage so users don't lose their cart on refresh
  const stored = localStorage.getItem('cart_items')
  const items = ref<CartItem[]>(stored ? JSON.parse(stored) : [])

  // Total number of items (sum of all quantities)
  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  // Total cart value (sum of price × quantity per item)
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  // Helper: sync items array to localStorage after every mutation
  function persist() {
    localStorage.setItem('cart_items', JSON.stringify(items.value))
  }

  // Adds a product to the cart (increments quantity if it already exists)
  function addToCart(productId: number, price: number) {
    const existing = items.value.find((item) => item.productId === productId)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({ productId, quantity: 1, price })
    }
    persist()
  }

  // Removes a product entirely from the cart
  function removeFromCart(productId: number) {
    items.value = items.value.filter((item) => item.productId !== productId)
    persist()
  }

  // Updates an item's quantity (removes it if quantity drops to 0 or below)
  function updateQuantity(productId: number, quantity: number) {
    const existing = items.value.find((item) => item.productId === productId)
    if (!existing) return

    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    existing.quantity = quantity
    persist()
  }

  // Increments an item's quantity by 1
  function incrementQuantity(productId: number) {
    const existing = items.value.find((item) => item.productId === productId)
    if (existing) {
      existing.quantity++
      persist()
    }
  }

  // Decrements an item's quantity by 1 (removes it if it reaches 0)
  function decrementQuantity(productId: number) {
    const existing = items.value.find((item) => item.productId === productId)
    if (!existing) return

    if (existing.quantity <= 1) {
      removeFromCart(productId)
    } else {
      existing.quantity--
      persist()
    }
  }

  // Empties the cart
  function clearCart() {
    items.value = []
    persist()
  }

  return {
    items,
    itemCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
  }
})