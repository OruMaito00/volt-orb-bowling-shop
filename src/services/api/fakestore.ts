export interface FakeStoreProduct {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
}

export type Category = string

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
}

const BASE_URL = 'https://fakestoreapi.com'

export const fakestoreApi = {
  async getProducts(): Promise<FakeStoreProduct[]> {
    const res = await fetch(`${BASE_URL}/products`)
    if (!res.ok) throw new Error('Failed to fetch products')
    return res.json()
  },

  async getProduct(id: number): Promise<FakeStoreProduct> {
    const res = await fetch(`${BASE_URL}/products/${id}`)
    if (!res.ok) throw new Error('Failed to fetch product')
    return res.json()
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${BASE_URL}/products/categories`)
    if (!res.ok) throw new Error('Failed to fetch categories')
    return res.json()
  },

  async getProductsByCategory(cat: string): Promise<FakeStoreProduct[]> {
    const res = await fetch(`${BASE_URL}/products/category/${cat}`)
    if (!res.ok) throw new Error('Failed to fetch products by category')
    return res.json()
  },

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Login failed')
    return res.json()
  },
}
