"use client"

import * as React from "react"

type Props = {
  value: string
  onChange: (v: string) => void
}

export function PostEditor({ value, onChange }: Props) {
  const editorRef = React.useRef<any>(null)
  const [ready, setReady] = React.useState(false)

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

  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}
      onChange={(_evt: any, editor: any) => {
        const data = editor.getData()
        onChange(data)
      }}
    />
  )
}
