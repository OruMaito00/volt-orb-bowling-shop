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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export const fakestoreApi = {
  getProducts(): Promise<FakeStoreProduct[]> {
    return request<FakeStoreProduct[]>('/products')
  },

  getProduct(id: number): Promise<FakeStoreProduct> {
    return request<FakeStoreProduct>(`/products/${id}`)
  },

  getCategories(): Promise<Category[]> {
    return request<Category[]>('/products/categories')
  },

  getProductsByCategory(cat: string): Promise<FakeStoreProduct[]> {
    return request<FakeStoreProduct[]>(`/products/category/${cat}`)
  },

  login(payload: LoginPayload): Promise<LoginResponse> {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  },
}
