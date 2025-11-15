"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { AdminActionDialog } from "@/components/admin/common/AdminActionDialog"
import Link from "next/link"
import { notify } from "@/components/shared/admin/Notifications"
import { useAppStore } from "@/stores/useAppStore"
import { useCourseList, useToggleCourseStatus, useDeleteCourse, type Course } from "@/components/shared/course/useCourse"
import { useParentCategories } from "@/components/shared/category/useCategory"
import { Plus, Pencil, Trash2, Inbox, ExternalLink, Image as ImageIcon } from "lucide-react"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"
import { TruncateTooltipWrapper } from "@/components/shared/common/TruncateTooltipWrapper"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore"

type CourseFormValue = Partial<Pick<Course, "name" | "price" | "level" | "totalDuration" | "categoryId" | "description" | "notes" | "thumbnail">>

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
  const [name, setName] = React.useState<string>(searchParams.get("name") || "")
  const [status, setStatus] = React.useState<string>(searchParams.get("status") || "__all")
  const [level, setLevel] = React.useState<string>(searchParams.get("level") || "__all")
  const [categoryId, setCategoryId] = React.useState<string>(searchParams.get("categoryId") || "__all")

  const prevRef = React.useRef<{ page: number; limit: number; name?: string; status?: string; level?: string; categoryId?: string } | null>(null)
  React.useEffect(() => {
    const qs = new URLSearchParams()
    if (name) qs.append("name", name)
    if (status && status !== "__all") qs.append("status", status)
    if (level && level !== "__all") qs.append("level", level)
    if (categoryId && categoryId !== "__all") qs.append("categoryId", categoryId)
    qs.append("page", String(page))
    qs.append("limit", String(limit))
    const href = `/${locale}/admin/courses${qs.toString() ? `?${qs.toString()}` : ""}`
    const prev = prevRef.current
    const normStatus = status === "__all" ? undefined : status
    const normLevel = level === "__all" ? undefined : level
    const normCategoryId = categoryId === "__all" ? undefined : categoryId
    const onlyPaging = !!prev && prev.name === (name || undefined) && prev.status === normStatus && prev.level === normLevel && prev.categoryId === normCategoryId && (prev.page !== page || prev.limit !== limit)
    if (onlyPaging) router.push(href); else router.replace(href)
    prevRef.current = { page, limit, name: name || undefined, status: normStatus, level: normLevel, categoryId: normCategoryId }
  }, [page, limit, name, status, level, categoryId, locale, router])

  const filter = React.useMemo(() => ({
    page,
    limit,
    name: name || undefined,
    status: status !== '__all' ? (status === 'true') : undefined,
    courseLevel: level !== '__all' ? (level as 'beginner' | 'intermediate' | 'advanced') : undefined,
    categoryId: categoryId !== '__all' ? categoryId : undefined,
  }), [page, limit, name, status, level, categoryId])
  const { data, isPending, isFetching, isError } = useCourseList(filter)
  const { data: parentsData } = useParentCategories()
  const categories = (parentsData?.data ?? []) as Array<{ id: string; name: string }>
  const items = (data?.data ?? []) as Course[]
  const total = data?.total ?? 0
  const currentPage = data?.page ?? page
  const pageSize = data?.limit ?? limit
  const totalPages = data?.totalPages ?? Math.ceil((total || 0) / (pageSize || 10))

  const { mutate: toggleStatus, isPending: toggling } = useToggleCourseStatus()
  const { mutate: deleteCourse, isPending: deleting } = useDeleteCourse()

  const [openDelete, setOpenDelete] = React.useState(false)
  const [deletingTarget, setDeletingTarget] = React.useState<Course | null>(null)
  const onConfirmDelete = (c: Course) => { setDeletingTarget(c); setOpenDelete(true) }

  React.useEffect(() => {
    setPrimaryAction({
      label: "Thêm khoá học",
      variant: "default",
      onClick: () => router.push(`/${locale}/admin/courses/create`),
    })

    return () => setPrimaryAction(null)
  }, [setPrimaryAction, router, locale])

  return (
    <div className="">
      <div className="mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <Input value={name} onChange={(e) => { setName(e.target.value); setPage(1) }} placeholder="Tìm theo tên" className="h-9 w-52" />
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
              <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Tất cả</SelectItem>
                <SelectItem value="true">Đã xuất bản</SelectItem>
                <SelectItem value="false">Nháp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={level} onValueChange={(v) => { setLevel(v); setPage(1) }}>
              <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Cấp độ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Tất cả</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setPage(1) }}>
              <SelectTrigger className="h-9 w-56"><SelectValue placeholder="Danh mục" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Tất cả</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={String((c as any).id)} value={String((c as any).id)}>{(c as any).name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="relative min-h-[300px]">
        <LoadingOverlay show={isPending || isFetching} />

        {isError ? (
          <div className="py-16 text-center text-sm text-destructive">Lỗi tải dữ liệu</div>
        ) : items.length === 0 ? (
          <div className="py-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="h-10 w-10 text-muted-foreground/60" />
              <span>Không có dữ liệu</span>
            </div>
          </div>
        ) : (
          (() => {
            const columns: Column<Course & any>[] = [
              {
                key: 'thumbnail',
                label: 'Ảnh',
                type: 'short',
                render: (row: Course) => (
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="group inline-flex h-12 w-16 items-center justify-center overflow-hidden rounded-md bg-muted/40 hover:bg-muted"
                      >
                        {row.thumbnail ? (
                          <img
                            src={row.thumbnail as any}
                            alt={row.name || "Thumbnail"}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        ) : (
                          <span className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground">
                            <ImageIcon className="h-4 w-4" />
                            <span>Không có</span>
                          </span>
                        )}
                      </button>
                    </DialogTrigger>
                    {row.thumbnail ? (
                      <DialogContent className="sm:max-w-xl md:max-w-2xl border-none p-3 sm:p-4 bg-background/95">
                        <div className="mb-2 text-xs text-muted-foreground line-clamp-2">
                          {row.name || "Ảnh khoá học"}
                        </div>
                        <div className="rounded-md bg-muted flex items-center justify-center">
                          <img
                            src={row.thumbnail as any}
                            alt={row.name || "Thumbnail"}
                            className="max-h-[70vh] w-full object-contain rounded-md"
                          />
                        </div>
                      </DialogContent>
                    ) : null}
                  </Dialog>
                ),
              },
              {
                key: 'name',
                label: 'Tên',
                type: 'text',
                render: (row: Course) => (
                  <Link
                    href={`/${locale}/admin/courses/${row.id}`}
                    className="hover:underline flex items-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4" />

                    <TruncateTooltipWrapper lineClamp={1} maxWidth={260}>
                      <span>{row.name}</span>
                    </TruncateTooltipWrapper>
                  </Link>
                ),
              },
              {
                key: 'category',
                label: 'Danh mục',
                type: 'short',
                render: (row: Course) => row.category?.name || '-',
              },
              {
                key: 'price',
                label: 'Giá',
                type: 'number',
                render: (row: Course) => Number(row.price).toLocaleString() + ' VNĐ',
              },
              {
                key: 'level',
                label: 'Cấp độ',
                type: 'short',
                render: (row: Course) => {
                  const level = String(row.level || '').toLowerCase()
                  const base = "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium"
                  const color = level === 'beginner'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : level === 'intermediate'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : level === 'advanced'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-muted text-muted-foreground border-transparent'

                  return (
                    <span className={`${base} ${color}`}>
                      {level || '-'}
                    </span>
                  )
                },
              },
              {
                key: 'status',
                label: 'Trạng thái',
                type: 'short',
                render: (row: Course) => (
                  <Button
                    variant={row.status ? "secondary" : "outline"}
                    size="sm"
                    disabled={toggling}
                    onClick={() =>
                      toggleStatus(
                        { id: String(row.id) },
                        {
                          onError: (e: any) =>
                            notify({
                              title: "Lỗi",
                              description: String(e?.message || "Không thể cập nhật"),
                              variant: "destructive",
                            }),
                        },
                      )
                    }
                  >
                    {row.status ? "Xuất bản" : "Nháp"}
                  </Button>
                ),
              },
              {
                key: 'createdAt',
                label: 'Ngày tạo',
                type: 'short',
                render: (row: Course) => new Date(row.createdAt).toLocaleDateString(),
              },
              {
                key: 'actions',
                label: 'Hành động',
                type: 'action',
                render: (row: Course) => (
                  <div className="flex items-center justify-center gap-3">
                    <Link
                      href={`/${locale}/admin/courses/edit/${row.id}`}
                      className="inline-flex text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-5 w-5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onConfirmDelete(row)}
                      disabled={deleting}
                      className="inline-flex text-destructive hover:text-destructive/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ),
              },
            ]
            return (
              <DynamicTable
                columns={columns}
                data={items as any}
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
          })()
        )}
      </div>

      {/* Delete confirm */}
      <AdminActionDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Xác nhận xoá"
        description={<span>Bạn có chắc muốn xoá khoá học "<b>{deletingTarget?.name}</b>"?</span>}
        confirmText={deleting ? "Đang xoá..." : "Xoá"}
        confirmVariant="destructive"
        loading={deleting}
        position="top"
        onConfirm={() => {
          if (!deletingTarget) return
          deleteCourse({ id: String(deletingTarget.id) }, {
            onSuccess: () => { setOpenDelete(false); notify({ title: "Đã xoá", variant: "success" }) },
            onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể xoá"), variant: "destructive" })
          })
        }}
      />
    </div>
  )
}
