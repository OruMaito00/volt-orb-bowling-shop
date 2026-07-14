import type { FakeStoreProduct } from '@/services/api/fakestore'

// Local bowling ball products — merged with Fake Store API products in the products store.
// IDs start at 101 to avoid collision with API products (1–20).

export const bowlingProducts: FakeStoreProduct[] = [
  {
    id: 101,
    title: 'Volt-Orb Reactive Resin — Red',
    price: 149.99,
    description:
      'Professional-grade reactive resin coverstock with a polished crimson red finish for maximum backend reaction. Designed for medium-oily lane conditions, this ball delivers a strong angular break point that pins love. The Volt-Orb core design provides predictable mid-lane read with explosive pin carry.',
    category: 'bowling',
    image: `${import.meta.env.BASE_URL}images/bowling_images/voltorb.webp`,
    model3d: `${import.meta.env.BASE_URL}3Dmodels/voltorb.glb`,
  },
  {
    id: 102,
    title: 'Thunder Strike Urethane — Black',
    price: 119.99,
    description:
      'Urethane coverstock engineered for medium-dry lane conditions where you need controlled hook and smooth arc. Finished in deep matte black, the Thunder core provides a consistent roll with reduced backend reaction, making it ideal for sport patterns and spare shots that demand accuracy over power.',
    category: 'bowling',
    image: `${import.meta.env.BASE_URL}images/bowling_images/black.webp`,
    model3d: `${import.meta.env.BASE_URL}3Dmodels/black-bowlingball.glb`,
  },
  {
    id: 103,
    title: 'Pin Crusher Plastic — Red',
    price: 79.99,
    description:
      'Durable plastic coverstock built to last, finished in signature competition red. The go-to ball for spare shots and dry lane conditions. Low friction ensures a straight path to the pins, making this the most reliable spare converter in your bag. Perfect for beginners and tournament spare systems alike.',
    category: 'bowling',
    image: `${import.meta.env.BASE_URL}images/bowling_images/red.webp`,
    model3d: `${import.meta.env.BASE_URL}3Dmodels/red-bowlingball.glb`,
  },
]

// Helper: returns the local bowling product if the ID matches, otherwise undefined
export function isBowlingProduct(id: number): FakeStoreProduct | undefined {
  return bowlingProducts.find((p) => p.id === id)
}

// The custom category to inject into the header nav alongside API categories
export const BOWLING_CATEGORY = 'bowling'
