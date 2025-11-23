"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"

import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"
import { AdminDataErrorState } from "@/components/shared/admin/AdminDataErrorState"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { notify } from "@/components/shared/admin/Notifications"
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore"
import {
  useAdminQuizList,
  useDeleteAdminQuiz,
  useCreateAdminQuiz,
  useUpdateAdminQuiz,
} from "@/components/shared/quiz/useQuiz"
import { AdminActionDialog } from "@/components/admin/common/AdminActionDialog"
import { QuizForm, type QuizFormValue, type QuizFormError } from "@/components/shared/quiz/QuizForm"
import type { AdminQuiz } from "@/types/quiz"

export default function Page() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"
  const { setPrimaryAction } = useAdminHeaderStore()

  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)

  const { data, isPending, isFetching, isError, refetch } = useAdminQuizList({ page, limit })
  const { mutate: deleteQuiz, isPending: deleting } = useDeleteAdminQuiz()
  const { mutate: createQuiz, isPending: creating } = useCreateAdminQuiz()
  const { mutate: updateQuiz, isPending: updating } = useUpdateAdminQuiz()

  const [openDeleteConfirm, setOpenDeleteConfirm] = React.useState(false)
  const [target, setTarget] = React.useState<AdminQuiz | null>(null)

  const [openCreate, setOpenCreate] = React.useState(false)
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

  const resetForm = React.useCallback(() => {
    setForm({
      title: "",
      description: "",
      isPublic: true,
      isFree: true,
      price: 0,
      timeLimit: "",
      questions: [
        {
          questionText: "",
          points: "",
          answerOptions: [
            { optionText: "", isCorrect: true },
            { optionText: "", isCorrect: false },
          ],
        },
      ],
    })
    setErrors({})
  }, [])

  const validateCreate = (v: QuizFormValue): QuizFormError => {
    const e: QuizFormError = {}
    if (!v.title.trim()) e.title = "Vui lòng nhập tiêu đề"

    const priceNum = v.price === "" ? 0 : Number(v.price)
    if (Number.isNaN(priceNum) || priceNum < 0) e.price = "Giá không hợp lệ"

    const tlNum = v.timeLimit === "" ? 0 : Number(v.timeLimit)
    if (tlNum <= 0) e.timeLimit = "Thời gian làm phải > 0"

    if (!v.questions.length) {
      e.questions = "Cần ít nhất 1 câu hỏi"
      return e
    }

    for (let i = 0; i < v.questions.length; i++) {
      const q = v.questions[i]
      if (!q.questionText.trim()) {
        e.questions = `Câu hỏi ${i + 1} thiếu nội dung`
        break
      }
      const pts = q.points === "" ? 0 : Number(q.points)
      if (pts <= 0) {
        e.questions = `Điểm của câu hỏi ${i + 1} phải > 0`
        break
      }
      if (!q.answerOptions || q.answerOptions.length < 2) {
        e.questions = `Câu hỏi ${i + 1} cần ít nhất 2 đáp án`
        break
      }
      const hasCorrect = q.answerOptions.some((a) => a.isCorrect)
      if (!hasCorrect) {
        e.questions = `Câu hỏi ${i + 1} cần ít nhất 1 đáp án đúng`
        break
      }
      const hasEmpty = q.answerOptions.some((a) => !a.optionText.trim())
      if (hasEmpty) {
        e.questions = `Một số đáp án của câu hỏi ${i + 1} còn trống`
        break
      }
    }

    return e
  }

  React.useEffect(() => {
    setPrimaryAction({
      label: "Thêm bài kiểm tra",
      variant: "default",
      onClick: () => {
        resetForm()
        setOpenCreate(true)
      },
    })

    return () => setPrimaryAction(null)
  }, [setPrimaryAction])

  return (
    <div className="relative p-4 md:p-6">
      <LoadingOverlay show={isPending || isFetching} />

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
              data={items as any}
              loading={isPending || isFetching}
              pagination={{
                totalItems: total,
                currentPage,
                itemsPerPage: pageSize,
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

      {/* Create Dialog */}
      <AdminActionDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        title="Thêm bài kiểm tra"
        confirmText={creating ? "Đang lưu..." : "Lưu"}
        loading={creating}
        position="top"
        confirmVariant="default"
        onConfirm={() => {
          const e = validateCreate(form)
          setErrors(e)
          if (Object.keys(e).length) return

          createQuiz(
            {
              title: form.title.trim(),
              description: form.description.trim() || undefined,
              isPublic: !!form.isPublic,
              isFree: !!form.isFree,
              price: form.price === "" ? 0 : Number(form.price),
              timeLimit: form.timeLimit === "" ? undefined : Number(form.timeLimit),
              questions: form.questions.map((q, idx) => ({
                questionText: q.questionText.trim(),
                points: q.points === "" ? 1 : Number(q.points),
                answerOptions: q.answerOptions.map((a) => ({
                  optionText: a.optionText.trim(),
                  isCorrect: !!a.isCorrect,
                })),
              })),
            },
            {
              onSuccess: () => {
                setOpenCreate(false)
                notify({ title: "Đã tạo", variant: "success" })
              },
              onError: (err: any) =>
                notify({
                  title: "Lỗi",
                  description: String(err?.message || "Không thể tạo bài kiểm tra"),
                  variant: "destructive",
                }),
            },
          )
        }}
      >
        <QuizForm value={form} onChange={setForm} error={errors} mode="create" />
      </AdminActionDialog>

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
              description: form.description.trim() || undefined,
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
