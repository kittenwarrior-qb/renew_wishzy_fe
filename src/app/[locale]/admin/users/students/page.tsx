"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useUserList, useUserDetail } from "@/components/shared/user/useUser"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, Search, RotateCcw } from "lucide-react"
import { useAppStore } from "@/stores/useAppStore"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null)
  const [openDetailModal, setOpenDetailModal] = React.useState(false)
  const { data: studentDetail, isLoading: isLoadingDetail } = useUserDetail(selectedStudentId || undefined)

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

  // Debug logs
  React.useEffect(() => {
    console.log('📋 User list data:', data)
    console.log('📋 Items:', items)
  }, [data, items])

  React.useEffect(() => {
    console.log('👤 Selected student ID:', selectedStudentId)
    console.log('👤 Student detail data:', studentDetail)
    console.log('👤 Is loading detail:', isLoadingDetail)
  }, [selectedStudentId, studentDetail, isLoadingDetail])

  return (
    <div className="relative p-4 md:p-6">
      <QueryController initial={{ type: queryState.type, q: queryState.q, verified: queryState.verified }} debounceMs={300} onChange={(q: any) => { setQueryState(q); setPage(1) }}>
        {({ query, setQuery, reset }) => (
          <form className="mb-4 space-y-3" onSubmit={(e) => e.preventDefault()}>
            <div className="flex gap-3">
              <div className="space-y-2 flex-1 md:max-w-md">
                <label className="text-sm font-medium">Từ khóa tìm kiếm</label>
                <div className="relative">
                  <Input placeholder={query.type === 'name' ? 'Nhập tên học sinh...' : 'Nhập email...'} value={query.q || ''} onChange={(e) => setQuery({ q: e.target.value })} className="h-10 pr-10" />
                  <Button className="cursor-pointer absolute right-1 top-1/2 -translate-y-1/2" variant="outline" size="icon" aria-label="Tìm kiếm" type="button">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Loại tìm kiếm</label>
                <Select value={query.type} onValueChange={(v) => setQuery({ type: v as any })}>
                  <SelectTrigger className="h-10 w-40">
                    <SelectValue placeholder="Chọn kiểu tìm kiếm" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="name">Theo tên</SelectItem>
                    <SelectItem value="email">Theo email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
        }).filter((u: any) => u.id) // Filter out items without valid ID
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
            key: 'actions', title: 'Hành động', align: 'center', type: 'action', render: (row: StudentRow) => {
              return (
                <button
                  onClick={() => {
                    setSelectedStudentId(String(row?.id))
                    setOpenDetailModal(true)
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-accent cursor-pointer"
                  title="Xem chi tiết"
                  type="button"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )
            }
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

      {/* Student Detail Modal */}
      <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thông tin chi tiết học viên</DialogTitle>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Đang tải...</div>
            </div>
          ) : studentDetail ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {studentDetail.avatar ? (
                  <img
                    src={studentDetail.avatar}
                    alt={studentDetail.fullName}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold">
                    {studentDetail.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{studentDetail.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{studentDetail.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Trạng thái xác minh</label>
                  <p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${studentDetail.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {studentDetail.verified ? 'Đã xác minh' : 'Chưa xác minh'}
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Số điện thoại</label>
                  <p className="text-sm">{studentDetail.phone || 'Chưa cập nhật'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Ngày sinh</label>
                  <p className="text-sm">
                    {studentDetail.dob
                      ? new Date(studentDetail.dob).toLocaleDateString('vi-VN')
                      : 'Chưa cập nhật'}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Ngày tạo</label>
                  <p className="text-sm">
                    {studentDetail.createdAt
                      ? new Date(studentDetail.createdAt).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Cập nhật lần cuối</label>
                  <p className="text-sm">
                    {studentDetail.updatedAt
                      ? new Date(studentDetail.updatedAt).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Không tìm thấy thông tin</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
