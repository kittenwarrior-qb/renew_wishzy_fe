"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

export interface ChapterFormItem {
  id?: string
  name: string
  description: string
  duration: string // minutes
}

export function ChapterForm({
  chapters,
  onChange,
  disabled,
}: {
  chapters: ChapterFormItem[]
  onChange: (chapters: ChapterFormItem[]) => void
  disabled?: boolean
}) {
  const updateChapter = (index: number, updates: Partial<ChapterFormItem>) => {
    const updated = [...chapters]
    updated[index] = { ...updated[index], ...updates }
    onChange(updated)
  }

  const addChapter = () => {
    onChange([...chapters, { name: "", description: "", duration: "0" }])
  }

  const removeChapter = (index: number) => {
    onChange(chapters.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Chapters *</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addChapter}
          disabled={disabled}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm chapter
        </Button>
      </div>

      {chapters.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4 border rounded-md">
          Chưa có chapter nào. Vui lòng thêm ít nhất một chapter.
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {chapters.map((chapter, index) => (
            <div key={index} className="border rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Chapter {index + 1}</span>
                {chapters.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeChapter(index)}
                    disabled={disabled}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Tên chapter *</label>
                <Input
                  value={chapter.name}
                  onChange={(e) => updateChapter(index, { name: e.target.value })}
                  placeholder="Tên chapter"
                  disabled={disabled}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Mô tả</label>
                <Textarea
                  value={chapter.description}
                  onChange={(e) => updateChapter(index, { description: e.target.value })}
                  placeholder="Mô tả chapter..."
                  rows={2}
                  disabled={disabled}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Thời lượng (phút) *</label>
                <Input
                  type="number"
                  value={chapter.duration}
                  onChange={(e) => updateChapter(index, { duration: e.target.value })}
                  placeholder="0"
                  min="0"
                  disabled={disabled}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

