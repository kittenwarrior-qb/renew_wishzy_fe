"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import { useOrderList } from "@/components/shared/order/useOrder"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/shared/common/Pagination"

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
    const href = `/${locale}/admin/orders${qs.toString() ? `?${qs.toString()}` : ""}`
    const current = `${window.location.pathname}${window.location.search}`
    if (current !== href) router.replace(href)
  }, [orderId, page, limit, locale, router])

  const { data, isPending, isFetching, isError } = useOrderList({ page, limit, id: orderId || undefined })

  const items = data?.data ?? []
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

        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left">Mã đơn</th>
                <th className="px-3 py-2 text-left">Khách hàng</th>
                <th className="px-3 py-2 text-left">Tổng tiền</th>
                <th className="px-3 py-2 text-left">Trạng thái</th>
                <th className="px-3 py-2 text-left">Thanh toán</th>
                <th className="px-3 py-2 text-left">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {isError ? (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-destructive">Lỗi tải dữ liệu</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">Không có dữ liệu</td></tr>
              ) : (
                items.map((o: any) => (
                  <tr key={o.id} className="border-t">
                    <td className="px-3 py-2 font-medium"><Link href={`/${locale}/admin/orders/${o.id}`} className="text-primary hover:underline">{o.id}</Link></td>
                    <td className="px-3 py-2">{o.user?.fullName || o.user?.email || o.userId}</td>
                    <td className="px-3 py-2">{Number(o.totalPrice).toLocaleString()}₫</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${o.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : o.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 uppercase">{o.paymentMethod}</td>
                    <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <Pagination pagination={{ totalItems: total, totalPages, currentPage, itemsPerPage: pageSize }} onPageChange={(p) => setPage(p)} size="sm" />
        </div>
      </div>
    </div>
  )
}
