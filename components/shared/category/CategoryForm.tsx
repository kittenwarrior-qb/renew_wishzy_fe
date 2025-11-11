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
  error,
  onValidate,
  register,
  excludeId,
  excludeIds,
  allowParentSelect = true,
  showParentField = true,
}: {
  value: CategoryFormValue
  onChange: (next: CategoryFormValue) => void
  parents: CategoryOption[]
  disabled?: boolean
  error?: string
  onValidate?: (field: keyof CategoryFormValue, value: string) => void
  register?: (name: keyof CategoryFormValue) => (el: HTMLElement | null) => void
  excludeId?: string | number
  excludeIds?: Array<string | number>
  allowParentSelect?: boolean
  showParentField?: boolean
}) {
  const onField = (name: keyof CategoryFormValue) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({ ...value, [name]: e.target.value })
  }

  const getId = (c: any) => String(c?.id ?? c?._id ?? c?.categoryId ?? c?.value ?? "")
  const getName = (c: any) => String(c?.name ?? c?.title ?? c?.label ?? c?.slug ?? getId(c))
  const currentLabel = React.useMemo(() => {
    const pid = String(value.parentId || "")
    if (!pid) return ""
    const hit = (parents ?? []).find((c) => getId(c) === pid)
    return hit ? getName(hit) : `(ID: ${pid})`
  }, [parents, value.parentId])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Tên</label>
        <Input
          name="name"
          value={value.name}
          onChange={onField("name")}
          onBlur={(e) => onValidate?.("name", e.target.value)}
          placeholder="Tên danh mục"
          disabled={disabled}
          aria-invalid={!!error}
          ref={register ? (register("name") as any) : undefined}
        />
        {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
      </div>
      {showParentField ? (
        <div>
          <label className="mb-1 block text-sm font-medium">Danh mục cha</label>
          {allowParentSelect ? (
            <Select
              value={value.parentId || undefined}
              onValueChange={(v: string) => onChange({ ...value, parentId: v === "__none" ? "" : v })}
            >
              <SelectTrigger disabled={disabled} ref={register ? (register("parentId") as any) : undefined}>
                <SelectValue placeholder={currentLabel || "Không chọn"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Không chọn</SelectItem>
                {value.parentId && !(parents ?? []).some((c) => getId(c) === String(value.parentId)) ? (
                  <SelectItem value={String(value.parentId)}>(ID: {String(value.parentId)})</SelectItem>
                ) : null}
                {(parents ?? [])
                  .filter((c) => {
                    const id = getId(c)
                    if (id === String(excludeId ?? "")) return false
                    if (Array.isArray(excludeIds) && excludeIds.length > 0) {
                      return !excludeIds.map(String).includes(id)
                    }
                    return true
                  })
                  .map((c) => (
                  <SelectItem key={getId(c)} value={getId(c)}>{getName(c)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input value={currentLabel || (value.parentId ? `(ID: ${String(value.parentId)})` : "Không chọn")} disabled readOnly />
          )}
        </div>
      ) : null}
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Ghi chú</label>
        <Textarea
          name="notes"
          value={value.notes ?? ""}
          onChange={onField("notes")}
          placeholder="Ghi chú..."
          rows={5}
          className="resize-none max-h-40"
          disabled={disabled}
          ref={register ? (register("notes") as any) : undefined}
        />
      </div>
    </div>
  )
}
