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
import { categoryBlogService } from "@/services/category-blog"
import { useAppStore } from "@/stores/useAppStore"
import { User } from "lucide-react"
import Switch from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function Page() {
  const router = useRouter()
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const isDuplicate = searchParams?.get("duplicate") === "true"
  const { setPrimaryAction } = useAdminHeaderStore()
  const currentUser = useAppStore((state) => state.user)

  const [title, setTitle] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)
  const [content, setContent] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [image, setImage] = React.useState("")
  const [categoryId, setCategoryId] = React.useState<string>("")
  const [categories, setCategories] = React.useState<any[]>([])

  React.useEffect(() => {
    categoryBlogService.list({ limit: 100 }).then((res: any) => {
      const payload = res?.data ?? res
      setCategories(payload?.items || [])
    })

    // Load duplication data if present
    if (isDuplicate) {
      try {
        const raw = sessionStorage.getItem("wishzy_duplicate_post")
        if (raw) {
          const data = JSON.parse(raw)
          if (data.title) setTitle(data.title)
          if (data.content) setContent(data.content)
          if (data.description) setDescription(data.description)
          if (data.image) setImage(data.image)
          if (data.categoryId) setCategoryId(data.categoryId)
          if (data.isActive !== undefined) setIsActive(data.isActive)
          // Clear it after consume
          sessionStorage.removeItem("wishzy_duplicate_post")
        }
      } catch (e) {
        console.error("Failed to parse duplication data", e)
      }
    }
  }, [isDuplicate])

  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const tryUpload = React.useCallback(async (file: File) => {
    try {
      setUploading(true)
      setUploadProgress(0)
      const { url } = await uploadImage(file, "/uploads/image", {
        fieldName: "file",
        onProgress: (p) => setUploadProgress(p),
      })
      if (!url) throw new Error("Upload không trả về URL")
      setImage(url)
      notify({ title: "Tải ảnh thành công", variant: "success" })
    } catch (e: any) {
      notify({ title: "Lỗi upload", description: String(e?.message || "Không thể tải ảnh"), variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }, [])

  const { mutate: createPost, isPending: creating } = useCreatePost()

  const canSave = title.trim().length > 0 && content.trim().length > 0

  const handleSave = React.useCallback(() => {
    if (!canSave || creating) return
    createPost({
      title: title.trim(),
      content,
      description: description || undefined,
      image: image || undefined,
      isActive,
      categoryId: categoryId || undefined,
    }, { onSuccess: () => router.replace(`/admin/posts`) })
  }, [canSave, creating, createPost, title, content, description, image, isActive, categoryId, router])

  React.useEffect(() => {
    setPrimaryAction({
      label: creating ? "Đang tạo..." : "Tạo bài viết",
      variant: "default",
      disabled: !canSave || creating,
      onClick: handleSave,
    })

    return () => setPrimaryAction(null)
  }, [setPrimaryAction, creating, canSave, handleSave])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton fallbackHref={`/admin/posts`} disabled={creating} className="h-10 w-10 rounded-xl bg-background shadow-sm border" />
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Viết bài mới</h1>
            <p className="text-sm text-muted-foreground">Soạn thảo nội dung và cấu hình bài viết blog của bạn.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Content Area */}
        <div className="w-full lg:flex-1 space-y-8">
          <section className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/30">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Nội dung cơ bản</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Tiêu đề bài viết</label>
                <Input
                  placeholder="Nhập tiêu đề thu hút người đọc..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-medium py-6 px-4 rounded-xl border-muted focus-visible:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Mô tả ngắn</label>
                <Textarea
                  placeholder="Một đoạn giới thiệu ngắn để khuyến khích người dùng nhấn xem..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px] resize-none text-base p-4 rounded-xl border-muted focus-visible:ring-primary/20"
                />
              </div>
            </div>
          </section>

          <section className="bg-card rounded-2xl border shadow-sm overflow-hidden min-h-[500px]">
            <div className="px-6 py-4 border-b bg-muted/30 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Soạn thảo bài viết</h2>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">LIVE EDITOR</span>
            </div>
            <div className="p-1 sm:p-4 prose-none">
              <PostEditor value={content} onChange={setContent} />
            </div>
          </section>
        </div>

        {/* Sticky Sidebar */}
        <aside className="w-full lg:w-96 lg:sticky lg:top-24 space-y-8 pb-10">
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/30">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Cấu hình bài viết</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="post-status" className="text-sm font-bold cursor-pointer">
                      {isActive ? "Công khai" : "Lưu nháp / Ẩn"}
                    </Label>
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {isActive ? "Hiển thị với tất cả người dùng" : "Chỉ bạn mới có thể xem bài viết"}
                    </span>
                  </div>
                  <Switch
                    id="post-status"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-semibold ml-1">Người đăng</label>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/50">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold truncate leading-none mb-1">{currentUser?.fullName || "N/A"}</span>
                      <span className="text-[10px] text-muted-foreground truncate italic">Quản trị viên</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-semibold ml-1">Danh mục</label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="h-11 rounded-xl bg-background border-muted">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {categories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id} className="rounded-lg">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-semibold ml-1">Ảnh đại diện</label>
                  {image && (
                    <button
                      type="button"
                      className="text-[11px] text-destructive hover:underline font-medium"
                      onClick={() => setImage("")}
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>

                <div
                  className="relative aspect-video rounded-2xl border-2 border-dashed border-muted hover:border-primary/50 transition-all cursor-pointer overflow-hidden group bg-muted/10 hover:bg-muted/20"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {image ? (
                    <img
                      alt="preview"
                      src={image}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-medium tracking-wide">TẢI ẢNH LÊN</span>
                    </div>
                  )}
                  {uploading && <UploadProgressOverlay progress={uploadProgress} />}
                </div>
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

          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/30">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Xem trước thẻ</h2>
            </div>
            <div className="p-6">
              <div className="rounded-xl border bg-background overflow-hidden shadow-md group transition-all hover:shadow-lg">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {image ? (
                    <img src={image} className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-700" alt="" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground"><ImageIcon className="h-8 w-8 opacity-10" /></div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="bg-primary/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">PREVIEW</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-2 px-2 py-0.5 bg-primary/5 w-fit rounded">
                    {categories.find(c => c.id === categoryId)?.name || "Chưa phân loại"}
                  </div>
                  <h3 className="text-base font-bold line-clamp-2 leading-tight mb-2 min-h-[40px] text-foreground">
                    {title || "Tiêu đề bài viết bản xem trước"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed italic">
                    {description || "Chưa có mô tả ngắn cho bài viết này."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
