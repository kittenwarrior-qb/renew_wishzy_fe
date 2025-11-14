"use client"

import * as React from "react"
import { Pagination } from "@/components/shared/common/Pagination"

export type PaginationState = {
  page: number
  limit: number
}

export type PaginationControllerProps = {
  totalItems: number
  initialPage?: number
  initialLimit?: number
  limitOptions?: number[]
  onChange?: (state: PaginationState) => void
  children?: (state: PaginationState & {
    setPage: (p: number) => void
    setLimit: (l: number) => void
  }) => React.ReactNode
  renderControls?: boolean
  className?: string
}

export default function PaginationController({
  totalItems,
  initialPage = 1,
  initialLimit = 10,
  limitOptions = [10, 20, 50, 100],
  onChange,
  children,
  renderControls = true,
  className,
}: PaginationControllerProps) {
  const [page, setPage] = React.useState(initialPage)
  const [limit, setLimit] = React.useState(initialLimit)

  React.useEffect(() => {
    onChange?.({ page, limit })
  }, [page, limit, onChange])

  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / Math.max(1, limit)))

  return (
    <div className={className}>
      {children?.({ page, limit, setPage, setLimit })}
      {renderControls ? (
        <div className="flex items-center justify-end gap-2">
          <select
            value={limit}
            onChange={(e) => { setPage(1); setLimit(Number(e.target.value)) }}
            className="h-8 rounded border px-2 text-sm"
            aria-label="Rows per page"
          >
            {limitOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}/trang</option>
            ))}
          </select>
          <Pagination
            pagination={{ totalItems, totalPages, currentPage: page, itemsPerPage: limit }}
            onPageChange={(p) => setPage(p)}
            size="sm"
          />
        </div>
      ) : null}
    </div>
  )
}
