"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PaginationResponse } from "@/src/types/pagination/pagination.type"

type PaginationMeta = PaginationResponse<unknown>["pagination"]

export function Pagination({
  pagination,
  onPageChange,
  className,
  size = "sm",
  pageSizeOptions = [10, 20, 50],
  onPageSizeChange,
}: {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  className?: string
  size?: "sm" | "default"
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
}) {
  const { totalItems, totalPages, currentPage } = pagination

  const prevDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages

  const pages: number[] = React.useMemo(() => {
    const maxButtons = 3
    const total = Math.max(totalPages || 1, 1)

    const half = Math.floor(maxButtons / 2)
    let start = Math.max(1, currentPage - half)
    let end = start + maxButtons - 1

    if (end > total) {
      end = total
      start = Math.max(1, end - maxButtons + 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [currentPage, totalPages])

  return (
    <div className={cn("mt-4 flex items-center justify-between gap-2", className)}>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          Trang {currentPage} / {Math.max(totalPages, 1)} · Tổng {totalItems}
        </span>
        {onPageSizeChange && pageSizeOptions.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="whitespace-nowrap">Hiển thị:</span>
            <select
              className="h-7 rounded-md border bg-background px-2 text-xs"
              value={pagination.itemsPerPage}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}/trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size={size}
          disabled={prevDisabled}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          {"<"}
        </Button>
        {pages[0] > 1 && (
          <>
            <Button
              variant="outline"
              size={size}
              onClick={() => onPageChange(1)}
            >
              1
            </Button>
            {pages[0] > 2 && <span className="px-1 text-xs text-muted-foreground">...</span>}
          </>
        )}
        {pages.map((p) => (
          <Button
            key={p}
            variant={p === currentPage ? "default" : "outline"}
            size={size}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
        {pages[pages.length - 1] < Math.max(totalPages, 1) && (
          <>
            {pages[pages.length - 1] < Math.max(totalPages, 1) - 1 && (
              <span className="px-1 text-xs text-muted-foreground">...</span>
            )}
            <Button
              variant="outline"
              size={size}
              onClick={() => onPageChange(Math.max(totalPages, 1))}
            >
              {Math.max(totalPages, 1)}
            </Button>
          </>
        )}
        <Button
          variant="outline"
          size={size}
          disabled={nextDisabled}
          onClick={() => onPageChange(Math.min(totalPages || 1, currentPage + 1))}
        >
          {">"}
        </Button>
      </div>
    </div>
  )
}
