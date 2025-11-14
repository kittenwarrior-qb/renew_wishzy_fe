"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useInstructorList, useApproveInstructor, useRejectInstructor, usePendingInstructorCount } from "@/components/shared/user/useUser"
import { useAppStore } from "@/stores/useAppStore"
import { Bell } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"

export default function Page() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"

  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  const [term, setTerm] = React.useState("")
  const [applied, setApplied] = React.useState<string>("")
  const [openPending, setOpenPending] = React.useState(false)
  const [pPage, setPPage] = React.useState(1)
  const modalPageSize = 10
  const [modalTerm, setModalTerm] = React.useState("")

  // Main list: all instructors
  const { data: allData, isPending: loadingAll, isFetching: fetchingAll, isError: errorAll, refetch: refetchAll } = useInstructorList({ page, limit, fullName: applied || undefined, role: 'instructor' })
  const items = allData?.data ?? []
  const total = allData?.total ?? 0
  const totalPages = allData?.totalPages ?? Math.ceil((total || 0) / (allData?.limit || limit) || 1)

  // Pending count for badge
  const { data: pendingCountData, isFetching: fetchingPendingCount, refetch: refetchPendingCount } = usePendingInstructorCount()
  const pTotal = pendingCountData?.total ?? 0

  // Pending list for modal (only when open) - fetch many and filter client-side
  type Instructor = {
    id: string
    fullName?: string
    email?: string
    avatar?: string
    isInstructorActive?: boolean
  }
  const { data: pendingData, isPending: loadingPending, isFetching: fetchingPendingList, isError: errorPending, refetch: refetchPending } = useInstructorList({ page: 1, limit: 100, role: 'instructor' }, { enabled: openPending })
  const allForModal = (pendingData?.data ?? []) as Instructor[]
  const pendingOnly: Instructor[] = allForModal.filter((u) => !u?.isInstructorActive)
    .filter((u) => {
      const t = modalTerm.trim().toLowerCase()
      if (!t) return true
      const name = (u?.fullName || "").toLowerCase()
      const email = (u?.email || "").toLowerCase()
      return name.includes(t) || email.includes(t)
    })
  const pTotalPages = Math.ceil((pendingOnly.length || 0) / modalPageSize || 1)
  const pItems = pendingOnly.slice((pPage - 1) * modalPageSize, (pPage) * modalPageSize)

  const { mutate: approve, isPending: approving } = useApproveInstructor()
  const { mutate: reject, isPending: rejecting } = useRejectInstructor()

  const [confirmId, setConfirmId] = React.useState<string | null>(null)
  const [rejectId, setRejectId] = React.useState<string | null>(null)
  const [reason, setReason] = React.useState("")

  const { theme } = useAppStore()
  const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"

  return (
    <div className="p-4 md:p-6 space-y-4 relative">
      {(loadingAll || fetchingAll) ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <img src={logoSrc} alt="Wishzy" className="h-10 w-auto opacity-90" />
            <div aria-label="loading" className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Đang tải dữ liệu...</span>
          </div>
        </div>
      ) : null}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Quản lý Giảng viên</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm theo tên..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="w-56"
          />
          <Button variant="outline" onClick={() => { setApplied(term.trim()); setPage(1); refetchAll() }}>Tìm</Button>
          <Button variant="ghost" onClick={() => { setTerm(""); setApplied(""); setPage(1); refetchAll() }}>Làm mới</Button>
          <div className="relative">
            <Button variant="outline" size="icon" onClick={() => { setOpenPending(true); setPPage(1); refetchPending(); refetchPendingCount() }} aria-label="Danh sách chờ duyệt">
              {fetchingPendingCount ? (
                <div aria-label="loading" className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Bell className="h-5 w-5" />
              )}
            </Button>
            {pTotal > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] leading-[18px] text-center font-semibold">
                {pTotal > 99 ? '99+' : pTotal}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {errorAll ? (
        <div className="text-destructive">Không tải được dữ liệu</div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">Không có giảng viên</div>
      ) : (
        (() => {
          const columns: Column<Instructor>[] = [
            { key: 'fullName', title: 'Họ tên', render: (row: Instructor) => row.fullName || '' },
            { key: 'email', title: 'Email', render: (row: Instructor) => row.email || '' },
            { key: 'isInstructorActive', title: 'Trạng thái', align: 'center', render: (row: Instructor) => (row.isInstructorActive ? 'Đã duyệt' : 'Chờ duyệt') },
            {
              key: 'actions', title: 'Thao tác', align: 'right', render: () => (
                <span className="text-xs text-muted-foreground">Chỉ thao tác trong danh sách chờ</span>
              )
            },
          ]
          return (
            <DynamicTable
              columns={columns}
              data={(items as Instructor[])}
              loading={loadingAll || fetchingAll}
              pagination={{ totalItems: total, currentPage: page, itemsPerPage: limit, onPageChange: (p) => setPage(p) }}
            />
          )
        })()
      )}

      <Dialog open={openPending} onOpenChange={(o) => { setOpenPending(o); if (o) { setPPage(1); setModalTerm(""); refetchPending() } }}>
        <DialogContent className="w-[95vw] md:w-[90vw] max-w-[95vw] md:max-w-[90vw] h-[90vh] p-0">
          <DialogHeader>
            <DialogTitle className="px-6 pt-4 flex items-center gap-3">
              Danh sách giảng viên chờ duyệt
              <Badge variant="destructive">{pTotal > 99 ? '99+' : pTotal}</Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="h-full flex flex-col">
            {(loadingPending || fetchingPendingList) ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                <img src={logoSrc} alt="Wishzy" className="h-10 w-auto opacity-90" />
                <div aria-label="loading" className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : errorPending ? (
              <div className="flex-1 flex items-center justify-center text-destructive">Không tải được dữ liệu</div>
            ) : pItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-sm text-muted-foreground gap-3">
                <div>Không có giảng viên chờ duyệt</div>
                <div className="text-xs">Hãy quay lại sau</div>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="px-6 pb-3">
                  <Input
                    placeholder="Tìm theo tên hoặc email..."
                    value={modalTerm}
                    onChange={(e) => { setModalTerm(e.target.value); setPPage(1) }}
                  />
                </div>
                <div className="flex-1 overflow-auto px-6 space-y-3 pb-4">
                  {(pItems as Instructor[]).map((u) => (
                    <div key={u.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-1 ring-border">
                          <AvatarImage src={u?.avatar || ""} alt={u?.fullName || "Instructor"} />
                          <AvatarFallback>
                            {(u?.fullName || "?").split(" ").map((w) => w.charAt(0)).join("").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium leading-5">{u.fullName || "Giảng viên"}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="h-8" onClick={() => setConfirmId(u.id)} disabled={approving}>Duyệt</Button>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => setRejectId(u.id)} disabled={rejecting}>Từ chối</Button>
                      </div>
                    </div>
                  ))}
                  {pTotalPages > 1 ? (
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm" disabled={pPage <= 1} onClick={() => setPPage(p => Math.max(1, p - 1))}>Trước</Button>
                      <div className="text-xs">Trang {pPage} / {pTotalPages}</div>
                      <Button variant="outline" size="sm" disabled={pPage >= pTotalPages} onClick={() => setPPage(p => Math.min(pTotalPages, p + 1))}>Sau</Button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
            <DialogFooter className="px-6 py-4 border-t mt-auto">
              <Button variant="ghost" onClick={() => setOpenPending(false)}>Đóng</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmId} onOpenChange={(o) => { if (!o) setConfirmId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt giảng viên?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">Bạn có chắc muốn duyệt quyền giảng viên cho người dùng này?</div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmId(null)}>Huỷ</Button>
            <Button onClick={() => {
              if (!confirmId) return
              approve(confirmId, { onSuccess: () => { setConfirmId(null); refetchAll(); refetchPending(); refetchPendingCount() } })
            }} disabled={approving}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectId} onOpenChange={(o) => { if (!o) { setRejectId(null); setReason("") } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối giảng viên</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do (tuỳ chọn)</Label>
            <Input id="reason" placeholder="Nhập lý do" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setRejectId(null); setReason("") }}>Huỷ</Button>
            <Button variant="destructive" onClick={() => {
              if (!rejectId) return
              reject({ id: rejectId, reason: reason.trim() || undefined }, { onSuccess: () => { setRejectId(null); setReason(""); refetchAll(); refetchPending(); refetchPendingCount() } })
            }} disabled={rejecting}>Từ chối</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

