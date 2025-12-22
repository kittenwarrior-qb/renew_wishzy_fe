"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { AdminActionDialog } from "@/components/admin/common/AdminActionDialog"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { notify } from "@/components/shared/admin/Notifications"
import { useFaqsAdmin, useCreateFaq, useUpdateFaq, useDeleteFaq, useToggleFaqActive } from "@/src/hooks/useFaqs"
import type { Faq } from "@/services/faq"
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore"
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"
import { AdminDataErrorState } from "@/components/shared/admin/AdminDataErrorState"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Switch from "@/components/ui/switch"

interface FaqFormValue {
  question: string
  answer: string
  orderIndex: number
  isActive: boolean
}

function FaqForm({ value, onChange, error }: {
  value: FaqFormValue
  onChange: (v: FaqFormValue) => void
  error: Partial<Record<keyof FaqFormValue, string>>
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="question">Câu hỏi <span className="text-destructive">*</span></Label>
        <Input
          id="question"
          value={value.question}
          onChange={(e) => onChange({ ...value, question: e.target.value })}
          placeholder="Nhập câu hỏi..."
        />
        {error.question && <p className="text-sm text-destructive mt-1">{error.question}</p>}
      </div>
      <div>
        <Label htmlFor="answer">Câu trả lời <span className="text-destructive">*</span></Label>
        <Textarea
          id="answer"
          value={value.answer}
          onChange={(e) => onChange({ ...value, answer: e.target.value })}
          placeholder="Nhập câu trả lời..."
          rows={4}
        />
        {error.answer && <p className="text-sm text-destructive mt-1">{error.answer}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="orderIndex">Thứ tự hiển thị</Label>
          <Input
            id="orderIndex"
            type="number"
            value={value.orderIndex}
            onChange={(e) => onChange({ ...value, orderIndex: Number(e.target.value) })}
            min={0}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Switch
            id="isActive"
            checked={value.isActive}
            onCheckedChange={(checked) => onChange({ ...value, isActive: checked })}
          />
          <Label htmlFor="isActive">Hiển thị</Label>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const { setPrimaryAction } = useAdminHeaderStore()

  const { data: faqs, isPending, isFetching, isError, refetch } = useFaqsAdmin()
  const { mutate: createFaq, isPending: creating } = useCreateFaq()
  const { mutate: updateFaq, isPending: updating } = useUpdateFaq()
  const { mutate: deleteFaq, isPending: deleting } = useDeleteFaq()
  const { mutate: toggleActive, isPending: toggling } = useToggleFaqActive()

  const [openCreate, setOpenCreate] = React.useState(false)
  const [openEdit, setOpenEdit] = React.useState(false)
  const [editing, setEditing] = React.useState<Faq | null>(null)
  const [openDeleteConfirm, setOpenDeleteConfirm] = React.useState(false)
  const [target, setTarget] = React.useState<Faq | null>(null)

  const [form, setForm] = React.useState<FaqFormValue>({ question: "", answer: "", orderIndex: 0, isActive: true })
  const [errors, setErrors] = React.useState<Partial<Record<keyof FaqFormValue, string>>>({})

  const validate = (v: FaqFormValue) => {
    const e: Partial<Record<keyof FaqFormValue, string>> = {}
    if (!v.question?.trim()) e.question = "Vui lòng nhập câu hỏi"
    if (!v.answer?.trim()) e.answer = "Vui lòng nhập câu trả lời"
    return e
  }

  const resetForm = () => {
    setForm({ question: "", answer: "", orderIndex: 0, isActive: true })
    setErrors({})
  }

  const items = faqs ?? []

  React.useEffect(() => {
    setPrimaryAction({
      label: "Thêm FAQ",
      variant: "default",
      onClick: () => {
        resetForm()
        setOpenCreate(true)
      },
    })

    return () => setPrimaryAction(null)
  }, [setPrimaryAction])

  const columns: Column<Faq & any>[] = [
    {
      key: 'orderIndex',
      title: 'STT',
      type: 'short',
      align: 'center',
    },
    {
      key: 'question',
      title: 'Câu hỏi',
      render: (row: Faq) => (
        <span className="line-clamp-2">{row.question}</span>
      ),
    },
    {
      key: 'answer',
      title: 'Câu trả lời',
      render: (row: Faq) => (
        <span className="line-clamp-2 text-muted-foreground">{row.answer}</span>
      ),
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      align: 'center',
      type: 'short',
      render: (row: Faq) => (
        <button
          onClick={() => toggleActive(row.id, {
            onSuccess: () => notify({ title: `FAQ đã ${row.isActive ? 'ẩn' : 'hiện'}`, variant: "success" }),
            onError: () => notify({ title: "Lỗi", variant: "destructive" }),
          })}
          disabled={toggling}
          className={`px-2 py-1 rounded text-xs font-medium ${
            row.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {row.isActive ? 'Hiện' : 'Ẩn'}
        </button>
      ),
    },
    {
      key: 'actions',
      title: 'Hành động',
      align: 'center',
      type: 'action',
      render: (row: Faq) => (
        <div className="inline-flex items-center gap-1">
          <button
            title="Sửa"
            type="button"
            className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent cursor-pointer"
            onClick={() => {
              setEditing(row)
              setForm({ question: row.question, answer: row.answer, orderIndex: row.orderIndex, isActive: row.isActive })
              setOpenEdit(true)
            }}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            title="Xoá"
            type="button"
            className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent text-destructive cursor-pointer"
            onClick={() => { setTarget(row); setOpenDeleteConfirm(true) }}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="relative">
      <LoadingOverlay show={isPending || isFetching} />

      {isError ? (
        <AdminDataErrorState
          title="Không thể tải danh sách FAQ"
          onRetry={() => refetch()}
        />
      ) : (
        <DynamicTable
          columns={columns}
          data={items as any}
          loading={isPending || isFetching}
        />
      )}

      {/* Create Dialog */}
      <AdminActionDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        title="Thêm FAQ"
        confirmText={creating ? "Đang lưu..." : "Lưu"}
        loading={creating}
        position="top"
        confirmVariant="default"
        onConfirm={() => {
          const e = validate(form)
          setErrors(e)
          if (Object.keys(e).length) return
          createFaq({
            question: form.question.trim(),
            answer: form.answer.trim(),
            orderIndex: form.orderIndex,
            isActive: form.isActive,
          }, {
            onSuccess: () => { setOpenCreate(false); notify({ title: "Đã tạo", variant: "success" }) },
            onError: (err: any) => notify({ title: "Lỗi", description: String(err?.message || 'Không thể tạo'), variant: 'destructive' })
          })
        }}
      >
        <FaqForm value={form} onChange={(v) => { setForm(v) }} error={errors} />
      </AdminActionDialog>

      {/* Edit Dialog */}
      <AdminActionDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        title="Sửa FAQ"
        confirmText={updating ? "Đang lưu..." : "Lưu"}
        loading={updating}
        position="top"
        onConfirm={() => {
          if (!editing) return
          const e = validate(form)
          setErrors(e)
          if (Object.keys(e).length) return
          updateFaq({
            id: editing.id,
            data: {
              question: form.question.trim(),
              answer: form.answer.trim(),
              orderIndex: form.orderIndex,
              isActive: form.isActive,
            }
          }, {
            onSuccess: () => { setOpenEdit(false); notify({ title: "Đã cập nhật", variant: "success" }) },
            onError: (err: any) => notify({ title: "Lỗi", description: String(err?.message || 'Không thể cập nhật'), variant: 'destructive' })
          })
        }}
      >
        <FaqForm value={form} onChange={(v) => { setForm(v) }} error={errors} />
      </AdminActionDialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={openDeleteConfirm}
        onOpenChange={setOpenDeleteConfirm}
        title="Xác nhận xoá"
        description={<span>Bạn có chắc muốn xoá FAQ này?</span>}
        confirmText={deleting ? "Đang xoá..." : "Xoá"}
        confirmVariant="destructive"
        loading={deleting}
        onConfirm={() => {
          if (!target) return
          deleteFaq(target.id, {
            onSuccess: () => { setOpenDeleteConfirm(false); notify({ title: "Đã xoá", variant: "success" }) },
            onError: (err: any) => notify({ title: "Lỗi", description: String(err?.message || 'Không thể xoá'), variant: 'destructive' })
          })
        }}
      />
    </div>
  )
}
