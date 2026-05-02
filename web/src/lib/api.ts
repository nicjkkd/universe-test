import { productSchema, productsPageSchema } from './schemas'
import type { Product, ProductsPage } from './schemas'

export type { Product, ProductsPage }

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('[api] NEXT_PUBLIC_API_URL must be set in production')
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function assertOk(res: Response): Promise<void> {
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, body, `HTTP ${res.status}`)
  }
}

export async function fetchProducts(page: number, limit: number): Promise<ProductsPage> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  const res = await fetch(`${BASE}/products?${params}`)
  await assertOk(res)
  return productsPageSchema.parse(await res.json())
}

export async function createProduct(data: {
  name: string
  description: string
  price: number
}): Promise<Product> {
  const res = await fetch(`${BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  await assertOk(res)
  return productSchema.parse(await res.json())
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${BASE}/products/${id}`, { method: 'DELETE' })
  await assertOk(res)
}
