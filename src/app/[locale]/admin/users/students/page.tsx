"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useUserList } from "@/components/shared/user/useUser"
import { Pagination } from "@/components/shared/common/Pagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, Search, RotateCcw, ArrowUpDown } from "lucide-react"
import { useAppStore } from "@/stores/useAppStore"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

export default function Page() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useAppStore()
  const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"

  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  const [searchType, setSearchType] = React.useState<'name' | 'email'>("name")
  const [term, setTerm] = React.useState("")
  const [applied, setApplied] = React.useState<{ name?: string; email?: string }>({})
  const [sortBy, setSortBy] = React.useState<'stt' | 'name'>('stt')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')
  const [verifyFilter, setVerifyFilter] = React.useState<'all' | 'verified' | 'unverified'>('all')

  const { data, isPending, isFetching, isError, refetch } = useUserList({ page, limit, fullName: applied.name, email: applied.email, role: 'user' })

  const items = data?.data ?? []
  const total = data?.total ?? 0
  const currentPage = data?.page ?? page
  const pageSize = data?.limit ?? limit
  const baseIndex = (currentPage - 1) * pageSize
  const totalPages = data?.totalPages ?? Math.ceil(total / pageSize || 1)

  React.useEffect(() => {
    const p = Number(searchParams.get('page') || '1')
    const l = Number(searchParams.get('limit') || '10')
    const type = (searchParams.get('type') as 'name' | 'email') || 'name'
    const q = searchParams.get('q') || ''
    const sb = (searchParams.get('sort') as 'stt' | 'name') || 'stt'
    const so = (searchParams.get('order') as 'asc' | 'desc') || 'asc'
    const vf = (searchParams.get('verified') as 'all' | 'verified' | 'unverified') || 'all'
    setPage(isNaN(p) ? 1 : p)
    setLimit(isNaN(l) ? 10 : l)
    setSearchType(type)
    setTerm(q)
    setApplied(type === 'name' ? (q ? { name: q } : {}) : (q ? { email: q } : {}))
    setSortBy(sb)
    setSortOrder(so)
    setVerifyFilter(vf)
  }, [])

  const pushQuery = React.useCallback((next: { page?: number; limit?: number; type?: 'name' | 'email'; q?: string; sort?: 'stt' | 'name'; order?: 'asc' | 'desc'; verified?: 'all' | 'verified' | 'unverified' }) => {
    const sp = new URLSearchParams()
    sp.set('page', String(next.page ?? page))
    sp.set('limit', String(next.limit ?? limit))
    sp.set('type', String(next.type ?? searchType))
    if (next.q ?? term) sp.set('q', String(next.q ?? term))
    sp.set('sort', String(next.sort ?? sortBy))
    sp.set('order', String(next.order ?? sortOrder))
    sp.set('verified', String(next.verified ?? verifyFilter))
    router.replace(`/${locale}/admin/users/students?${sp.toString()}`)
  }, [router, locale, page, limit, searchType, term, sortBy, sortOrder, verifyFilter])

  return (
    <div className="relative p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Học sinh</h1>
      </div>

      {(isPending || isFetching) ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <img src={logoSrc} alt="Wishzy" className="h-10 w-auto opacity-90" />
            <div aria-label="loading" className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Đang tải dữ liệu...</span>
          </div>
        </div>
      ) : null}

      <form
        className="mb-3 flex flex-col md:flex-row md:items-center gap-1"
        onSubmit={(e) => {
          e.preventDefault()
          const trimmed = term.trim()
          const next = searchType === 'name' ? (trimmed ? { name: trimmed } : {}) : (trimmed ? { email: trimmed } : {})
          setApplied(next)
          if (page !== 1) setPage(1); else refetch()
          pushQuery({ page: 1, type: searchType, q: trimmed })
        }}
      >
        <Select value={searchType} onValueChange={(v) => setSearchType(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Chọn kiểu tìm kiếm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Theo tên</SelectItem>
            <SelectItem value="email">Theo email</SelectItem>
          </SelectContent>
        </Select>
        {searchType === 'name' ? (
          <div className="relative md:w-64">
            <Input placeholder="Tên học sinh" value={term} onChange={(e) => setTerm(e.target.value)} className="pr-10" />
            <Button className="cursor-pointer absolute right-1 top-1/2 -translate-y-1/2" variant="outline" size="icon" aria-label="Tìm kiếm" type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="relative md:w-64">
            <Input placeholder="Email" type="email" value={term} onChange={(e) => setTerm(e.target.value)} className="pr-10" />
            <Button className="cursor-pointer absolute right-1 top-1/2 -translate-y-1/2" variant="outline" size="icon" aria-label="Tìm kiếm" type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button className="cursor-pointer" variant="outline" size="icon" aria-label="Đặt lại" onClick={() => {
            setTerm("")
            setApplied({})
            if (page !== 1) setPage(1); else refetch()
            pushQuery({ page: 1, q: "" })
          }}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-center px-3 py-2 w-[80px]">
                <button type="button" className="inline-flex items-center gap-1 cursor-pointer" onClick={() => {
                  setSortBy('stt'); setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
                  pushQuery({ sort: 'stt', order: sortBy === 'stt' ? (sortOrder === 'asc' ? 'desc' : 'asc') : sortOrder })
                }}>
                  STT <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
              <th className="text-center px-3 py-2">Avatar</th>
              <th className="text-center px-3 py-2">
                <button type="button" className="inline-flex items-center gap-1 cursor-pointer" onClick={() => {
                  setSortBy('name'); setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
                  pushQuery({ sort: 'name', order: sortBy === 'name' ? (sortOrder === 'asc' ? 'desc' : 'asc') : sortOrder })
                }}>
                  Họ tên <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
              <th className="text-center px-3 py-2">Email</th>
              <th className="text-center px-3 py-2">
                <Select value={verifyFilter} onValueChange={(v) => { setVerifyFilter(v as any); pushQuery({ verified: v as any }) }}>
                  <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="verified">Đã xác minh</SelectItem>
                    <SelectItem value="unverified">Chưa xác minh</SelectItem>
                  </SelectContent>
                </Select>
              </th>
              <th className="text-center px-3 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isError ? (
              <tr><td colSpan={6} className="px-3 py-10 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  </div>
                  <div className="text-sm">Lỗi tải dữ liệu</div>
                </div>
              </td></tr>
            ) : (
              (() => {
                let view = items.map((u: any, idx: number) => ({ u, stt: baseIndex + idx + 1 }))
                if (verifyFilter !== 'all') view = view.filter(v => (!!v.u.verified) === (verifyFilter === 'verified'))
                if (sortBy === 'stt') view.sort((a, b) => sortOrder === 'asc' ? a.stt - b.stt : b.stt - a.stt)
                if (sortBy === 'name') view.sort((a, b) => (a.u.fullName || '').localeCompare(b.u.fullName || '', 'vi', { sensitivity: 'base' }) * (sortOrder === 'asc' ? 1 : -1))
                if (view.length === 0) return (
                  <tr><td colSpan={6} className="px-3 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 19l-4-4m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                      </div>
                      <div className="text-sm">Không có dữ liệu phù hợp</div>
                      <div className="text-xs">Thử đổi bộ lọc hoặc từ khóa tìm kiếm</div>
                    </div>
                  </td></tr>
                )
                return view.map(({ u, stt }) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-3 py-2 text-center">{stt}</td>
                    <td className="px-3 py-2 text-center">
                      {u.avatar ? <img src={u.avatar} alt={u.fullName} className="h-9 w-9 rounded-full object-cover" /> : <div className="h-9 w-9 rounded-full bg-muted" />}
                    </td>
                    <td className="px-3 py-2 text-left">{u.fullName}</td>
                    <td className="px-3 py-2 text-left">{u.email}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${u.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {u.verified ? 'Đã xác minh' : 'Chưa xác minh'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Link href={`/${locale}/admin/users/students/${u.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-accent cursor-pointer" title="Xem chi tiết">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              })()
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <Pagination
          pagination={{ totalItems: total, totalPages, currentPage, itemsPerPage: pageSize }}
          onPageChange={(p) => { setPage(p); pushQuery({ page: p }) }}
          size="sm"
        />
      </div>
    </div>
  )
}
