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
import { useCourseList, useToggleCourseStatus, useDeleteCourse, useCreateCourse, useUpdateCourse, type Course } from "@/components/shared/course/useCourse"
import { useParentCategories } from "@/components/shared/category/useCategory"
import { Plus, Pencil, Trash2, Inbox } from "lucide-react"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"

type CourseFormValue = Partial<Pick<Course, "name" | "price" | "level" | "totalDuration" | "categoryId" | "description" | "notes" | "thumbnail">>

export default function Page() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useAppStore()
  const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"

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
          <div className="flex items-center gap-2 justify-end">
            <Link href={`/${locale}/admin/courses/create`} className="inline-flex"><Button className="h-9 gap-2"><Plus className="h-4 w-4" />Thêm khoá học</Button></Link>
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
                key: 'name', title: 'Tên', render: (row: Course) => (
                  <Link href={`/${locale}/admin/courses/${row.id}`} className="text-primary hover:underline cursor-pointer">{row.name}</Link>
                )
              },
              { key: 'category', title: 'Danh mục', render: (row: Course) => row.category?.name || '-' },
              { key: 'price', title: 'Giá', align: 'right', render: (row: Course) => Number(row.price).toLocaleString() },
              { key: 'level', title: 'Cấp độ', align: 'center', render: (row: Course) => String(row.level || '').toLowerCase() },
              {
                key: 'status', title: 'Trạng thái', align: 'center', render: (row: Course) => (
                  <Button variant={row.status ? "secondary" : "outline"} size="sm" disabled={toggling}
                    onClick={() => toggleStatus({ id: String(row.id) }, { onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể cập nhật"), variant: "destructive" }) })}>
                    {row.status ? "Xuất bản" : "Nháp"}
                  </Button>
                )
              },
              { key: 'createdAt', title: 'Ngày tạo', align: 'center', render: (row: Course) => new Date(row.createdAt).toLocaleDateString() },
              {
                key: 'actions', title: 'Hành động', align: 'center', render: (row: Course) => (
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/${locale}/admin/courses/edit/${row.id}`} className="inline-flex"><Button variant="outline" size="sm" className="gap-1 cursor-pointer"><Pencil className="h-4 w-4" />Sửa</Button></Link>
                    <Button variant="destructive" size="sm" className="gap-1 cursor-pointer" onClick={() => onConfirmDelete(row)} disabled={deleting}><Trash2 className="h-4 w-4" />Xoá</Button>
                  </div>
                )
              },
            ]
            return (
              <DynamicTable
                columns={columns}
                data={items as any}
                loading={isPending || isFetching}
                pagination={{ totalItems: total, currentPage, itemsPerPage: pageSize, onPageChange: (p) => setPage(p) }}
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

function CourseForm({ form, setForm, categories }: { form: CourseFormValue; setForm: (v: CourseFormValue) => void; categories: Array<{ id: string; name: string }> }) {
  const onField = (k: keyof CourseFormValue) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value })
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      <div>
        <label className="mb-1 block text-sm font-medium">Tên</label>
        <Input value={form.name || ""} onChange={onField("name")} placeholder="Tên khoá học" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Danh mục</label>
        <Select value={form.categoryId || ""} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
          <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => (<SelectItem key={String((c as any).id)} value={String((c as any).id)}>{(c as any).name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Giá</label>
        <Input type="number" value={form.price as any} onChange={onField("price")} placeholder="0" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Cấp độ</label>
        <Select value={form.level || "beginner"} onValueChange={(v) => setForm({ ...form, level: v as any })}>
          <SelectTrigger><SelectValue placeholder="Chọn cấp độ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Tổng thời lượng (phút)</label>
        <Input type="number" value={form.totalDuration as any} onChange={onField("totalDuration")} placeholder="0" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Thumbnail (URL)</label>
        <Input value={form.thumbnail || ""} onChange={onField("thumbnail")} placeholder="https://...jpg" />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Mô tả</label>
        <Input value={form.description || ""} onChange={onField("description")} placeholder="Mô tả ngắn" />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Ghi chú</label>
        <Input value={form.notes || ""} onChange={onField("notes")} placeholder="Ghi chú..." />
      </div>
    </div>
  )
}
