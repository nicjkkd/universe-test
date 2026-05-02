"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { createProduct } from "@/lib/api"
import { createProductSchema, type CreateProductInput } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

interface Props {
  onSuccess: () => void
}

export function CreateProductForm({ onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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
      <FormItem hasError={!!errors.name}>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input placeholder="Product name" {...register("name")} />
        </FormControl>
        <FormMessage>{errors.name?.message}</FormMessage>
      </FormItem>

      <FormItem hasError={!!errors.description}>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Textarea placeholder="Product description" {...register("description")} />
        </FormControl>
        <FormMessage>{errors.description?.message}</FormMessage>
      </FormItem>

      <FormItem hasError={!!errors.price}>
        <FormLabel>Price</FormLabel>
        <FormControl>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("price", { valueAsNumber: true })}
          />
        </FormControl>
        <FormMessage>{errors.price?.message}</FormMessage>
      </FormItem>

      {mutation.isError && (
        <p className="text-destructive text-sm">
          {mutation.error instanceof Error ? mutation.error.message : "Failed to create product. Try again."}
        </p>
      )}

      <Button type="submit" disabled={mutation.isPending || isSubmitting} className="mt-1">
        {mutation.isPending ? "Creating…" : "Create Product"}
      </Button>
    </form>
  )
}
