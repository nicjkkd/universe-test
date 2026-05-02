"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { deleteProduct, fetchProducts } from "@/lib/api"
import type { ProductsPage } from "@/lib/api"
import { ProductTable } from "./product-table"
import { ProductEmptyState } from "./product-empty-state"
import { CreateProductDialog } from "./create-product-dialog"
import { Pagination } from "./pagination"

const LIMIT = 10

interface PendingDelete {
  timer: ReturnType<typeof setTimeout>
  snapshot: ProductsPage
}

export function ProductsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const pendingDeletes = useRef(new Map<string, PendingDelete>())

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", page],
    queryFn: () => fetchProducts(page, LIMIT),
    placeholderData: keepPreviousData,
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

  // Fire any pending deletes immediately on unmount
  useEffect(() => {
    const pending = pendingDeletes.current
    return () => {
      pending.forEach(({ timer }, id) => {
        clearTimeout(timer)
        void deleteProduct(id)
      })
      pending.clear()
    }
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      const snapshot = qc.getQueryData<ProductsPage>(["products", page])
      if (!snapshot) return

      const product = snapshot.items.find((p) => p.id === id)

      qc.setQueryData<ProductsPage>(["products", page], (old) => {
        if (!old) return old
        return {
          ...old,
          items: old.items.filter((p) => p.id !== id),
          total: old.total - 1,
          totalPages: Math.ceil((old.total - 1) / LIMIT),
        }
      })

      const timer = setTimeout(async () => {
        pendingDeletes.current.delete(id)
        try {
          await deleteProduct(id)
          void qc.invalidateQueries({ queryKey: ["products"] })
        } catch {
          qc.setQueryData(["products", page], snapshot)
          toast.error("Failed to delete product. It has been restored.")
        }
      }, 5000)

      pendingDeletes.current.set(id, { timer, snapshot })

      toast("Product deleted", {
        description: product?.name,
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => {
            const pending = pendingDeletes.current.get(id)
            if (!pending) return
            clearTimeout(pending.timer)
            pendingDeletes.current.delete(id)
            qc.setQueryData(["products", page], pending.snapshot)
          },
        },
      })
    },
    [qc, page],
  )

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

      {data && data.items.length === 0 && (
        <ProductEmptyState onCreated={handleCreated} />
      )}

      {data && data.items.length > 0 && (
        <>
          <ProductTable products={data.items} onDelete={handleDelete} />
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
