"use client"

import { cn } from "@/lib/utils"

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
import { MessageSquare, Heart, Clock as ClockIcon, Calendar as CalendarIcon, Eye as EyeIcon, User } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Switch from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useDeleteCommentBlog, useCreateCommentBlog } from "@/components/shared/blog/useCommentBlog"
import { EyeOff, Reply, Send, X, Loader2 } from "lucide-react"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"

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

    // Comment management states
    const [replyingTo, setReplyingTo] = React.useState<string | null>(null)
    const [replyContent, setReplyContent] = React.useState("")
    const [hidingComment, setHidingComment] = React.useState<{ id: string } | null>(null)

    const { mutate: deleteComment, isPending: isHidingComment } = useDeleteCommentBlog(id as string)
    const { mutate: createReply, isPending: isReplying } = useCreateCommentBlog()

    const handleReply = (parentId: string) => {
        if (!replyContent.trim() || isReplying) return
        createReply({
            blogId: id as string,
            content: replyContent.trim(),
            parentId
        }, {
            onSuccess: () => {
                setReplyingTo(null)
                setReplyContent("")
                notify({ title: "Đã gửi phản hồi", variant: "success" })
                refetch()
            }
        })
    }

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
            label: updating ? "Đang cập nhật..." : "Cập nhật bài viết",
            variant: "default",
            disabled: !canSave || updating,
            onClick: handleSave,
        })

        return () => setPrimaryAction(null)
    }, [setPrimaryAction, updating, canSave, handleSave])

    if (loading) return <LoadingOverlay show />

    return (
        <div className="relative px-4">
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
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Tiêu đề bài viết</label>
                            <Input
                                placeholder="Nhập tiêu đề..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Mô tả ngắn</label>
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
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Nội dung bài viết</label>
                        </div>
                        <PostEditor value={content} onChange={setContent} />
                    </div>

                    {/* Comments Section */}
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-base leading-none">Bình luận</h2>
                                    <p className="text-[11px] text-muted-foreground mt-1">Tổng cộng {post?.comments?.length || 0} đóng góp từ cộng đồng</p>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-border/50 max-h-[700px] overflow-y-auto custom-scrollbar">
                            {!post?.comments?.length ? (
                                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                                        <MessageSquare className="h-6 w-6 text-muted-foreground/30" />
                                    </div>
                                    <p className="text-sm text-muted-foreground italic">Chưa có bình luận nào cho bài viết này.</p>
                                </div>
                            ) : (
                                post.comments.map((comment) => (
                                    <div key={comment.id} className="p-5 hover:bg-muted/5 transition-colors group">
                                        <div className="flex gap-4">
                                            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                                <AvatarImage src={comment.user?.avatar} />
                                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                    {comment.user?.fullName?.split(' ').pop()?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-foreground truncate">{comment.user?.fullName || "Người dùng Wishzy"}</span>
                                                        <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                            {format(new Date(comment.createdAt), "dd MMM yyyy 'lúc' HH:mm", { locale: vi })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                                            onClick={() => setHidingComment({ id: comment.id })}
                                                            title="Ẩn bình luận"
                                                        >
                                                            <EyeOff className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-3 mt-1 border border-border/20">
                                                    {comment.content}
                                                </div>
                                                <div className="mt-2.5 flex items-center gap-4">
                                                    <button className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-red-500 transition-all">
                                                        <Heart className="h-3.5 w-3.5" />
                                                        <span>{comment.likes || 0}</span>
                                                    </button>
                                                    <button
                                                        className={cn(
                                                            "flex items-center gap-1.5 text-[11px] font-semibold transition-all",
                                                            replyingTo === comment.id ? "text-primary" : "text-muted-foreground hover:text-primary"
                                                        )}
                                                        onClick={() => {
                                                            if (replyingTo === comment.id) {
                                                                setReplyingTo(null)
                                                                setReplyContent("")
                                                            } else {
                                                                setReplyingTo(comment.id)
                                                                setReplyContent("")
                                                            }
                                                        }}
                                                    >
                                                        <Reply className="h-3.5 w-3.5" />
                                                        Phản hồi
                                                    </button>
                                                </div>

                                                {/* Inline Reply Form */}
                                                {replyingTo === comment.id && (
                                                    <div className="mt-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <Avatar className="h-8 w-8 border">
                                                            <AvatarFallback className="text-[10px]">AD</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 relative">
                                                            <Textarea
                                                                placeholder="Nhập nội dung phản hồi..."
                                                                value={replyContent}
                                                                onChange={(e) => setReplyContent(e.target.value)}
                                                                className="text-sm min-h-[80px] pr-12 bg-background shadow-sm"
                                                                autoFocus
                                                            />
                                                            <div className="absolute bottom-2 right-2 flex items-center gap-2">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 rounded-full"
                                                                    onClick={() => setReplyingTo(null)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    disabled={!replyContent.trim() || isReplying}
                                                                    className="h-8 w-8 rounded-full"
                                                                    onClick={() => handleReply(comment.id)}
                                                                >
                                                                    {isReplying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Nested Replies */}
                                                {comment.replies && comment.replies.length > 0 && (
                                                    <div className="mt-4 space-y-4 pl-4 border-l-2 border-muted/50">
                                                        {comment.replies.map((reply) => (
                                                            <div key={reply.id} className="flex gap-3 group/reply">
                                                                <Avatar className="h-8 w-8 border">
                                                                    <AvatarImage src={reply.user?.avatar} />
                                                                    <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                                                                        {reply.user?.fullName?.split(' ').pop()?.charAt(0) || 'U'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between mb-0.5">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[13px] font-bold text-foreground">{reply.user?.fullName || "Người dùng Wishzy"}</span>
                                                                            <span className="text-[10px] text-muted-foreground">
                                                                                {format(new Date(reply.createdAt), "dd MMM HH:mm", { locale: vi })}
                                                                            </span>
                                                                        </div>
                                                                        <button
                                                                            className="p-1 opacity-0 group-hover/reply:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                                                                            onClick={() => setHidingComment({ id: reply.id })}
                                                                        >
                                                                            <EyeOff className="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                    <div className="text-[13px] text-muted-foreground bg-muted/20 rounded-lg p-2.5 border border-border/10">
                                                                        {reply.content}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
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
                                <div className="text-[13px] mb-2 ml-0.5">Trạng thái bài viết</div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40 shadow-sm">
                                    <div className="flex flex-col gap-0.5">
                                        <Label htmlFor="post-status-edit" className="text-sm font-bold cursor-pointer">
                                            {isActive ? "Công khai" : "Lưu nháp / Ẩn"}
                                        </Label>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {isActive ? "Mọi người đều có thể xem bài viết này" : "Chỉ bạn mới có thể xem bài viết"}
                                        </span>
                                    </div>
                                    <Switch
                                        id="post-status-edit"
                                        checked={isActive}
                                        onCheckedChange={setIsActive}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="text-[13px] mb-1.5 ml-0.5">Người đăng</div>
                                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/40 shadow-sm">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[13px] font-bold truncate leading-tight">{post?.author?.fullName || "N/A"}</span>
                                        <span className="text-[10px] text-muted-foreground truncate">{post?.author?.email || "No email"}</span>
                                    </div>
                                </div>
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

            <ConfirmDialog
                open={!!hidingComment}
                onOpenChange={(open) => !open && setHidingComment(null)}
                title="Ẩn bình luận"
                description="Bạn có chắc chắn muốn ẩn bình luận này? Hành động này sẽ xoá bình luận khỏi bài viết."
                confirmText={isHidingComment ? "Đang ẩn..." : "Ẩn bình luận"}
                confirmVariant="destructive"
                loading={isHidingComment}
                onConfirm={() => {
                    if (!hidingComment) return
                    deleteComment(hidingComment.id, {
                        onSuccess: () => {
                            setHidingComment(null)
                            notify({ title: "Đã ẩn bình luận", variant: "success" })
                            refetch()
                        }
                    })
                }}
            />
        </div>
    )
}
