import { Button } from './Button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label="Results pagination">
      <Button variant="secondary" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <span aria-live="polite">Page {page} of {totalPages}</span>
      <Button variant="secondary" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </Button>
    </nav>
  )
}
