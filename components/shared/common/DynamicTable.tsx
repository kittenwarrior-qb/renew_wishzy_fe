"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/shared/common/Pagination"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import type { Column as NewColumn } from "@/shared/types/table.type"

// Backward-compat Column type (old API)
export type LegacyColumn<T> = {
  key: React.Key | keyof T
  title: React.ReactNode
  className?: string
  width?: string | number
  align?: "left" | "center" | "right"
  render?: (value: any, record: T, index: number) => React.ReactNode
}

export type DynamicTableProps<T> = {
  columns: Array<LegacyColumn<T> | NewColumn<T>>
  data: T[]
  // key resolver (legacy) or getRowId (new)
  rowKey?: keyof T | ((row: T, index: number) => React.Key)
  getRowId?: (row: T, index: number) => string | number
  className?: string
  headerClassName?: string
  rowClassName?: string | ((row: T, index: number) => string)
  // loading
  loading?: boolean // legacy
  isLoading?: boolean // new
  isRefetching?: boolean // new
  loadingOverlay?: boolean
  skeletonRows?: number
  emptyText?: React.ReactNode
  headerExtra?: React.ReactNode
  stickyHeader?: boolean
  // drag API placeholders (not implemented here, reserved for future)
  enableRowDrag?: boolean
  onRowReorder?: (ordered: T[], changes?: { oldIndex: number; newIndex: number }) => void
  // layout
  wrapperClassName?: string
  useParentScroll?: boolean
  pagination?: {
    totalItems: number
    currentPage: number
    itemsPerPage: number
    onPageChange: (page: number) => void
  } | null
}

export function DynamicTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  getRowId,
  className,
  headerClassName,
  rowClassName,
  loading,
  isLoading,
  isRefetching,
  loadingOverlay = true,
  skeletonRows = 6,
  emptyText = "Không có dữ liệu",
  headerExtra,
  stickyHeader = false,
  enableRowDrag,
  onRowReorder,
  wrapperClassName,
  useParentScroll,
  pagination,
} : DynamicTableProps<T>) {
  const getRowKey = React.useCallback(
    (row: T, index: number): React.Key => {
      if (getRowId) return getRowId(row, index)
      if (typeof rowKey === "function") return rowKey(row, index)
      if (typeof rowKey === "string") return (row as any)[rowKey] ?? index
      return (row as any).id ?? index
    },
    [rowKey, getRowId]
  )

  const effectiveLoading = !!(isLoading ?? loading)

  // Helpers to support both column APIs
  const getHeaderLabel = (col: any): React.ReactNode => col.label ?? col.title
  const getHeaderClass = (col: any): string => {
    const v = col.headerClassName ?? col.className
    if (typeof v === 'function') return v(col)
    return v || ""
  }
  const getAlignClass = (col: any): string => {
    const align: string | undefined = col.align || (col.type === 'number' ? 'right' : col.type === 'short' || col.type === 'title' || col.type === 'action' ? 'center' : undefined)
    return align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
  }
  const renderCell = (col: any, row: T, ri: number): React.ReactNode => {
    const value = (row as any)[col.key]
    if (!col.render) return value
    // Detect new signature render(row, rowIndex) vs legacy render(value, record, index)
    try {
      if (col.render.length <= 2) {
        return col.render(row, ri)
      }
      return col.render(value, row, ri)
    } catch {
      // Fallback to legacy
      return col.render(value, row, ri)
    }
  }
  const getCellClass = (col: any, row: T): string => {
    const v = col.cellClassName
    if (typeof v === 'function') return v(row)
    return v || ''
  }

  return (
    <div className={cn("w-full", className, wrapperClassName)}>
      <div className="flex items-center justify-between mb-2">
        <div />
        {headerExtra}
      </div>
      <div className="relative overflow-auto border rounded-md">
        {loadingOverlay ? <LoadingOverlay show={effectiveLoading || !!isRefetching} /> : null}
        <table className="w-full text-sm">
          <thead className={cn("bg-muted/50", headerClassName, stickyHeader && "sticky top-0 z-10") }>
            <tr>
              {columns.map((col: any, i) => (
                <th
                  key={String(col.key) + i}
                  className={cn("px-3 py-2 font-medium", getAlignClass(col), getHeaderClass(col))}
                  style={(col.headerStyle || col.width) ? { ...(col.headerStyle || {}), width: col.width } : undefined}
                >
                  {getHeaderLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {effectiveLoading ? (
              Array.from({ length: skeletonRows }).map((_, r) => (
                <tr key={`sk-${r}`} className="border-t">
                  {columns.map((c: any, ci) => (
                    <td key={`sk-${r}-${ci}`} className={cn("px-3 py-3", getAlignClass(c)) }>
                      <div className="h-3 w-3/5 max-w-[220px] bg-muted animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-6 text-center text-muted-foreground">{emptyText}</td>
              </tr>
            ) : (
              data.map((row, ri) => (
                <tr key={getRowKey(row, ri)} className={cn("border-t", typeof rowClassName === "function" ? rowClassName(row, ri) : rowClassName)}>
                  {columns.map((col: any, ci) => (
                    <td
                      key={String(col.key) + ci}
                      className={cn("px-3 py-2 align-middle", getAlignClass(col), getCellClass(col, row))}
                      style={(col.cellStyle || col.width) ? { ...(col.cellStyle || {}), width: col.width } : undefined}
                    >
                      {renderCell(col, row, ri)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination ? (
        <div className="mt-3 flex justify-end">
          <Pagination
            pagination={{
              totalItems: pagination.totalItems,
              totalPages: Math.ceil(Math.max(1, pagination.totalItems) / Math.max(1, pagination.itemsPerPage)),
              currentPage: pagination.currentPage,
              itemsPerPage: pagination.itemsPerPage,
            }}
            onPageChange={pagination.onPageChange}
          />
        </div>
      ) : null}
    </div>
  )
}

export default DynamicTable
// Re-export a Column type for backward compatibility with existing imports
export type Column<T = any> = LegacyColumn<T> | NewColumn<T>
