import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { routes, authGuard } from '@/router'
import { useAuthStore } from '@/stores/auth'

const Stub = { template: '<div />' }

function buildRouter(): Router {
  const stubbed = routes.map((route) => ({ ...route, component: Stub }))
  const router = createRouter({
    history: createMemoryHistory('/'),
    routes: stubbed,
  })
  router.beforeEach(authGuard)
  return router
}

async function navigate(router: Router, path: string) {
  await router.push(path)
  await router.isReady()
  return router.currentRoute.value
}

describe('Router auth guard', () => {
  let router: Router
  let auth: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    router = buildRouter()
    auth = useAuthStore()
  })

  describe('public routes (no auth required)', () => {
    it('lets an unauthenticated user reach the home route', async () => {
      const landed = await navigate(router, '/')
      expect(landed.name).toBe('home')
    })

    it('lets an unauthenticated user reach the products route', async () => {
      const landed = await navigate(router, '/products')
      expect(landed.name).toBe('products')
    })

    it('lets an unauthenticated user reach a product detail route', async () => {
      const landed = await navigate(router, '/products/7')
      expect(landed.name).toBe('product-detail')
      expect(landed.params.id).toBe('7')
    })

    it('lets an unauthenticated user reach the login route with no redirect query', async () => {
      const landed = await navigate(router, '/login')
      expect(landed.name).toBe('login')
      expect(landed.query.redirect).toBeUndefined()
    })
  })

  describe('protected routes (requiresAuth)', () => {
    it('redirects an unauthenticated user from /wishlist to /login', async () => {
      const landed = await navigate(router, '/wishlist')
      expect(landed.name).toBe('login')
      expect(landed.query.redirect).toBe('/wishlist')
    })

    it('preserves the full intended destination (path + query) in the redirect param', async () => {
      const landed = await navigate(router, '/wishlist?sort=price&page=2')
      expect(landed.name).toBe('login')
      expect(landed.query.redirect).toBe('/wishlist?sort=price&page=2')
    })

    it('lets an authenticated user through to /wishlist', async () => {
      auth.login('tok', 'voltorb')
      const landed = await navigate(router, '/wishlist')
      expect(landed.name).toBe('wishlist')
      expect(landed.query.redirect).toBeUndefined()
    })
  })

  describe('redirect round-trip', () => {
    it('captures the intended destination across a login flow at the guard level', async () => {
      const bounced = await navigate(router, '/wishlist')
      expect(bounced.query.redirect).toBe('/wishlist')

      auth.login('tok', 'voltorb')
      const target = (bounced.query.redirect as string) || '/'
      const landed = await navigate(router, target)

      expect(auth.isAuthenticated).toBe(true)
      expect(landed.name).toBe('wishlist')
    })
  })

  describe('guard reactivity', () => {
    it('does not auto-kick a user who logs out while on a protected page', async () => {
      auth.login('tok', 'voltorb')
      await navigate(router, '/wishlist')
      expect(router.currentRoute.value.name).toBe('wishlist')

      // Logging out does NOT cause an in-place redirect — the guard only runs
      // on navigation, so the user stays put until they actually move.
      auth.logout()
      expect(router.currentRoute.value.name).toBe('wishlist')

      // Re-pushing the exact same path is a no-op in vue-router, so navigate
      // away first, then back — that is a real navigation that re-runs the guard.
      await navigate(router, '/')
      const next = await navigate(router, '/wishlist')
      expect(next.name).toBe('login')
      expect(next.query.redirect).toBe('/wishlist')
    })
  })
})