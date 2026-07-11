import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
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
    props: true,
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
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router
