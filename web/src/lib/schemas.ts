import { z } from "zod"

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce
    .number()
    .positive("Price must be positive")
    .max(1_000_000, "Price cannot exceed $1,000,000"),
})

export type CreateProductInput = z.infer<typeof createProductSchema>

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.coerce.number().nonnegative(),
  createdAt: z.string(),
})

export const productsPageSchema = z.object({
  items: z.array(productSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export type Product = z.infer<typeof productSchema>
export type ProductsPage = z.infer<typeof productsPageSchema>
