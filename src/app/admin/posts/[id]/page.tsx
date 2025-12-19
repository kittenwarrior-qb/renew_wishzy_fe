"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { PostEditor } from "@/components/shared/post/PostEditor"
import { usePostDetail, useUpdatePost } from "@/components/shared/post/usePost"
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
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { MessageSquare, Heart, Clock as ClockIcon, Calendar as CalendarIcon, Eye as EyeIcon } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function Page() {
    const router = useRouter()
    const params = useParams<{ id: string }>()
    const id = params?.id
    const { setPrimaryAction } = useAdminHeaderStore()

    // Fetch data
    const { data: post, isLoading: loading, refetch } = usePostDetail(id)

    const [title, setTitle] = React.useState("")
    const [isActive, setIsActive] = React.useState(true)
    const [content, setContent] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [image, setImage] = React.useState("")
    const [categoryId, setCategoryId] = React.useState<string>("")
    const [categories, setCategories] = React.useState<any[]>([])

    // Load categories
    React.useEffect(() => {
        categoryBlogService.list({ limit: 100 }).then((res: any) => {
            const payload = res?.data ?? res
            setCategories(payload?.items || [])
        })
    }, [])

    // Sync state with fetching data
    React.useEffect(() => {
        if (post) {
            setTitle(post.title || "")
            setIsActive(post.isActive ?? true)
            setContent(post.content || "")
            setDescription(post.description || "")
            setImage(post.image || "")
            setCategoryId(post.categoryId || "")
        }
    }, [post])

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

    const { mutate: updatePost, isPending: updating } = useUpdatePost()

    const canSave = title.trim().length > 0 && content.trim().length > 0

    const handleSave = React.useCallback(() => {
        if (!canSave || updating || !id) return
        updatePost({
            id,
            title: title.trim(),
            content,
            description: description || undefined,
            image: image || undefined,
            isActive,
            categoryId: categoryId || undefined,
        }, {
            onSuccess: () => {
                notify({ title: "Đã cập nhật", variant: "success" })
                router.replace(`/admin/posts`)
            }
        })
    }, [canSave, updating, updatePost, id, title, content, description, image, isActive, categoryId, router])

    React.useEffect(() => {
        setPrimaryAction({
            label: updating ? "Đang lưu..." : "Lưu thay đổi",
            variant: "default",
            disabled: !canSave || updating,
            onClick: handleSave,
        })

        return () => setPrimaryAction(null)
    }, [setPrimaryAction, updating, canSave, handleSave])

    if (loading) return <LoadingOverlay show />

    return (
        <div className="relative">
            <div className="mb-4 flex items-center gap-4">
                <BackButton fallbackHref={`/admin/posts`} disabled={updating} />
                <div className="flex flex-col">
                    <h1 className="text-lg font-semibold">Chỉnh sửa bài viết</h1>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {post?.createdAt ? format(new Date(post.createdAt), "dd/MM/yyyy") : "--/--/----"}</span>
                        <span className="flex items-center gap-1"><ClockIcon className="h-3 w-3" /> {post?.createdAt ? format(new Date(post.createdAt), "HH:mm") : "--:--"}</span>
                        <span className="flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded-sm text-secondary-foreground font-medium"><EyeIcon className="h-3 w-3" /> {post?.views || 0} lượt xem</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-lg border bg-card p-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tiêu đề bài viết</label>
                            <Input
                                placeholder="Nhập tiêu đề..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mô tả ngắn</label>
                            <Textarea
                                placeholder="Nhập mô tả ngắn cho bài viết..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[100px] resize-none"
                            />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-4 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium">Nội dung bài viết</label>
                        </div>
                        <PostEditor value={content} onChange={setContent} />
                    </div>

                    {/* Comments Section */}
                    <div className="rounded-lg border bg-card p-4 space-y-4">
                        <div className="flex items-center gap-2 border-b pb-3">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            <h2 className="font-semibold text-base">Bình luận ({post?.comments?.length || 0})</h2>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {!post?.comments?.length ? (
                                <div className="text-center py-10 text-muted-foreground italic text-sm">
                                    Chưa có bình luận nào cho bài viết này.
                                </div>
                            ) : (
                                post.comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3 group">
                                        <Avatar className="h-8 w-8 border">
                                            <AvatarImage src={comment.user?.avatar} />
                                            <AvatarFallback className="text-[10px]">{comment.user?.fullName?.split(' ').pop()?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 bg-muted/30 hover:bg-muted/50 transition-colors p-3 rounded-2xl rounded-tl-none border border-transparent hover:border-border">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-semibold text-primary">{comment.user?.fullName || "Người dùng Wishzy"}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                                                    {format(new Date(comment.createdAt), "dd MMM yyyy", { locale: vi })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                                {comment.content}
                                            </p>
                                            <div className="mt-2 flex items-center gap-3">
                                                <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-red-500 transition-colors">
                                                    <Heart className="h-3 w-3" />
                                                    {comment.likes || 0}
                                                </button>
                                                <button className="text-[10px] text-muted-foreground hover:underline font-medium">Phản hồi</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-lg border bg-card p-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium uppercase text-muted-foreground text-[10px] tracking-wider">Cấu hình</label>

                            <div>
                                <div className="text-[13px] mb-1.5 ml-0.5">Trạng thái hiển thị</div>
                                <Select value={isActive ? "active" : "hidden"} onValueChange={(v) => setIsActive(v === "active")}>
                                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Công khai</SelectItem>
                                        <SelectItem value="hidden">Lưu nháp / Ẩn</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-2">
                                <div className="text-[13px] mb-1.5 ml-0.5">Danh mục</div>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger className="bg-background"><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c: any) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium uppercase text-muted-foreground text-[10px] tracking-wider">Ảnh đại diện</label>
                                {image && (
                                    <button
                                        type="button"
                                        className="text-[10px] text-destructive hover:underline"
                                        onClick={() => setImage("")}
                                    >
                                        Xóa ảnh
                                    </button>
                                )}
                            </div>

                            <div
                                className="relative aspect-video rounded-md border-2 border-dashed border-muted hover:border-primary/50 transition-colors cursor-pointer overflow-hidden group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {image ? (
                                    <img
                                        alt="preview"
                                        src={image}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-muted/30 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                                        <ImageIcon className="h-5 w-5" />
                                        <span>Tải ảnh lên</span>
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

                    <div className="rounded-lg border bg-card p-4 space-y-3">
                        <label className="text-sm font-medium uppercase text-muted-foreground text-[10px] tracking-wider">Xem trước thẻ</label>
                        <div className="rounded border bg-background overflow-hidden shadow-sm">
                            <div className="aspect-video bg-muted relative">
                                {image ? (
                                    <img src={image} className="h-full w-full object-cover" alt="" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground"><ImageIcon className="h-6 w-6 opacity-20" /></div>
                                )}
                            </div>
                            <div className="p-3 bg-white">
                                <div className="text-xs text-primary font-medium mb-1">
                                    {categories.find(c => c.id === categoryId)?.name || "Chưa phân loại"}
                                </div>
                                <div className="text-sm font-semibold line-clamp-2 leading-snug mb-2 min-h-[36px]">
                                    {title || "Tiêu đề bài viết bản xem trước"}
                                </div>
                                <div className="text-[11px] text-muted-foreground line-clamp-2 italic">
                                    {description || "Chưa có mô tả ngắn cho bài viết này."}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LoadingOverlay show={updating} />
        </div>
    )
}
