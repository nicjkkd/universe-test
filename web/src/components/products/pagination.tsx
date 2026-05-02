import { Button } from "@/components/ui/button"

interface Props {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, onPageChange }: Props) {
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
      <span>
        {total} {total === 1 ? "product" : "products"}
      </span>
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-2" aria-current="page">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  )
}
