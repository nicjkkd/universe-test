"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchProducts } from "@/lib/api"
import { ProductTable } from "./product-table"
import { CreateProductDialog } from "./create-product-dialog"
import { Pagination } from "./pagination"

const LIMIT = 10

export function ProductsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", page],
    queryFn: () => fetchProducts(page, LIMIT),
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <CreateProductDialog
          onCreated={() => qc.invalidateQueries({ queryKey: ["products"] })}
        />
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
      {isError && (
        <p className="text-destructive text-sm">
          Failed to load products. Is the products-service running?
        </p>
      )}

      {data && (
        <>
          <ProductTable products={data.items} />
          <Pagination
            page={page}
            totalPages={data.totalPages}
            total={data.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
