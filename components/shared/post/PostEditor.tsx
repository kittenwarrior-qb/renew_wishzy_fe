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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all flex items-center gap-1.5"
            disabled={uploading}
          >
            {uploading ? "Đang tải ảnh..." : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                Chèn ảnh vào bài
              </>
            )}
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
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          Sẵn sàng soạn thảo
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border shadow-inner bg-background relative group">
        <style dangerouslySetInnerHTML={{
          __html: `
                    .ck-editor__editable {
                        min-height: 500px !important;
                        max-height: 1000px !important;
                        overflow-y: auto !important;
                        resize: vertical !important;
                        padding: 2rem !important;
                        line-height: 1.8 !important;
                        font-family: inherit !important;
                    }
                    .ck.ck-editor__main>.ck-editor__editable:focus {
                        box-shadow: none !important;
                        border: none !important;
                    }
                    .ck.ck-editor__top {
                        border-bottom: 1px solidhsl(var(--border)) !important;
                    }
                    .ck.ck-toolbar {
                        border: none !important;
                        background:hsl(var(--muted)/0.3) !important;
                        padding: 0.5rem !important;
                    }
                    .ck-content {
                        font-size: 16px !important;
                    }
                    /* Tùy chỉnh thanh cuộn cho editor */
                    .ck-editor__editable::-webkit-scrollbar {
                        width: 8px;
                    }
                    .ck-editor__editable::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .ck-editor__editable::-webkit-scrollbar-thumb {
                        background:hsl(var(--muted-foreground)/0.2);
                        border-radius: 10px;
                    }
                    .ck-editor__editable::-webkit-scrollbar-thumb:hover {
                        background:hsl(var(--muted-foreground)/0.4);
                    }
                    /* Cho phép cuộn ngang nếu nội dung quá rộng */
                    .ck.ck-editor__main {
                        overflow-x: auto !important;
                        max-width: 100%;
                    }
                ` }} />
        <CKEditor
          editor={ClassicEditor}
          data={value}
          onReady={(editor: any) => {
            editorRef.current = editor
          }}
          onChange={(_evt: any, editor: any) => {
            const data = editor.getData()
            onChange(data)
          }}
        />
      </div>
    </div>
  )
}
