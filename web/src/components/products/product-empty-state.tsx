"use client"

import { PackageOpen } from "lucide-react"
import { CreateProductDialog } from "./create-product-dialog"

interface Props {
  onCreated: () => void
}

export function ProductEmptyState({ onCreated }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <PackageOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-base font-semibold mb-1">No products yet</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Create your first product to get started.
      </p>
      <CreateProductDialog onCreated={onCreated} />
    </div>
  )
}
