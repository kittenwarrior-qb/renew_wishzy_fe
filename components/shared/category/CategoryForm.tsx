"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

export type CategoryFormValue = {
  name: string
  notes?: string
  parentId?: string
}

export type CategoryOption = { id: string | number; name: string }

export function CategoryForm({
  value,
  onChange,
  parents,
  disabled,
}: {
  value: CategoryFormValue
  onChange: (next: CategoryFormValue) => void
  parents: CategoryOption[]
  disabled?: boolean
}) {
  const onField = (name: keyof CategoryFormValue) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({ ...value, [name]: e.target.value })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Tên</label>
        <Input name="name" value={value.name} onChange={onField("name")} placeholder="Tên danh mục" required disabled={disabled} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Parent</label>
        <Select
          value={value.parentId || undefined}
          onValueChange={(v: string) => onChange({ ...value, parentId: v === "__none" ? "" : v })}
        >
          <SelectTrigger disabled={disabled}>
            <SelectValue placeholder="Không chọn" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">Không chọn</SelectItem>
            {(parents ?? []).map((c) => (
              <SelectItem key={String((c as any).id)} value={String((c as any).id)}>{(c as any).name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Ghi chú</label>
        <Textarea name="notes" value={value.notes ?? ""} onChange={onField("notes")} placeholder="Ghi chú..." rows={6} disabled={disabled} />
      </div>
    </div>
  )
}
