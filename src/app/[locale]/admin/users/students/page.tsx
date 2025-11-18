"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useUserList } from "@/components/shared/user/useUser"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, Search, RotateCcw } from "lucide-react"
import { useAppStore } from "@/stores/useAppStore"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"
import { TruncateTooltipWrapper } from "@/components/shared/common/TruncateTooltipWrapper"
import QueryController from "@/components/shared/common/QueryController"

export default function Page() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useAppStore()
  const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"

  const [page, setPage] = React.useState<number>(Number(searchParams.get("page") || 1))
  const [limit, setLimit] = React.useState<number>(Number(searchParams.get("limit") || 10))
  const [queryState, setQueryState] = React.useState<{ type: 'name' | 'email'; q: string; verified: 'all' | 'verified' | 'unverified' }>(() => ({
    type: (searchParams.get("type") as 'name' | 'email' | null) || 'name',
    q: searchParams.get("q") || '',
    verified: (searchParams.get("verified") as 'all' | 'verified' | 'unverified' | null) || 'all',
  }))

  React.useEffect(() => {
    const qs = new URLSearchParams()
    if (queryState.type) qs.append("type", queryState.type)
    if (queryState.q) qs.append("q", queryState.q)
    if (queryState.verified && queryState.verified !== 'all') qs.append("verified", queryState.verified)
    qs.append("page", String(page))
    qs.append("limit", String(limit))
    const href = `/${locale}/admin/users/students${qs.toString() ? `?${qs.toString()}` : ""}`
    router.replace(href)
  }, [page, limit, queryState, locale, router])

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
    <div className="relative">
      <QueryController initial={{ type: queryState.type, q: queryState.q, verified: queryState.verified }} debounceMs={300} onChange={(q: any) => { setQueryState(q); setPage(1) }}>
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
          {
            key: 'stt',
            title: 'STT',
            align: 'center',
            render: (_v: unknown, _r: StudentRow, i: number) => baseIndex + i + 1,
            width: 80,
          },
          {
            key: 'avatar',
            title: 'Avatar',
            align: 'center',
            type: 'short',
            render: (row: StudentRow) =>
              row.avatar ? (
                <img src={row.avatar} alt={row.fullName} className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-muted" />
              ),
          },
          {
            key: 'fullName',
            title: 'Họ tên',
            render: (row: StudentRow) => (
              <TruncateTooltipWrapper className="max-w-[220px]">
                {row.fullName}
              </TruncateTooltipWrapper>
            ),
          },
          {
            key: 'email',
            title: 'Email',
            render: (row: StudentRow) => (
              <TruncateTooltipWrapper className="max-w-[260px]">
                {row.email}
              </TruncateTooltipWrapper>
            ),
          },
          {
            key: 'verified', title: 'Trạng thái', align: 'center', type: 'short', render: (v: boolean) => (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${v ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{v ? 'Đã xác minh' : 'Chưa xác minh'}</span>
            )
          },
          {
            key: 'actions', title: 'Hành động', align: 'center', type: 'action', render: (_v: unknown, r: StudentRow) => (
              <Link href={`/${locale}/admin/users/students/${r.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-accent cursor-pointer" title="Xem chi tiết">
                <Eye className="h-4 w-4" />
              </Link>
            )
          },
        ]
        return (
          <DynamicTable
            columns={columns}
            data={filtered as unknown as StudentRow[]}
            loading={isPending || isFetching}
            pagination={{
              totalItems: total,
              currentPage: page,
              itemsPerPage: limit,
              onPageChange: (np) => setPage(np),
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
  )
}
