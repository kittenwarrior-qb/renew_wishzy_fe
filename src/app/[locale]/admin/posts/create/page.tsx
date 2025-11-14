"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { PostEditor } from "@/components/shared/post/PostEditor"
import { useCreatePost } from "@/components/shared/post/usePost"
import type { PostStatus } from "@/services/post"
import { useSeoScore } from "@/hooks/useSeoScore"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"

export default function Page() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"
  const router = useRouter()

  const [title, setTitle] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [status, setStatus] = React.useState<PostStatus>("draft")
  const [content, setContent] = React.useState("")
  const [excerpt, setExcerpt] = React.useState("")
  const [featuredImage, setFeaturedImage] = React.useState("")
  const [metaTitle, setMetaTitle] = React.useState("")
  const [metaDescription, setMetaDescription] = React.useState("")
  const [metaKeywords, setMetaKeywords] = React.useState<string>("")

  const keywords = React.useMemo(() => metaKeywords.split(",").map(s => s.trim()).filter(Boolean), [metaKeywords])

  const { score, issues } = useSeoScore({ title, slug, content, excerpt, metaTitle, metaDescription, keywords })

  React.useEffect(() => {
    if (!slug && title) {
      const s = title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
      setSlug(s)
    }
  }, [title])

  const { mutate: createPost, isPending: creating } = useCreatePost()

  const canSave = title.trim().length > 0 && slug.trim().length > 0

  return (
    <div className="relative p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Viết bài</h1>
        <div className="inline-flex gap-2">
          <Button variant="outline" onClick={() => router.back()} disabled={creating}>Hủy</Button>
          <Button onClick={() => {
            if (!canSave) return
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
            }, { onSuccess: () => router.replace(`/${locale}/admin/posts`) })
          }} disabled={!canSave || creating}>
            {creating ? "Đang lưu..." : "Xuất bản"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Input placeholder="Tiêu đề bài viết" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">/{""}</span>
            <Input placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <PostEditor value={content} onChange={setContent} />
          <Textarea placeholder="Tóm tắt (excerpt)" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="min-h-[120px]" />
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border">
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
                <div className="text-sm font-medium mb-1">Ảnh đại diện</div>
                <Input placeholder="URL ảnh" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} />
                {featuredImage ? <img alt="preview" src={featuredImage} className="mt-2 h-28 w-full object-cover rounded" /> : null}
              </div>
            </div>
          </div>

          <div className="rounded-lg border">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">SEO</div>
                <div className="text-sm font-semibold">Điểm: {score}</div>
              </div>
              <Input placeholder="Meta title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
              <Textarea placeholder="Meta description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="min-h-[80px]" />
              <Input placeholder="Keywords (phân cách bởi dấu phẩy)" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} />
              <div className="text-xs text-muted-foreground grid gap-1">
                {issues.map(i => (
                  <div key={i.id} className={i.passed ? "text-green-600" : "text-red-600"}>• {i.label}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoadingOverlay show={creating} />
    </div>
  )
}
