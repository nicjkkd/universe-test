const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export interface Product {
  id: string
  name: string
  description: string
  price: string
  createdAt: string
}

export interface ProductsPage {
  items: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function fetchProducts(page: number, limit: number): Promise<ProductsPage> {
  const res = await fetch(`${BASE}/products?page=${page}&limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json() as Promise<ProductsPage>
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
  if (!res.ok) throw new Error('Failed to create product')
  return res.json() as Promise<Product>
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${BASE}/products/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete product')
}
