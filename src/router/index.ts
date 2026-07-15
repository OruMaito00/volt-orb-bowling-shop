import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, RouteLocationRaw, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/modules/home/HomeView.vue'),
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('@/modules/home/HomeView.vue'),
  },
  {
    path: '/products/:id',
    name: 'product-detail',
    component: () => import('@/modules/product/ProductView.vue'),
    props: (route) => ({ id: Number(route.params.id) }),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/LoginView.vue'),
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/modules/cart/CartView.vue'),
  },
  {
    path: '/wishlist',
    name: 'wishlist',
    component: () => import('@/modules/wishlist/WishlistView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/modules/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export function authGuard(to: RouteLocationNormalized): RouteLocationRaw | void {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
}

router.beforeEach(authGuard)

export default router
