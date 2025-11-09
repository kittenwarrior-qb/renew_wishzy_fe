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
}: {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  className?: string
  size?: "sm" | "default"
}) {
  const { totalItems, totalPages, currentPage } = pagination

  const prevDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages

  return (
    <div className={cn("mt-4 flex items-center justify-between gap-2", className)}>
      <div className="text-xs text-muted-foreground">
        Trang {currentPage} / {Math.max(totalPages, 1)} · Tổng {totalItems}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size={size}
          disabled={prevDisabled}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          Trang trước
        </Button>
        <Button
          variant="outline"
          size={size}
          disabled={nextDisabled}
          onClick={() => onPageChange(Math.min(totalPages || 1, currentPage + 1))}
        >
          Trang sau
        </Button>
      </div>
    </div>
  )
}
