"use client"

import { useCallback, useEffect, useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteProduct, fetchProducts } from "@/lib/api"
import { ProductTable } from "./product-table"
import { CreateProductDialog } from "./create-product-dialog"
import { Pagination } from "./pagination"

const LIMIT = 10

export function ProductsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", page],
    queryFn: () => fetchProducts(page, LIMIT),
    placeholderData: keepPreviousData,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      setPendingId(id)
      return deleteProduct(id)
    },
    onSettled: () => setPendingId(null),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
    onError: (err) => console.error("Delete failed:", err),
  })

  useEffect(() => {
    const totalPages = data?.totalPages
    if (totalPages && page < totalPages) {
      void qc.prefetchQuery({
        queryKey: ["products", page + 1],
        queryFn: () => fetchProducts(page + 1, LIMIT),
      })
    }
  }, [page, data?.totalPages, qc])

  const handleCreated = useCallback(
    () => qc.invalidateQueries({ queryKey: ["products"] }),
    [qc],
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <CreateProductDialog onCreated={handleCreated} />
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
      {isError && (
        <p className="text-destructive text-sm">
          Failed to load products. Is the products-service running?
        </p>
      )}

      {data && (
        <>
          <ProductTable
            products={data.items}
            onDelete={(id) => deleteMutation.mutate(id)}
            pendingId={pendingId}
          />
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
