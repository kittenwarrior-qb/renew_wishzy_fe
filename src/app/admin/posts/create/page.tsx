"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { PostEditor } from "@/components/shared/post/PostEditor"
import { useCreatePost } from "@/components/shared/post/usePost"
import type { PostStatus } from "@/services/post"
import { useSeoScore } from "@/hooks/useSeoScore"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import { BackButton } from "@/components/shared/common/BackButton"
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore"
import { Image as ImageIcon } from "lucide-react"
import { uploadImage } from "@/services/uploads"
import UploadProgressOverlay from "@/components/shared/upload/UploadProgressOverlay"
import { notify } from "@/components/shared/admin/Notifications"

export default function Page() {
  const router = useRouter()
  const { setPrimaryAction } = useAdminHeaderStore()

  const [title, setTitle] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [status, setStatus] = React.useState<PostStatus>("draft")
  const [content, setContent] = React.useState("")
  const [excerpt, setExcerpt] = React.useState("")
  const [featuredImage, setFeaturedImage] = React.useState("")
  const [metaTitle, setMetaTitle] = React.useState("")
  const [metaDescription, setMetaDescription] = React.useState("")
  const [metaKeywords, setMetaKeywords] = React.useState<string>("")

  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const keywords = React.useMemo(() => metaKeywords.split(",").map(s => s.trim()).filter(Boolean), [metaKeywords])

  const { score, issues } = useSeoScore({ title, slug, content, excerpt, metaTitle, metaDescription, keywords })

  const tryUpload = React.useCallback(async (file: File) => {
    try {
      setUploading(true)
      setUploadProgress(0)
      const { url } = await uploadImage(file, "/uploads/image", {
        fieldName: "file",
        onProgress: (p) => setUploadProgress(p),
      })
      if (!url) throw new Error("Upload không trả về URL")
      setFeaturedImage(url)
      notify({ title: "Tải ảnh thành công", variant: "success" })
    } catch (e: any) {
      notify({ title: "Lỗi upload", description: String(e?.message || "Không thể tải ảnh"), variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }, [])

  React.useEffect(() => {
    if (!slug && title) {
      const s = title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
      setSlug(s)
    }
  }, [title])

  const { mutate: createPost, isPending: creating } = useCreatePost()

  const canSave = title.trim().length > 0 && slug.trim().length > 0

  const handleSave = React.useCallback(() => {
    if (!canSave || creating) return
    createPost({
      title: title.trim(),
      slug: slug.trim(),
      status,
      content,
      excerpt: excerpt || undefined,
      featuredImage: featuredImage || undefined,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      metaKeywords: keywords.length ? keywords : undefined,
    }, { onSuccess: () => router.replace(`/admin/posts`) })
  }, [canSave, creating, createPost, title, slug, status, content, excerpt, featuredImage, metaTitle, metaDescription, keywords, router])

  React.useEffect(() => {
    setPrimaryAction({
      label: creating ? "Đang lưu..." : "Xuất bản",
      variant: "default",
      disabled: !canSave || creating,
      onClick: handleSave,
    })

    return () => setPrimaryAction(null)
  }, [setPrimaryAction, creating, canSave, handleSave])

  return (
    <div className="relative">
      <div className="mb-4 flex items-center gap-4">
        <BackButton fallbackHref={`/admin/posts`} disabled={creating} />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">Viết bài</h1>
          <p className="text-xs text-muted-foreground">Soạn nội dung, tối ưu SEO và xem trước bài viết trước khi xuất bản.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card">
            <div className="p-4 space-y-3">
              <Input
                placeholder="Tiêu đề bài viết"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/{""}</span>
                <Input
                  placeholder="slug-bai-viet"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Nội dung</span>
                <span className="text-xs text-muted-foreground">Sử dụng editor để soạn nội dung chính</span>
              </div>
              <PostEditor value={content} onChange={setContent} />
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="p-4 space-y-2">
              <div className="text-sm font-medium">Tóm tắt</div>
              <Textarea
                placeholder="Tóm tắt (excerpt) — hiển thị ở danh sách bài viết và SEO"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">SEO</div>
                <div className="text-sm font-semibold">Điểm: {score}</div>
              </div>
              <Input
                placeholder="Meta title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
              />
              <Textarea
                placeholder="Meta description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="min-h-[80px]"
              />
              <Input
                placeholder="Keywords (phân cách bởi dấu phẩy)"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
              />
              <div className="text-xs text-muted-foreground grid gap-1">
                {issues.map(i => (
                  <div key={i.id} className={i.passed ? "text-green-600" : "text-red-600"}>• {i.label}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card">
            <div className="p-4 space-y-3">
              <div>
                <div className="text-sm font-medium mb-1">Trạng thái</div>
                <Select value={status} onValueChange={(v) => setStatus(v as PostStatus)}>
                  <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="published">Xuất bản</SelectItem>
                    <SelectItem value="archived">Lưu trữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-sm font-medium">Ảnh đại diện</div>
                  {featuredImage ? (
                    <button
                      type="button"
                      className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                      onClick={() => setFeaturedImage("")}
                    >
                      Xóa ảnh
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="group mt-2 relative w-full rounded-md border bg-background overflow-hidden cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {featuredImage ? (
                    <img
                      alt="preview"
                      src={featuredImage}
                      className="h-28 w-full object-cover"
                    />
                  ) : (
                    <div className="h-28 w-full bg-muted flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background/70">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                      <span>Hãy upload ảnh đại diện</span>
                    </div>
                  )}
                  {uploading ? (
                    <UploadProgressOverlay progress={uploadProgress} />
                  ) : null}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void tryUpload(f)
                  }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Preview</div>
                <span className="text-xs text-muted-foreground">Xem trước cách bài viết hiển thị</span>
              </div>
              <div className="rounded-md border bg-background overflow-hidden">
                {featuredImage ? (
                  <img
                    src={featuredImage}
                    alt={title || "Featured"}
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="h-32 w-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    Ảnh đại diện
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <div className="text-sm font-semibold line-clamp-2">
                    {title || "Tiêu đề bài viết"}
                  </div>
                  <div className="text-xs text-muted-foreground break-all">
                    /{slug || "slug-bai-viet"}
                  </div>
                  {excerpt ? (
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-3">
                      {excerpt}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoadingOverlay show={creating} />
    </div>
  )
}
