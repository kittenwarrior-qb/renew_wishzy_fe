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
        className="w-full min-h-[300px] p-4 text-base rounded-2xl border bg-background shadow-inner"
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
    <div className="space-y-4">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-[11px] font-bold px-4 py-2 rounded-xl border bg-background hover:bg-muted/50 transition-all flex items-center gap-2 shadow-sm"
          disabled={uploading}
        >
          {uploading ? (
            "Đang tải..."
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
              Tải ảnh lên
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
            e.target.value = ""
          }}
        />
      </div>

      <div className="w-full overflow-hidden rounded-2xl border shadow-sm bg-background relative">
        <style dangerouslySetInnerHTML={{
          __html: `
                    .ck-editor__editable {
                        min-height: 500px !important;
                        max-height: 1000px !important;
                        overflow-y: auto !important;
                        padding: 2rem !important;
                        line-height: 1.8 !important;
                        font-family: inherit !important;
                    }
                    .ck.ck-editor__main>.ck-editor__editable:focus {
                        box-shadow: none !important;
                        border: none !important;
                    }
                    .ck.ck-editor__top {
                        border-bottom: 1px solid hsl(var(--border)) !important;
                    }
                    .ck.ck-toolbar {
                        border: none !important;
                        background: hsl(var(--muted)/0.3) !important;
                        padding: 0.5rem !important;
                    }
                    .ck-content {
                        font-size: 16px !important;
                    }
                    .ck-editor__editable::-webkit-scrollbar {
                        width: 8px;
                    }
                    .ck-editor__editable::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .ck-editor__editable::-webkit-scrollbar-thumb {
                        background: hsl(var(--muted-foreground)/0.2);
                        border-radius: 10px;
                    }
                    .ck-editor__editable::-webkit-scrollbar-thumb:hover {
                        background: hsl(var(--muted-foreground)/0.4);
                    }
                ` }} />
        <CKEditor
          editor={ClassicEditor}
          data={value}
          config={{
            toolbar: {
              shouldNotGroupWhenFull: true
            },
            placeholder: 'Nhập nội dung bài viết...',
          }}
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
