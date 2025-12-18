"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import type { OrderListRow } from "@/types/order.types"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import { useOrderList } from "@/components/shared/order/useOrder"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"

export default function Page() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"
  const router = useRouter()
  const sp = useSearchParams()

  const [page, setPage] = React.useState<number>(Number(sp.get("page") || 1))
  const [limit, setLimit] = React.useState<number>(Number(sp.get("limit") || 10))
  const [orderId, setOrderId] = React.useState<string>(sp.get("id") || "")

  React.useEffect(() => {
    const qs = new URLSearchParams()
    if (orderId) qs.set("id", orderId)
    if (page !== 1) qs.set("page", String(page))
    if (limit !== 10) qs.set("limit", String(limit))
    const href = `/admin/orders${qs.toString() ? `?${qs.toString()}` : ""}`
    const current = `${window.location.pathname}${window.location.search}`
    if (current !== href) router.replace(href)
  }, [orderId, page, limit, router])

  const { data, isPending, isFetching, isError } = useOrderList({ page, limit, id: orderId || undefined })
  const items = (data?.data ?? []) as OrderListRow[]
  const total = data?.total ?? 0
  const currentPage = data?.page ?? page
  const pageSize = data?.limit ?? limit
  const totalPages = data?.totalPages ?? Math.ceil((total || 0) / (pageSize || 10))

  return (
    <div className="relative p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Input placeholder="Mã đơn" value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-[240px]" />
          <Button variant="outline" onClick={() => setPage(1)}>Lọc</Button>
        </div>
      </div>

      <div className="relative min-h-[300px]">
        <LoadingOverlay show={isPending || isFetching} />

        {(() => {
          const columns: Column<OrderListRow>[] = [
            { headerClassName: 'min-w-[200px]', key: 'id', title: 'Mã đơn', render: (row: OrderListRow) => (<Link href={`/admin/orders/${row.id}`} className="hover:underline">{row.id}</Link>) },
            { headerClassName: 'min-w-[160px]', key: 'user', title: 'Khách hàng', render: (row: OrderListRow) => row.user?.fullName || row.user?.email || row.userId || '' },
            { headerClassName: 'min-w-[120px]', key: 'totalPrice', title: 'Tổng tiền', align: 'right', render: (row: OrderListRow) => `${Number(row.totalPrice ?? 0).toLocaleString()} VNĐ` },
            {
              headerClassName: 'w-[120px]', key: 'status', title: 'Trạng thái', align: 'center', render: (row: OrderListRow) => (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${row.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : row.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'}`}>{row.status}</span>
              )
            },
            { key: 'paymentMethod', title: 'Thanh toán', align: 'center', render: (row: OrderListRow) => String(row.paymentMethod || '').toUpperCase() },
            { key: 'createdAt', title: 'Ngày tạo', align: 'center', render: (row: OrderListRow) => row.createdAt ? new Date(row.createdAt).toLocaleString() : '' },
          ]
          return (
            <DynamicTable
              columns={columns}
              data={isError ? [] : items}
              loading={isPending || isFetching}
              pagination={{
                totalItems: total,
                currentPage,
                itemsPerPage: pageSize,
                onPageChange: (p) => setPage(p),
                pageSizeOptions: [10, 20, 50],
                onPageSizeChange: (sz) => {
                  setLimit(sz)
                  setPage(1)
                },
              }}
            />
          )
        })()}
      </div>
    </div>
  )
}
