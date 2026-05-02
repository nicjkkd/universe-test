import { z } from "zod"

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
