"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { createProduct } from "@/lib/api"
import { createProductSchema, type CreateProductInput } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface Props {
  onSuccess: () => void
}

export function CreateProductForm({ onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
  })

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      reset()
      onSuccess()
    },
  })

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
      <FormItem>
        <FormLabel htmlFor="name" error={!!errors.name}>
          Name
        </FormLabel>
        <Input id="name" placeholder="Product name" {...register("name")} />
        <FormMessage>{errors.name?.message}</FormMessage>
      </FormItem>

      <FormItem>
        <FormLabel htmlFor="description" error={!!errors.description}>
          Description
        </FormLabel>
        <Textarea
          id="description"
          placeholder="Product description"
          {...register("description")}
        />
        <FormMessage>{errors.description?.message}</FormMessage>
      </FormItem>

      <FormItem>
        <FormLabel htmlFor="price" error={!!errors.price}>
          Price
        </FormLabel>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...register("price")}
        />
        <FormMessage>{errors.price?.message}</FormMessage>
      </FormItem>

      {mutation.isError && (
        <p className="text-destructive text-sm">Failed to create product. Try again.</p>
      )}

      <Button type="submit" disabled={mutation.isPending} className="mt-1">
        {mutation.isPending ? "Creating…" : "Create Product"}
      </Button>
    </form>
  )
}
