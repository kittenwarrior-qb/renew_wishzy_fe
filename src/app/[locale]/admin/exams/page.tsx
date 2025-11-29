"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"
import { AdminDataErrorState } from "@/components/shared/admin/AdminDataErrorState"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { notify } from "@/components/shared/admin/Notifications"
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore"
import {
  useAdminQuizList,
  useDeleteAdminQuiz,
  useUpdateAdminQuiz,
} from "@/components/shared/quiz/useQuiz"
import { AdminActionDialog } from "@/components/admin/common/AdminActionDialog"
import { QuizForm, type QuizFormValue, type QuizFormError } from "@/components/shared/quiz/QuizForm"
import type { AdminQuiz } from "@/types/quiz"

export default function Page() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setPrimaryAction } = useAdminHeaderStore()

  // Read initial values from URL or use defaults
  const initialPage = parseInt(searchParams.get("page") || "1", 10)
  const initialLimit = parseInt(searchParams.get("limit") || "10", 10)
  const initialSearch = searchParams.get("search") || ""

  const [page, setPage] = React.useState(initialPage)
  const [limit, setLimit] = React.useState(initialLimit)
  const [search, setSearch] = React.useState(initialSearch)

  // Sync URL when page, limit, or search changes
  const updateURL = React.useCallback((newPage: number, newLimit: number, newSearch: string) => {
    const params = new URLSearchParams()
    params.set("page", String(newPage))
    params.set("limit", String(newLimit))
    if (newSearch) params.set("search", newSearch)
    router.replace(`/${locale}/admin/exams?${params.toString()}`, { scroll: false })
  }, [router, locale])

  const { data, isPending, isFetching, isError, refetch } = useAdminQuizList({ page, limit })
  const { mutate: deleteQuiz, isPending: deleting } = useDeleteAdminQuiz()
  const { mutate: updateQuiz, isPending: updating } = useUpdateAdminQuiz()

  const [openDeleteConfirm, setOpenDeleteConfirm] = React.useState(false)
  const [target, setTarget] = React.useState<AdminQuiz | null>(null)

  const [openEdit, setOpenEdit] = React.useState(false)
  const [editing, setEditing] = React.useState<AdminQuiz | null>(null)

  const [form, setForm] = React.useState<QuizFormValue>({
    title: "",
    description: "",
    isPublic: true,
    isFree: true,
    price: 0,
    timeLimit: "",
    questions: [],
  })
  const [errors, setErrors] = React.useState<QuizFormError>({})

  const items = data?.data ?? []
  const total = data?.total ?? 0
  const currentPage = data?.page ?? page
  const pageSize = data?.limit ?? limit

  // Filter items based on search
  const filteredItems = React.useMemo(() => {
    if (!search) return items
    const searchLower = search.toLowerCase()
    return items.filter((item) => 
      item.title?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower)
    )
  }, [items, search])

  // Debounced search to avoid updating URL too frequently
  React.useEffect(() => {
    const timer = setTimeout(() => {
      updateURL(page, limit, search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, page, limit, updateURL])

  React.useEffect(() => {
    setPrimaryAction(null)

  }, [setPrimaryAction])

  return (
    <div className="relative p-4 md:p-6">
      <LoadingOverlay show={isPending || isFetching} />

      {/* Search and Actions Bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bài kiểm tra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => router.push(`/${locale}/admin/exams/create`)}
          className="shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm bài kiểm tra
        </Button>
      </div>

      {isError ? (
        <AdminDataErrorState
          title="Không thể tải danh sách bài kiểm tra"
          onRetry={() => refetch()}
        />
      ) : (
        (() => {
          const columns: Column<AdminQuiz & any>[] = [
            {
              key: "title",
              title: "Tiêu đề",
            },
            {
              key: "isPublic",
              title: "Công khai",
              align: "center",
              render: (row: AdminQuiz) => (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.isPublic
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-muted text-muted-foreground"}`}
                >
                  {row.isPublic ? "Công khai" : "Riêng tư"}
                </span>
              ),
            },
            {
              key: "isFree",
              title: "Miễn phí",
              align: "center",
              render: (row: AdminQuiz) => (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.isFree
                    ? "bg-sky-500/10 text-sky-600"
                    : "bg-amber-500/10 text-amber-600"}`}
                >
                  {row.isFree ? "Miễn phí" : "Trả phí"}
                </span>
              ),
            },
            {
              key: "price",
              title: "Giá",
              align: "right",
              render: (row: AdminQuiz) =>
                Number(row.price || 0).toLocaleString("vi-VN") + " VNĐ",
            },
            {
              key: "timeLimit",
              title: "Thời lượng",
              align: "center",
              render: (row: AdminQuiz) =>
                row.timeLimit ? `${row.timeLimit} phút` : "—",
            },
            {
              key: "totalAttempts",
              title: "Lượt làm",
              align: "center",
              render: (row: AdminQuiz) => row.totalAttempts ?? 0,
            },
            {
              key: "createdAt",
              title: "Ngày tạo",
              align: "center",
              render: (row: AdminQuiz) =>
                row.createdAt
                  ? new Date(row.createdAt).toLocaleDateString("vi-VN")
                  : "",
            },
            {
              key: "actions",
              title: "Hành động",
              align: "right",
              render: (row: AdminQuiz) => (
                <div className="inline-flex items-center gap-1">
                  <button
                    title="Sửa"
                    type="button"
                    className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent cursor-pointer"
                    onClick={() => {
                      setEditing(row)
                      setForm({
                        title: row.title || "",
                        description: row.description || "",
                        isPublic: !!row.isPublic,
                        isFree: !!row.isFree,
                        price: row.price ?? 0,
                        timeLimit: row.timeLimit ?? "",
                        questions: [],
                      })
                      setErrors({})
                      setOpenEdit(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    title="Xoá"
                    type="button"
                    className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent text-destructive cursor-pointer"
                    disabled={deleting}
                    onClick={() => {
                      setTarget(row)
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
              data={filteredItems as any}
              loading={isPending || isFetching}
              pagination={{
                totalItems: total,
                currentPage,
                itemsPerPage: pageSize,
                onPageChange: (np) => {
                  setPage(np)
                  updateURL(np, limit, search)
                },
                pageSizeOptions: [10, 20, 50],
                onPageSizeChange: (sz) => {
                  setLimit(sz)
                  setPage(1)
                  updateURL(1, sz, search)
                },
              }}
            />
          )
        })()
      )}

      <ConfirmDialog
        open={openDeleteConfirm}
        onOpenChange={setOpenDeleteConfirm}
        title="Xác nhận xoá"
        description={
          <span>
            Bạn có chắc muốn xoá bài kiểm tra "<b>{target?.title}</b>"?
          </span>
        }
        confirmText={deleting ? "Đang xoá..." : "Xoá"}
        confirmVariant="destructive"
        loading={deleting}
        position="top"
        onConfirm={() => {
          if (!target) return
          deleteQuiz(
            { id: target.id },
            {
              onSuccess: () => {
                setOpenDeleteConfirm(false)
                notify({ title: "Đã xoá", variant: "success" })
              },
              onError: (err: any) =>
                notify({
                  title: "Lỗi",
                  description: String(err?.message || "Không thể xoá"),
                  variant: "destructive",
                }),
            },
          )
        }}
      />

      {/* Edit Dialog */}
      <AdminActionDialog
        open={openEdit}
        onOpenChange={(next) => {
          if (!next) {
            setEditing(null)
          }
          setOpenEdit(next)
        }}
        title="Sửa bài kiểm tra"
        confirmText={updating ? "Đang lưu..." : "Lưu"}
        loading={updating}
        position="top"
        confirmVariant="default"
        onConfirm={() => {
          if (!editing) return

          const trimmedTitle = form.title.trim()
          const nextErrors: QuizFormError = {}
          if (!trimmedTitle) {
            nextErrors.title = "Vui lòng nhập tiêu đề"
          }
          setErrors(nextErrors)
          if (Object.keys(nextErrors).length) return

          updateQuiz(
            {
              id: editing.id,
              title: trimmedTitle,
              description: form.description?.trim() || undefined,
              isPublic: !!form.isPublic,
              isFree: !!form.isFree,
              price: form.price === "" ? 0 : Number(form.price),
              timeLimit: form.timeLimit === "" ? undefined : Number(form.timeLimit),
            },
            {
              onSuccess: () => {
                setOpenEdit(false)
                setEditing(null)
                notify({ title: "Đã cập nhật", variant: "success" })
              },
              onError: (err: any) =>
                notify({
                  title: "Lỗi",
                  description: String(err?.message || "Không thể cập nhật bài kiểm tra"),
                  variant: "destructive",
                }),
            },
          )
        }}
      >
        <QuizForm value={form} onChange={setForm} error={errors} mode="edit" />
      </AdminActionDialog>
    </div>
  )
}
