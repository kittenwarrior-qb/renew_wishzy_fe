"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useUserList } from "@/components/shared/user/useUser"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, Search, RotateCcw } from "lucide-react"
import { useAppStore } from "@/stores/useAppStore"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"
import PaginationController from "@/components/shared/common/PaginationController"
import QueryController from "@/components/shared/common/QueryController"

export default function Page() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"
  const { theme } = useAppStore()
  const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"

  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  const [queryState, setQueryState] = React.useState<{ type: 'name' | 'email'; q: string; verified: 'all' | 'verified' | 'unverified' }>({ type: 'name', q: '', verified: 'all' })

  const { data, isPending, isFetching, isError } = useUserList({
    page,
    limit,
    fullName: queryState.type === 'name' && queryState.q ? queryState.q : undefined,
    email: queryState.type === 'email' && queryState.q ? queryState.q : undefined,
    role: 'user',
  })

  const items = data?.data ?? []
  const total = data?.total ?? 0
  const baseIndex = (page - 1) * limit

  return (
    <div className="relative p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Học sinh</h1>
      </div>

      <QueryController initial={{ type: queryState.type, q: queryState.q, verified: queryState.verified }} debounceMs={300} onChange={(q: any) => { setQueryState(q); setPage(1) }} persistToUrl>
        {({ query, setQuery, reset }) => (
          <form className="mb-3 flex flex-col md:flex-row md:items-center gap-2" onSubmit={(e) => e.preventDefault()}>
            <Select value={query.type} onValueChange={(v) => setQuery({ type: v as any })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Chọn kiểu tìm kiếm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Theo tên</SelectItem>
                <SelectItem value="email">Theo email</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative md:w-64">
              <Input placeholder={query.type === 'name' ? 'Tên học sinh' : 'Email'} value={query.q || ''} onChange={(e) => setQuery({ q: e.target.value })} className="pr-10" />
              <Button className="cursor-pointer absolute right-1 top-1/2 -translate-y-1/2" variant="outline" size="icon" aria-label="Tìm kiếm" type="button">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={query.verified} onValueChange={(v) => setQuery({ verified: v as any })}>
              <SelectTrigger className="h-9 w-32 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="verified">Đã xác minh</SelectItem>
                <SelectItem value="unverified">Chưa xác minh</SelectItem>
              </SelectContent>
            </Select>
            <Button className="cursor-pointer" variant="outline" size="icon" aria-label="Đặt lại" onClick={() => { reset(); setPage(1) }}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </form>
        )}
      </QueryController>

      {(() => {
        type StudentRow = {
          id: string | number
          avatar?: string | null
          fullName: string
          email: string
          verified?: boolean
        }
        const filtered = items.filter((u: any) => {
          if (queryState.verified === 'all') return true
          const ok = !!u.verified
          return queryState.verified === 'verified' ? ok : !ok
        })
        const columns: Column<StudentRow>[] = [
          { key: 'stt', title: 'STT', align: 'center', render: (_v: unknown, _r: StudentRow, i: number) => baseIndex + i + 1, width: 80 },
          { key: 'avatar', title: 'Avatar', align: 'center', render: (_v: unknown, r: StudentRow) => r.avatar ? <img src={r.avatar} alt={r.fullName} className="h-9 w-9 rounded-full object-cover" /> : <div className="h-9 w-9 rounded-full bg-muted" /> },
          { key: 'fullName', title: 'Họ tên' },
          { key: 'email', title: 'Email' },
          { key: 'verified', title: 'Trạng thái', align: 'center', render: (v: boolean) => (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${v ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{v ? 'Đã xác minh' : 'Chưa xác minh'}</span>
          ) },
          { key: 'actions', title: 'Hành động', align: 'center', render: (_v: unknown, r: StudentRow) => (
            <Link href={`/${locale}/admin/users/students/${r.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-accent cursor-pointer" title="Xem chi tiết">
              <Eye className="h-4 w-4" />
            </Link>
          ) },
        ]
        return (
          <PaginationController totalItems={total} initialPage={page} initialLimit={limit} onChange={({ page: p, limit: l }) => { setPage(p); setLimit(l) }} renderControls={false}>
            {({ page: p, limit: l }) => (
              <DynamicTable
                columns={columns}
                data={filtered as unknown as StudentRow[]}
                loading={isPending || isFetching}
                pagination={{ totalItems: total, currentPage: p, itemsPerPage: l, onPageChange: (np) => setPage(np) }}
              />
            )}
          </PaginationController>
        )
      })()}
    </div>
  )
}
