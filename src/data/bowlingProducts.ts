import type { FakeStoreProduct } from '@/services/api/fakestore'

// Local bowling ball products — merged with Fake Store API products in the products store.
// IDs start at 101 to avoid collision with API products (1–20).
// These will eventually show 3D GLB models (Phase 2) instead of placeholder images.

export const bowlingProducts: FakeStoreProduct[] = [
  {
    id: 101,
    title: 'Volt-Orb Reactive Resin',
    price: 149.99,
    description:
      'Professional-grade reactive resin coverstock with a polished finish for maximum backend reaction. Designed for medium-oily lane conditions, this ball delivers a strong angular break point that pins love. The Volt-Orb core design provides predictable mid-lane read with explosive pin carry.',
    category: 'bowling',
    image: '/images/placeholder-ball-1.svg',
  },
  {
    id: 102,
    title: 'Thunder Strike Urethane',
    price: 119.99,
    description:
      'Urethane coverstock engineered for medium-dry lane conditions where you need controlled hook and smooth arc. The Thunder core provides a consistent roll with reduced backend reaction, making it ideal for sport patterns and spare shots that demand accuracy over power.',
    category: 'bowling',
    image: '/images/placeholder-ball-2.svg',
  },
  {
    id: 103,
    title: 'Pin Crusher Plastic',
    price: 79.99,
    description:
      'Durable plastic coverstock built to last. The go-to ball for spare shots and dry lane conditions. Low friction ensures a straight path to the pins, making this the most reliable spare converter in your bag. Perfect for beginners and tournament spare systems alike.',
    category: 'bowling',
    image: '/images/placeholder-ball-3.svg',
  },
]

// Helper: returns the local bowling product if the ID matches, otherwise undefined
export function isBowlingProduct(id: number): FakeStoreProduct | undefined {
  return bowlingProducts.find((p) => p.id === id)
}

// The custom category to inject into the header nav alongside API categories
export const BOWLING_CATEGORY = 'bowling'