import { Suspense } from "react"
import { ProductsPage } from "@/components/products/products-page"

export default function ProductsRoute() {
  return (
    <Suspense>
      <ProductsPage />
    </Suspense>
  )
}
