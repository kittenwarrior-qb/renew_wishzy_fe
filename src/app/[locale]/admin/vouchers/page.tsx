"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AdminActionDialog } from "@/components/admin/common/AdminActionDialog"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { notify } from "@/components/shared/admin/Notifications"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import { Pencil, Trash2 } from "lucide-react"
import { formatDateDDMMYYYY, formatPercent, formatVND } from "@/lib/format"
import { useVoucherList, useCreateVoucher, useUpdateVoucher, useDeleteVoucher } from "@/components/shared/voucher/useVoucher"
import type { Voucher } from "@/services/voucher"
import { VoucherForm, type VoucherFormValue } from "@/components/shared/voucher/VoucherForm"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"
import PaginationController from "@/components/shared/common/PaginationController"
import QueryController from "@/components/shared/common/QueryController"

export default function Page() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"

  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)

  const [filter, setFilter] = React.useState<{ code?: string; isActive?: string }>({})
  const { data, isPending, isFetching, isError } = useVoucherList({ page, limit, code: filter.code, isActive: filter.isActive === undefined || filter.isActive === '' ? undefined : filter.isActive === 'true' })
  const { mutate: createVoucher, isPending: creating } = useCreateVoucher()
  const { mutate: updateVoucher, isPending: updating } = useUpdateVoucher()
  const { mutate: deleteVoucher, isPending: deleting } = useDeleteVoucher()

  const [openCreate, setOpenCreate] = React.useState(false)
  const [openEdit, setOpenEdit] = React.useState(false)
  const [editing, setEditing] = React.useState<Voucher | null>(null)
  const [openDeleteConfirm, setOpenDeleteConfirm] = React.useState(false)
  const [target, setTarget] = React.useState<Voucher | null>(null)

  const [form, setForm] = React.useState<VoucherFormValue>({
    code: "",
    name: "",
    discountType: "percent",
    discountValue: 0,
    maxDiscountAmount: '',
    minOrderAmount: '',
    perUserLimit: '',
    applyScope: 'all',
    categoryId: '',
    courseId: '',
    isActive: true,
    startDate: null,
    endDate: null,
  })
  const [errors, setErrors] = React.useState<Partial<Record<keyof VoucherFormValue, string>>>({})

  // Convert DD/MM/YYYY (from form) or existing ISO-like strings to ISO date (YYYY-MM-DD)
  const toISODate = React.useCallback((s?: string | null): string | null => {
    if (!s) return null
    const str = String(s).trim()
    if (!str) return null
    if (str.includes('/')) {
      const [dd, mm, yyyy] = str.split('/')
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
      if (Number.isNaN(d.getTime())) return null
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
    // For strings like YYYY-MM-DD or ISO datetime, normalize to YYYY-MM-DD
    const d = new Date(str)
    if (Number.isNaN(d.getTime())) return null
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }, [])

  const pendingCloseRef = React.useRef<null | (() => void)>(null)
  const bypassUnsavedGuardRef = React.useRef(false)
  const isCreateDirty = React.useMemo(() => {
    return openCreate && (
      !!(form.code && form.code.trim()) ||
      !!(form.name && form.name.trim()) ||
      (form.discountValue as any) !== '' ||
      (form.maxDiscountAmount as any) !== '' ||
      (form.minOrderAmount as any) !== '' ||
      (form.perUserLimit as any) !== '' ||
      !!form.startDate ||
      !!form.endDate ||
      !!form.isActive ||
      form.applyScope !== 'all' ||
      !!form.categoryId ||
      !!form.courseId
    )
  }, [openCreate, form])
  const isEditDirty = React.useMemo(() => {
    if (!openEdit || !editing) return false
    return (
      (form.code || "") !== (editing.code || "") ||
      (form.name || "") !== (editing.name || "") ||
      (form.discountType || "") !== (editing.discountType || "") ||
      Number(form.discountValue || 0) !== Number(editing.discountValue || 0) ||
      Number(form.maxDiscountAmount || 0) !== Number(editing.maxDiscountAmount || 0) ||
      Number(form.minOrderAmount || 0) !== Number(editing.minOrderAmount || 0) ||
      Number(form.perUserLimit || 0) !== Number(editing.perUserLimit || 0) ||
      (form.applyScope || "") !== (editing.applyScope || "") ||
      (form.categoryId || "") !== (editing.categoryId || "") ||
      (form.courseId || "") !== (editing.courseId || "") ||
      (form.startDate || "") !== (editing.startDate || "") ||
      (form.endDate || "") !== (editing.endDate || "") ||
      Boolean(form.isActive) !== Boolean(editing.isActive)
    )
  }, [openEdit, editing, form])
  const [unsavedOpen, setUnsavedOpen] = React.useState(false)

  const validate = (v: VoucherFormValue) => {
    const e: Partial<Record<keyof VoucherFormValue, string>> = {}
    if (!v.code?.trim()) e.code = "Vui lòng nhập mã"
    if (!v.name?.trim()) e.name = "Vui lòng nhập tên"
    if (!v.discountType) e.discountType = "Chọn loại"
    if (v.discountValue === '' || Number.isNaN(Number(v.discountValue)) || Number(v.discountValue) <= 0) e.discountValue = "Nhập giá trị hợp lệ"
    if (v.perUserLimit === '' || Number(v.perUserLimit) < 1) e.perUserLimit = "Giới hạn/người phải >= 1"
    if (v.startDate && v.endDate && new Date(v.endDate) < new Date(v.startDate)) e.endDate = "Ngày kết thúc phải sau ngày bắt đầu"
    if (v.applyScope === 'category' && !v.categoryId) e.categoryId = 'Chọn danh mục'
    if (v.applyScope === 'course' && !v.courseId) e.courseId = 'Chọn khoá học'
    const minAmt = v.minOrderAmount === '' || v.minOrderAmount == null ? null : Number(v.minOrderAmount)
    const maxDisc = v.maxDiscountAmount === '' || v.maxDiscountAmount == null ? null : Number(v.maxDiscountAmount)
    if (minAmt != null && maxDisc != null && !Number.isNaN(minAmt) && !Number.isNaN(maxDisc)) {
      if (minAmt > maxDisc) {
        e.minOrderAmount = 'Đơn tối thiểu không được lớn hơn Giảm tối đa'
      }
    }
    return e
  }

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      discountType: "percent",
      discountValue: 0,
      maxDiscountAmount: '',
      minOrderAmount: '',
      perUserLimit: '',
      applyScope: 'all',
      categoryId: '',
      courseId: '',
      isActive: true,
      startDate: null,
      endDate: null,
    })
    setErrors({})
  }

  const items = data?.data ?? []
  const total = data?.total ?? 0
  const currentPage = data?.page ?? page
  const pageSize = data?.limit ?? limit
  const totalPages = data?.totalPages ?? Math.ceil(total / pageSize || 1)

  return (
    <div className="relative p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Voucher</h1>
        <Button onClick={() => { resetForm(); setOpenCreate(true) }}>Thêm voucher</Button>
      </div>

      <LoadingOverlay show={isPending || isFetching} />

      <QueryController initial={{ code: filter.code || '', isActive: filter.isActive || '' }} debounceMs={300} onChange={(q) => setFilter(q as any)}>
        {({ query, setQuery, reset }) => (
          <div className="mb-2 flex items-center gap-2">
            <input
              value={query.code || ''}
              onChange={(e) => setQuery({ code: e.target.value })}
              placeholder="Tìm mã voucher..."
              className="h-9 rounded border px-3 text-sm"
            />
            <select
              className="h-9 rounded border px-2 text-sm"
              value={query.isActive || ''}
              onChange={(e) => setQuery({ isActive: e.target.value })}
            >
              <option value="">Tất cả</option>
              <option value="true">Kích hoạt</option>
              <option value="false">Tắt</option>
            </select>
            <button className="h-9 px-3 border rounded" onClick={reset}>Reset</button>
          </div>
        )}
      </QueryController>

      {(() => {
        const columns: Column<Voucher>[] = [
          { key: 'code', title: 'Mã' },
          { key: 'name', title: 'Tên' },
          { key: 'discountType', title: 'Loại', render: (row: Voucher) => String(row.discountType || '').toLowerCase() },
          { key: 'discountValue', title: 'Giá trị', align: 'right', render: (row: Voucher) => row.discountType === 'percent' ? formatPercent(row.discountValue) : formatVND(row.discountValue) },
          { key: 'maxDiscountAmount', title: 'Giảm tối đa', align: 'right', render: (row: Voucher) => row.maxDiscountAmount ? formatVND(row.maxDiscountAmount) : '-' },
          { key: 'minOrderAmount', title: 'Đơn tối thiểu', align: 'right', render: (row: Voucher) => row.minOrderAmount ? formatVND(row.minOrderAmount) : '-' },
          { key: 'applyScope', title: 'Phạm vi', render: (row: Voucher) => <span className="text-xs capitalize">{row.applyScope}</span> },
          {
            key: 'time', title: 'Thời gian', render: (row: Voucher) => (
              <span className="text-xs">{row.startDate ? formatDateDDMMYYYY(row.startDate) : '—'} {' '}→{' '} {row.endDate ? formatDateDDMMYYYY(row.endDate) : '—'}</span>
            )
          },
          {
            key: 'isActive', title: 'Kích hoạt', align: 'center', render: (row: Voucher) => (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>{row.isActive ? 'Bật' : 'Tắt'}</span>
            )
          },
          {
            key: 'actions', title: 'Hành động', align: 'right', render: (row: Voucher) => (
              <div className="inline-flex items-center gap-1">
                <button title="Sửa" type="button" className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent cursor-pointer" onClick={() => {
                  setEditing(row)
                  setForm({
                    code: row.code,
                    name: row.name || '',
                    discountType: row.discountType || 'percent',
                    discountValue: row.discountValue ?? 0,
                    maxDiscountAmount: (row.maxDiscountAmount ?? ''),
                    minOrderAmount: (row.minOrderAmount ?? ''),
                    perUserLimit: (row.perUserLimit ?? ''),
                    applyScope: row.applyScope || 'all',
                    categoryId: row.categoryId ?? '',
                    courseId: row.courseId ?? '',
                    isActive: !!row.isActive,
                    startDate: row.startDate || null,
                    endDate: row.endDate || null,
                  })
                  setOpenEdit(true)
                }}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button title="Xoá" type="button" className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent text-destructive cursor-pointer" onClick={() => { setTarget(row); setOpenDeleteConfirm(true) }} disabled={deleting}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          },
        ]
        return (
          <PaginationController totalItems={total} initialPage={page} initialLimit={limit} onChange={({ page: p, limit: l }) => { setPage(p); setLimit(l) }} renderControls={false}>
            {({ page: p, limit: l }) => (
              <DynamicTable
                columns={columns}
                data={items as any}
                loading={isPending || isFetching}
                pagination={{ totalItems: total, currentPage: p, itemsPerPage: l, onPageChange: (np) => setPage(np) }}
              />
            )}
          </PaginationController>
        )
      })()}

      {/* Create Dialog */}
      <AdminActionDialog
        open={openCreate}
        onOpenChange={(next) => {
          if (!next) {
            if (isCreateDirty && !bypassUnsavedGuardRef.current) {
              pendingCloseRef.current = () => { setOpenCreate(false) }
              setUnsavedOpen(true)
              return
            }
          }
          setOpenCreate(next)
        }}
        title="Thêm voucher"
        confirmText={creating ? "Đang lưu..." : "Lưu"}
        loading={creating}
        position="top"
        confirmVariant="default"
        onConfirm={() => {
          const e = validate(form)
          setErrors(e)
          if (Object.keys(e).length) return
          createVoucher({
            code: form.code.trim().toUpperCase(),
            name: form.name.trim(),
            discountType: form.discountType,
            discountValue: Number(form.discountValue),
            maxDiscountAmount: form.maxDiscountAmount === '' ? undefined : Number(form.maxDiscountAmount),
            minOrderAmount: form.minOrderAmount === '' ? undefined : Number(form.minOrderAmount),
            perUserLimit: form.perUserLimit === '' ? undefined : Number(form.perUserLimit),
            applyScope: form.applyScope,
            categoryId: form.applyScope === 'category' ? (form.categoryId || undefined) : undefined,
            courseId: form.applyScope === 'course' ? (form.courseId || undefined) : undefined,
            isActive: !!form.isActive,
            startDate: toISODate(form.startDate),
            endDate: toISODate(form.endDate),
          }, {
            onSuccess: () => { setOpenCreate(false); notify({ title: "Đã tạo", variant: "success" }) },
            onError: (err: any) => notify({ title: "Lỗi", description: String(err?.message || 'Không thể tạo'), variant: 'destructive' })
          })
        }}
      >
        <VoucherForm value={form} onChange={(v) => { setForm(v) }} error={errors} />
      </AdminActionDialog>

      {/* Edit Dialog */}
      <AdminActionDialog
        open={openEdit}
        onOpenChange={(next) => {
          if (!next) {
            if (isEditDirty && !bypassUnsavedGuardRef.current) {
              pendingCloseRef.current = () => { setOpenEdit(false) }
              setUnsavedOpen(true)
              return
            }
          }
          setOpenEdit(next)
        }}
        title="Sửa voucher"
        confirmText={updating ? "Đang lưu..." : "Lưu"}
        loading={updating}
        position="top"
        onConfirm={() => {
          if (!editing) return
          const e = validate(form)
          setErrors(e)
          if (Object.keys(e).length) return
          updateVoucher({
            id: editing.id,
            code: form.code.trim().toUpperCase(),
            name: form.name.trim(),
            discountType: form.discountType,
            discountValue: Number(form.discountValue),
            maxDiscountAmount: form.maxDiscountAmount === '' ? null : Number(form.maxDiscountAmount),
            minOrderAmount: form.minOrderAmount === '' ? null : Number(form.minOrderAmount),
            perUserLimit: form.perUserLimit === '' ? null : Number(form.perUserLimit),
            applyScope: form.applyScope,
            categoryId: form.applyScope === 'category' ? (form.categoryId || null) : null,
            courseId: form.applyScope === 'course' ? (form.courseId || null) : null,
            isActive: !!form.isActive,
            startDate: toISODate(form.startDate),
            endDate: toISODate(form.endDate),
          }, {
            onSuccess: () => { setOpenEdit(false); notify({ title: "Đã cập nhật", variant: "success" }) },
            onError: (err: any) => notify({ title: "Lỗi", description: String(err?.message || 'Không thể cập nhật'), variant: 'destructive' })
          })
        }}
      >
        <VoucherForm value={form} onChange={(v) => { setForm(v) }} error={errors} />
      </AdminActionDialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={openDeleteConfirm}
        onOpenChange={setOpenDeleteConfirm}
        title="Xác nhận xoá"
        description={<span>Bạn có chắc muốn xoá voucher "<b>{target?.code}</b>"?</span>}
        confirmText={deleting ? "Đang xoá..." : "Xoá"}
        confirmVariant="destructive"
        loading={deleting}
        onConfirm={() => {
          if (!target) return
          deleteVoucher({ id: target.id }, {
            onSuccess: () => { setOpenDeleteConfirm(false); notify({ title: "Đã xoá", variant: "success" }) },
            onError: (err: any) => notify({ title: "Lỗi", description: String(err?.message || 'Không thể xoá'), variant: 'destructive' })
          })
        }}
      />

      <ConfirmDialog
        open={unsavedOpen}
        onOpenChange={setUnsavedOpen}
        title="Thay đổi chưa lưu"
        description={<span>Bạn có thay đổi chưa lưu. Thoát mà không lưu?</span>}
        confirmText="Thoát"
        position="top"
        onConfirm={() => {
          const fn = pendingCloseRef.current
          pendingCloseRef.current = null
          setUnsavedOpen(false)
          if (fn) fn()
        }}
      />
    </div>
  )
}
