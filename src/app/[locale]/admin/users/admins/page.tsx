"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useUserList, useCreateUser, useUpdateUser, useDeleteUser } from "@/components/shared/user/useUser"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Search, RotateCcw, Eye } from "lucide-react"
import { useAppStore } from "@/stores/useAppStore"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"
import { TruncateTooltipWrapper } from "@/components/shared/common/TruncateTooltipWrapper"
import QueryController from "@/components/shared/common/QueryController"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore"
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges"
import { emailValidator, strongPasswordValidator, required } from "@/lib/validators"

type AdminRow = {
  id: string
  fullName: string
  email: string
  avatar?: string | null
  role?: string
}

type AdminFormState = {
  fullName: string
  email: string
  password: string
}

export default function Page() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useAppStore()
  const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"
  const { setPrimaryAction } = useAdminHeaderStore()

  const [page, setPage] = React.useState<number>(Number(searchParams.get("page") || 1))
  const [limit, setLimit] = React.useState<number>(Number(searchParams.get("limit") || 10))
  const [queryState, setQueryState] = React.useState<{ type: 'name' | 'email'; q: string }>(() => ({
    type: (searchParams.get("type") as 'name' | 'email' | null) || 'name',
    q: searchParams.get("q") || '',
  }))

  React.useEffect(() => {
    const qs = new URLSearchParams()
    if (queryState.type) qs.append("type", queryState.type)
    if (queryState.q) qs.append("q", queryState.q)
    qs.append("page", String(page))
    qs.append("limit", String(limit))
    const href = `/${locale}/admin/users/admins${qs.toString() ? `?${qs.toString()}` : ""}`
    router.replace(href)
  }, [page, limit, queryState, locale, router])

  const { data, isPending, isFetching, isError } = useUserList({
    page,
    limit,
    fullName: queryState.type === 'name' && queryState.q ? queryState.q : undefined,
    email: queryState.type === 'email' && queryState.q ? queryState.q : undefined,
    role: 'admin',
  })

  const items = data?.data ?? []
  const total = data?.total ?? 0
  const baseIndex = (page - 1) * limit

  const { mutate: createUser, isPending: creating } = useCreateUser()
  const { mutate: updateUser, isPending: updating } = useUpdateUser()
  const { mutate: deleteUser, isPending: deleting } = useDeleteUser()

  const [openForm, setOpenForm] = React.useState(false)
  const [editing, setEditing] = React.useState<AdminRow | null>(null)
  const [form, setForm] = React.useState<AdminFormState>({ fullName: "", email: "", password: "" })
  const [errors, setErrors] = React.useState<Partial<Record<keyof AdminFormState, string>>>({})
  const [target, setTarget] = React.useState<AdminRow | null>(null)
  const [openDeleteConfirm, setOpenDeleteConfirm] = React.useState(false)
  const [detail, setDetail] = React.useState<AdminRow | null>(null)
  const [dirty, setDirty] = React.useState(false)

  const fullNameRef = React.useRef<HTMLInputElement | null>(null)
  const emailRef = React.useRef<HTMLInputElement | null>(null)
  const passwordRef = React.useRef<HTMLInputElement | null>(null)

  useUnsavedChanges(dirty && openForm)

  const resetForm = () => {
    setForm({ fullName: "", email: "", password: "" })
    setErrors({})
    setEditing(null)
    setDirty(false)
  }

  const openCreate = () => {
    resetForm()
    setOpenForm(true)
  }

  const openEdit = (row: AdminRow) => {
    setEditing(row)
    setForm({ fullName: row.fullName || "", email: row.email || "", password: "" })
    setErrors({})
    setOpenForm(true)
    setDirty(false)
  }

  const validate = (v: AdminFormState, isEdit: boolean): Partial<Record<keyof AdminFormState, string>> => {
    const next: Partial<Record<keyof AdminFormState, string>> = {}
    next.fullName = required("Tên là bắt buộc")(v.fullName) || undefined
    next.email = emailValidator()(v.email) || undefined
    next.password = strongPasswordValidator({ required: !isEdit })(v.password) || undefined

    // xoá key nào không có lỗi thực sự
    Object.keys(next).forEach((k) => {
      const key = k as keyof AdminFormState
      if (!next[key]) delete next[key]
    })
    return next
  }

  const handleSubmit = () => {
    const isEdit = !!editing
    const nextErrors = validate(form, isEdit)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      // Auto focus vào ô lỗi đầu tiên
      if (nextErrors.fullName && fullNameRef.current) {
        fullNameRef.current.focus()
      } else if (nextErrors.email && emailRef.current) {
        emailRef.current.focus()
      } else if (nextErrors.password && passwordRef.current) {
        passwordRef.current.focus()
      }
      return
    }

    const payload: Record<string, any> = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
    }
    if (!isEdit) {
      payload.password = form.password
      createUser(payload, {
        onSuccess: () => {
          setOpenForm(false)
          resetForm()
        },
        onError: (err: any) => {
          const apiErrors = err?.response?.data?.data
          if (Array.isArray(apiErrors)) {
            const pwdErr = apiErrors.find((e: any) => e?.property === 'password')
            if (pwdErr) {
              const msg = pwdErr?.message || pwdErr?.constraints?.[0]
              setErrors((prev) => ({ ...prev, password: msg || "Mật khẩu không hợp lệ" }))
            }
          }
        },
      })
    } else if (editing) {
      if (form.password.trim()) payload.password = form.password
      updateUser({ id: String(editing.id), ...payload }, {
        onSuccess: () => {
          setOpenForm(false)
          resetForm()
        },
        onError: (err: any) => {
          const apiErrors = err?.response?.data?.data
          if (Array.isArray(apiErrors)) {
            const pwdErr = apiErrors.find((e: any) => e?.property === 'password')
            if (pwdErr) {
              const msg = pwdErr?.message || pwdErr?.constraints?.[0]
              setErrors((prev) => ({ ...prev, password: msg || "Mật khẩu không hợp lệ" }))
            }
          }
        },
      })
    }
  }

  React.useEffect(() => {
    setPrimaryAction({
      label: "Thêm quản trị viên",
      variant: "default",
      onClick: openCreate,
    })
    return () => setPrimaryAction(null)
  }, [])

  return (
    <div className="relative p-4 md:p-6 space-y-4">
      {(isPending || isFetching) && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <img src={logoSrc} alt="Wishzy" className="h-10 w-auto opacity-90" />
            <div aria-label="loading" className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Đang tải dữ liệu...</span>
          </div>
        </div>
      )}
      <QueryController initial={{ type: queryState.type, q: queryState.q }} debounceMs={300} onChange={(q: any) => { setQueryState(q); setPage(1) }}>
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
              <Input placeholder={query.type === 'name' ? 'Tên quản trị viên' : 'Email'} value={query.q || ''} onChange={(e) => setQuery({ q: e.target.value })} className="pr-10" />
              <Button className="cursor-pointer absolute right-1 top-1/2 -translate-y-1/2" variant="outline" size="icon" aria-label="Tìm kiếm" type="button">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button className="cursor-pointer" variant="outline" size="icon" aria-label="Đặt lại" onClick={() => { reset(); setPage(1) }}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </form>
        )}
      </QueryController>

      {isError ? (
        <div className="text-destructive text-sm">Không tải được dữ liệu quản trị viên</div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground text-sm">Không có quản trị viên</div>
      ) : (
        (() => {
          const columns: Column<AdminRow>[] = [
            {
              key: 'stt',
              title: 'STT',
              align: 'center',
              render: (_v: unknown, _r: AdminRow, i: number) => baseIndex + i + 1,
              width: 80,
            },
            {
              key: 'avatar',
              title: 'Avatar',
              align: 'center',
              type: 'short',
              render: (row: AdminRow) => (
                <div className="flex items-center justify-center">
                  {row.avatar ? (
                    <img src={row.avatar} alt={row.fullName} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-muted" />
                  )}
                </div>
              ),
            },
            {
              key: 'fullName',
              title: 'Họ tên',
              render: (row: AdminRow) => (
                <TruncateTooltipWrapper className="max-w-[220px]">
                  {row.fullName}
                </TruncateTooltipWrapper>
              ),
            },
            {
              key: 'email',
              title: 'Email',
              render: (row: AdminRow) => (
                <TruncateTooltipWrapper className="max-w-[260px]">
                  {row.email}
                </TruncateTooltipWrapper>
              ),
            },
            {
              key: 'role',
              title: 'Vai trò',
              align: 'center',
              type: 'short',
              render: (row: AdminRow) => row.role || 'admin',
            },
            {
              key: 'actions',
              title: 'Hành động',
              align: 'center',
              type: 'action',
              render: (_v: unknown, r: AdminRow) => (
                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    title="Xem chi tiết"
                    className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent cursor-pointer"
                    onClick={() => setDetail(r)}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Sửa"
                    className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent cursor-pointer"
                    onClick={() => openEdit(r)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Xoá"
                    className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent text-destructive cursor-pointer"
                    disabled={deleting}
                    onClick={() => {
                      setTarget(r)
                      setOpenDeleteConfirm(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]

          return (
            <DynamicTable
              columns={columns}
              data={items as unknown as AdminRow[]}
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
        })()
      )}

      {/* Create / Edit Admin */}
      <Dialog open={openForm} onOpenChange={(o) => { setOpenForm(o); if (!o) resetForm() }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa quản trị viên" : "Thêm quản trị viên"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Họ tên<span className="text-destructive">*</span></label>
              <Input
                ref={fullNameRef}
                value={form.fullName}
                onChange={(e) => { setForm((f) => ({ ...f, fullName: e.target.value })); setDirty(true) }}
                placeholder="Nhập họ tên"
              />
              {errors.fullName ? <p className="text-xs text-destructive mt-1">{errors.fullName}</p> : null}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email<span className="text-destructive">*</span></label>
              <Input
                type="email"
                ref={emailRef}
                value={form.email}
                onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setDirty(true) }}
                placeholder="email@example.com"
              />
              {errors.email ? <p className="text-xs text-destructive mt-1">{errors.email}</p> : null}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Mật khẩu{editing ? " (để trống nếu không đổi)" : <span className="text-destructive">*</span>}</label>
              <Input
                type="password"
                ref={passwordRef}
                value={form.password}
                onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setDirty(true) }}
                placeholder={editing ? "Để trống nếu giữ nguyên" : "Nhập mật khẩu"}
              />
              {errors.password ? <p className="text-xs text-destructive mt-1">{errors.password}</p> : null}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => { setOpenForm(false); resetForm() }}>Huỷ</Button>
            <Button type="button" onClick={handleSubmit} disabled={creating || updating} className="cursor-pointer">
              {creating || updating ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={openDeleteConfirm}
        onOpenChange={setOpenDeleteConfirm}
        title="Xoá quản trị viên"
        description={
          <span>
            Bạn có chắc muốn xoá quản trị viên "<b>{target?.fullName || target?.email}</b>"?
          </span>
        }
        confirmText={deleting ? "Đang xoá..." : "Xoá"}
        confirmVariant="destructive"
        loading={deleting}
        position="top"
        onConfirm={() => {
          if (!target) return
          deleteUser(String(target.id), {
            onSuccess: () => {
              setOpenDeleteConfirm(false)
              setTarget(null)
            },
          })
        }}
      />
      <Dialog open={!!detail} onOpenChange={(o) => { if (!o) setDetail(null) }}>
        <DialogContent className="fixed inset-0 !w-screen !max-w-none h-screen rounded-none border-0 flex flex-col p-0 !top-0 !left-0 !translate-x-0 !translate-y-0 bg-background">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle className="text-base font-semibold truncate">
              Chi tiết quản trị viên
              {detail?.fullName && (
                <span className="font-normal"> - {detail.fullName}</span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col p-4 gap-4 overflow-auto">
            {detail ? (
              <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                    {detail.avatar ? (
                      <img src={detail.avatar} alt={detail.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold">{detail.fullName?.charAt(0)?.toUpperCase() || "A"}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{detail.fullName}</div>
                    <div className="text-xs text-muted-foreground">{detail.email}</div>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Email:</span> {detail.email}</div>
                  <div><span className="font-medium">Vai trò:</span> {detail.role || 'admin'}</div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                Không tìm thấy thông tin quản trị viên
              </div>
            )}
          </div>
          <DialogFooter className="px-4 py-3 border-t flex justify-end">
            <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setDetail(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
