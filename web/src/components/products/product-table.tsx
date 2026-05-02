"use client"

import { Trash2 } from "lucide-react"
import { type Product } from "@/lib/api"
import { Button } from "@/components/ui/button"

interface Props {
  products: Product[]
  onDelete: (id: string) => void
  pendingId: string | null
}

export function ProductTable({ products, onDelete, pendingId }: Props) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Created
            </th>
            <th className="px-4 py-3 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background">
          {products.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-sm">
                No products yet. Create one to get started.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                  {product.description}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(product.createdAt).toLocaleDateString("en-US")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(product.id)}
                    disabled={pendingId === product.id}
                    aria-label="Delete product"
                  >
                    <Trash2 className="text-muted-foreground" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
