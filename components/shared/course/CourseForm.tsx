"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

export type CourseFormValue = {
  name: string
  description?: string
  notes?: string
  thumbnail?: string
  price: string
  categoryId: string
  level?: string
  status?: boolean
}

export type CategoryOption = { id: string | number; name: string }

const LEVELS = [
  { value: "beginner", label: "Cơ bản" },
  { value: "intermediate", label: "Trung bình" },
  { value: "advanced", label: "Nâng cao" },
]

export function CourseForm({
  value,
  onChange,
  categories,
  disabled,
  error,
  onValidate,
  register,
}: {
  value: CourseFormValue
  onChange: (next: CourseFormValue) => void
  categories: CategoryOption[]
  disabled?: boolean
  error?: string
  onValidate?: (field: keyof CourseFormValue, value: string | boolean) => void
  register?: (name: keyof CourseFormValue) => (el: HTMLElement | null) => void
}) {
  const onField = (name: keyof CourseFormValue) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({ ...value, [name]: e.target.value })
  }

  const onSelectField = (name: keyof CourseFormValue) => (val: string) => {
    onChange({ ...value, [name]: val })
  }

  const onCheckboxField = (name: keyof CourseFormValue) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, [name]: e.target.checked })
  }

  const getId = (c: any) => String(c?.id ?? c?._id ?? c?.categoryId ?? c?.value ?? "")
  const getName = (c: any) => String(c?.name ?? c?.title ?? c?.label ?? c?.slug ?? getId(c))
  const currentCategoryLabel = React.useMemo(() => {
    const cid = String(value.categoryId || "")
    if (!cid) return ""
    const hit = (categories ?? []).find((c) => getId(c) === cid)
    return hit ? getName(hit) : `(ID: ${cid})`
  }, [categories, value.categoryId])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Tên khóa học *</label>
        <Input
          name="name"
          value={value.name}
          onChange={onField("name")}
          onBlur={(e) => onValidate?.("name", e.target.value)}
          placeholder="Tên khóa học"
          disabled={disabled}
          aria-invalid={!!error}
          ref={register ? (register("name") as any) : undefined}
        />
        {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Mô tả</label>
        <Textarea
          name="description"
          value={value.description ?? ""}
          onChange={onField("description")}
          placeholder="Mô tả khóa học..."
          rows={4}
          disabled={disabled}
          ref={register ? (register("description") as any) : undefined}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Danh mục *</label>
        <Select
          value={value.categoryId ? String(value.categoryId) : undefined}
          onValueChange={onSelectField("categoryId")}
        >
          <SelectTrigger disabled={disabled} ref={register ? (register("categoryId") as any) : undefined}>
            <SelectValue placeholder={currentCategoryLabel || "Chọn danh mục"} />
          </SelectTrigger>
          <SelectContent>
            {value.categoryId && !(categories ?? []).some((c) => getId(c) === String(value.categoryId)) ? (
              <SelectItem value={String(value.categoryId)}>(ID: {String(value.categoryId)})</SelectItem>
            ) : null}
            {(categories ?? []).map((c) => (
              <SelectItem key={getId(c)} value={getId(c)}>{getName(c)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Giá *</label>
        <Input
          name="price"
          type="number"
          value={value.price}
          onChange={onField("price")}
          placeholder="0"
          min="0"
          step="0.01"
          disabled={disabled}
          ref={register ? (register("price") as any) : undefined}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Cấp độ</label>
        <Select
          value={value.level ? value.level : "__none"}
          onValueChange={(val) => onChange({ ...value, level: val === "__none" ? undefined : val })}
        >
          <SelectTrigger disabled={disabled}>
            <SelectValue placeholder="Chọn cấp độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">Không chọn</SelectItem>
            {LEVELS.map((l) => (
              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Hình ảnh (URL)</label>
        <Input
          name="thumbnail"
          value={value.thumbnail ?? ""}
          onChange={onField("thumbnail")}
          placeholder="https://..."
          disabled={disabled}
          ref={register ? (register("thumbnail") as any) : undefined}
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Ghi chú</label>
        <Textarea
          name="notes"
          value={value.notes ?? ""}
          onChange={onField("notes")}
          placeholder="Ghi chú..."
          rows={4}
          disabled={disabled}
          ref={register ? (register("notes") as any) : undefined}
        />
      </div>

      <div className="md:col-span-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value.status ?? true}
            onChange={onCheckboxField("status")}
            disabled={disabled}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium">Kích hoạt</span>
        </label>
      </div>
    </div>
  )
}

