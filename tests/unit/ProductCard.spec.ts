import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProductCard from '@/components/products/ProductCard.vue'
import { useCartStore } from '@/stores/cart'
import type { FakeStoreProduct } from '@/services/api/fakestore'

const push = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}))

function makeProduct(overrides: Partial<FakeStoreProduct> = {}): FakeStoreProduct {
  return {
    id: 7,
    title: 'Bowling Ball',
    price: 19.99,
    description: 'A pristine bowling ball.',
    category: 'sports',
    image: 'https://example.com/ball.png',
    ...overrides,
  }
}

describe('ProductCard', () => {
  let wrapper: ReturnType<typeof mount>
  let product: FakeStoreProduct

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    push.mockClear()
    product = makeProduct()
    wrapper = mount(ProductCard, {
      props: { product },
    })
  })

  describe('rendering', () => {
    it('renders the image with src, alt, and lazy loading', () => {
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe(product.image)
      expect(img.attributes('alt')).toBe(product.title)
      expect(img.attributes('loading')).toBe('lazy')
    })

    it('renders the product title in an h3', () => {
      const heading = wrapper.find('h3.product-card__title')
      expect(heading.text()).toBe(product.title)
    })

    it('formats the price with a dollar sign and two decimals', () => {
      expect(wrapper.find('.product-card__price').text()).toBe('$19.99')
    })

    it('formats whole-number prices with trailing zeros', () => {
      const card = mount(ProductCard, {
        props: { product: makeProduct({ price: 4 }) },
      })
      expect(card.find('.product-card__price').text()).toBe('$4.00')
    })

    it('formats single-decimal prices with a trailing zero', () => {
      const card = mount(ProductCard, {
        props: { product: makeProduct({ price: 4.5 }) },
      })
      expect(card.find('.product-card__price').text()).toBe('$4.50')
    })

    it('renders an "Add to cart" button', () => {
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('Add to cart')
    })

    it('exposes an accessible aria-label on the add button', () => {
      expect(wrapper.find('button').attributes('aria-label')).toBe('Add to cart')
    })

    it('is keyboard-focusable via tabindex="0"', () => {
      expect(wrapper.find('article').attributes('tabindex')).toBe('0')
    })
  })

  describe('card navigation', () => {
    it('navigates to the product detail route when the card is clicked', async () => {
      await wrapper.find('article').trigger('click')

      expect(push).toHaveBeenCalledOnce()
      expect(push).toHaveBeenCalledWith({
        name: 'product-detail',
        params: { id: product.id },
      })
    })

    it('navigates to the product detail route when Enter is pressed on the card', async () => {
      await wrapper.find('article').trigger('keydown', { key: 'Enter' })

      expect(push).toHaveBeenCalledOnce()
      expect(push).toHaveBeenCalledWith({
        name: 'product-detail',
        params: { id: product.id },
      })
    })
  })

  describe('add to cart button', () => {
    it('adds the product to the cart when the button is clicked', async () => {
      const cart = useCartStore()

      await wrapper.find('button').trigger('click')

      expect(cart.itemCount).toBe(1)
      expect(cart.items[0]).toEqual({
        productId: product.id,
        quantity: 1,
        price: product.price,
      })
    })

    it('does not navigate when the button is clicked (event.stop propagation)', async () => {
      await wrapper.find('button').trigger('click')

      expect(push).not.toHaveBeenCalled()
    })

    it('does not navigate when Enter is pressed on the button (keydown.stop)', async () => {
      await wrapper.find('button').trigger('keydown', { key: 'Enter' })

      expect(push).not.toHaveBeenCalled()
    })
  })
})