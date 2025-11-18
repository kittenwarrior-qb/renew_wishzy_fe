"use client"

import * as React from "react"
import { uploadImage } from "@/services/uploads"
import { notify } from "@/components/shared/admin/Notifications"

type Props = {
  value: string
  onChange: (v: string) => void
}

export function PostEditor({ value, onChange }: Props) {
  const editorRef = React.useRef<any>(null)
  const [ready, setReady] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = React.useState(false)

  React.useEffect(() => {
    const w = typeof window !== 'undefined' ? (window as any) : undefined
    const CKEditor = w?.__CKE__?.CKEditor
    const ClassicEditor = w?.__CKE__?.ClassicEditor
    if (!CKEditor || !ClassicEditor) return

    setReady(true)
  }, [])

  if (!ready) {
    return (
      <textarea
        className="w-full min-h-[280px] p-3 text-sm rounded-md border bg-background"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập nội dung bài viết..."
      />
    )
  }

  const w = (window as any)
  const CKEditor = w.__CKE__.CKEditor
  const ClassicEditor = w.__CKE__.ClassicEditor

  const handleInsertImage = async (file: File) => {
    try {
      setUploading(true)
      const { url } = await uploadImage(file, "/uploads/image", { fieldName: "file" })
      if (!url) throw new Error("Upload không trả về URL")

      const editor = editorRef.current
      if (editor) {
        const current = editor.getData?.() ?? ""
        const imgHtml = `<p><img src="${url}" alt="" /></p>`
        const next = current ? `${current}${imgHtml}` : imgHtml
        editor.setData?.(next)
        onChange(next)
      } else {
        // fallback nếu vì lý do nào đó editorRef chưa có
        const imgHtml = `<p><img src="${url}" alt="" /></p>`
        const next = value ? `${value}${imgHtml}` : imgHtml
        onChange(next)
      }

      notify({ title: "Tải ảnh thành công", variant: "success" })
    } catch (e: any) {
      notify({ title: "Lỗi upload ảnh", description: String(e?.message || "Không thể tải ảnh"), variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Nội dung bài viết</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-2 py-1 rounded border bg-background hover:bg-accent"
            disabled={uploading}
          >
            {uploading ? "Đang tải ảnh..." : "Chèn ảnh"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (f) await handleInsertImage(f)
              e.target.value = "" // cho phép chọn lại cùng một file
            }}
          />
        </div>
      </div>

      <CKEditor
        editor={ClassicEditor}
        data={value}
        onReady={(editor: any) => {
          editorRef.current = editor
          try {
            // Thêm min-height cho vùng editable của CKEditor
            setTimeout(() => {
              const nodes = document.querySelectorAll<HTMLElement>(".ck-editor__editable")
              nodes.forEach((el) => {
                el.style.minHeight = "400px"
              })
            }, 0)
          } catch {
            // ignore height errors
          }
        }}
        onChange={(_evt: any, editor: any) => {
          const data = editor.getData()
          onChange(data)
        }}
      />
    </div>
  )
}
