"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AdminActionDialog } from "@/components/admin/common/AdminActionDialog"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { notify } from "@/components/shared/admin/Notifications"
import { useBannerList, useCreateBanner, useUpdateBanner, useDeleteBanner } from "@/components/shared/banner/useBanner"
import type { Banner } from "@/services/banner"
import { BannerForm, type BannerFormValue } from "@/components/shared/banner/BannerForm"
import { Pagination } from "@/components/shared/common/Pagination"
import { useAppStore } from "@/stores/useAppStore"
import { Pencil, Trash2 } from "lucide-react"
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"

export default function Page() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"
  const { theme } = useAppStore()
  const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"

  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)

  const { data, isPending, isFetching, isError } = useBannerList({ page, limit })
  const { mutate: createBanner, isPending: creating } = useCreateBanner()
  const { mutate: updateBanner, isPending: updating } = useUpdateBanner()
  const { mutate: deleteBanner, isPending: deleting } = useDeleteBanner()

  const [openCreate, setOpenCreate] = React.useState(false)
  const [openEdit, setOpenEdit] = React.useState(false)
  const [editing, setEditing] = React.useState<Banner | null>(null)
  const [openDeleteConfirm, setOpenDeleteConfirm] = React.useState(false)
  const [target, setTarget] = React.useState<Banner | null>(null)

  const [form, setForm] = React.useState<BannerFormValue>({ title: "", imageUrl: "", link: "", position: 1 })
  const [errors, setErrors] = React.useState<Partial<Record<keyof BannerFormValue, string>>>({})

  const pendingCloseRef = React.useRef<null | (() => void)>(null)
  const bypassUnsavedGuardRef = React.useRef(false)
  const isCreateDirty = React.useMemo(() => {
    return openCreate && (
      !!(form.title && form.title.trim()) ||
      !!(form.imageUrl && form.imageUrl.trim()) ||
      !!(form.link && form.link.trim()) ||
      (form.position as any) !== 1
    )
  }, [openCreate, form])
  const isEditDirty = React.useMemo(() => {
    if (!openEdit || !editing) return false
    return (
      (form.title || "") !== (editing.title || "") ||
      (form.imageUrl || "") !== (editing.imageUrl || "") ||
      (form.link || "") !== (editing.link || "") ||
      Number(form.position) !== Number(editing.position)
    )
  }, [openEdit, editing, form])
  const [unsavedOpen, setUnsavedOpen] = React.useState(false)
  useUnsavedChanges(isCreateDirty || isEditDirty)

  const validate = (v: BannerFormValue) => {
    const e: Partial<Record<keyof BannerFormValue, string>> = {}
    if (!v.title?.trim()) e.title = "Vui lòng nhập tiêu đề"
    if (!v.imageUrl?.trim()) e.imageUrl = "Vui lòng nhập URL ảnh"
    if (!v.link?.trim()) e.link = "Vui lòng nhập liên kết"
    if (v.position === '' || Number.isNaN(Number(v.position))) e.position = "Vui lòng nhập vị trí hợp lệ"
    return e
  }

  const resetForm = () => {
    setForm({ title: "", imageUrl: "", link: "", position: 1 })
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
        <h1 className="text-lg font-semibold">Banner</h1>
        <Button onClick={() => { resetForm(); setOpenCreate(true) }}>Thêm banner</Button>
      </div>

      <LoadingOverlay show={isPending || isFetching} />

      {(() => {
        const columns: Column<Banner & any>[] = [
          { key: 'imageUrl', title: 'Ảnh', render: (v: string, r: Banner, _i: number) => (v ? <img src={v} alt={r.title} className="h-10 w-20 object-cover rounded" /> : null) },
          { key: 'title', title: 'Tiêu đề' },
          { key: 'link', title: 'Liên kết', render: (v: string, _r: Banner, _i: number) => (<a href={v} target="_blank" className="text-primary hover:underline">{v}</a>) },
          { key: 'position', title: 'Vị trí' },
          { key: 'actions', title: 'Hành động', align: 'right', render: (_v: unknown, r: Banner, _i: number) => (
            <div className="inline-flex items-center gap-1">
              <button title="Sửa" type="button" className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent cursor-pointer" onClick={() => { setEditing(r); setForm({ title: r.title, imageUrl: r.imageUrl, link: r.link, position: r.position }); setOpenEdit(true) }}>
                <Pencil className="h-4 w-4" />
              </button>
              <button title="Xoá" type="button" className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent text-destructive cursor-pointer" onClick={() => { setTarget(r); setOpenDeleteConfirm(true) }} disabled={deleting}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) },
        ]
        return (
          <DynamicTable
            columns={columns}
            data={isError ? [] : (items as any)}
            loading={isPending || isFetching}
          />
        )
      })()}

      <div className="mt-4 flex justify-end">
        <Pagination
          pagination={{ totalItems: total, totalPages, currentPage, itemsPerPage: pageSize }}
          onPageChange={(p) => setPage(p)}
          size="sm"
        />
      </div>

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
        title="Thêm banner"
        confirmText={creating ? "Đang lưu..." : "Lưu"}
        loading={creating}
        position="top"
        confirmVariant="default"
        onConfirm={() => {
          const e = validate(form)
          setErrors(e)
          if (Object.keys(e).length) return
          createBanner({
            title: form.title.trim(),
            imageUrl: form.imageUrl.trim(),
            link: form.link.trim(),
            position: Number(form.position),
          }, {
            onSuccess: () => { setOpenCreate(false); notify({ title: "Đã tạo", variant: "success" }) },
            onError: (err: any) => notify({ title: "Lỗi", description: String(err?.message || 'Không thể tạo'), variant: 'destructive' })
          })
        }}
      >
        <BannerForm value={form} onChange={(v) => { setForm(v) }} error={errors} />
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
        title="Sửa banner"
        confirmText={updating ? "Đang lưu..." : "Lưu"}
        loading={updating}
        position="top"
        onConfirm={() => {
          if (!editing) return
          const e = validate(form)
          setErrors(e)
          if (Object.keys(e).length) return
          updateBanner({
            id: editing.id,
            title: form.title.trim(),
            imageUrl: form.imageUrl.trim(),
            link: form.link.trim(),
            position: Number(form.position),
          }, {
            onSuccess: () => { setOpenEdit(false); notify({ title: "Đã cập nhật", variant: "success" }) },
            onError: (err: any) => notify({ title: "Lỗi", description: String(err?.message || 'Không thể cập nhật'), variant: 'destructive' })
          })
        }}
      >
        <BannerForm value={form} onChange={(v) => { setForm(v) }} error={errors} />
      </AdminActionDialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={openDeleteConfirm}
        onOpenChange={setOpenDeleteConfirm}
        title="Xác nhận xoá"
        description={<span>Bạn có chắc muốn xoá banner "<b>{target?.title}</b>"?</span>}
        confirmText={deleting ? "Đang xoá..." : "Xoá"}
        confirmVariant="destructive"
        loading={deleting}
        onConfirm={() => {
          if (!target) return
          deleteBanner({ id: target.id }, {
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
