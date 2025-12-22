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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
                <div className="flex items-center gap-4">
                    <BackButton fallbackHref={`/admin/posts`} disabled={updating} className="h-10 w-10 rounded-xl bg-background shadow-sm border" />
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa bài viết</h1>
                        <div className="flex flex-wrap items-center gap-4 mt-1">
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                                <CalendarIcon className="h-3 w-3" />
                                {post?.createdAt ? format(new Date(post.createdAt), "dd/MM/yyyy", { locale: vi }) : "--/--/----"}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                                <ClockIcon className="h-3 w-3" />
                                {post?.createdAt ? format(new Date(post.createdAt), "HH:mm") : "--:--"}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/10">
                                <EyeIcon className="h-3.5 w-3.5" />
                                {post?.views || 0} lượt xem
                            </span>
                        </div>
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
                                    placeholder="Nhập tiêu đề..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="text-lg font-medium py-6 px-4 rounded-xl border-muted focus-visible:ring-primary/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Mô tả ngắn</label>
                                <Textarea
                                    placeholder="Nhập mô tả ngắn..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[120px] resize-none text-base p-4 rounded-xl border-muted focus-visible:ring-primary/20"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-card rounded-2xl border shadow-sm overflow-hidden min-h-[500px]">
                        <div className="px-6 py-4 border-b bg-muted/30 flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Nội dung bài viết</h2>
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">LIVE EDITOR</span>
                        </div>
                        <div className="p-1 sm:p-4 prose-none">
                            <PostEditor value={content} onChange={setContent} />
                        </div>
                    </section>

                    {/* Comments Section */}
                    <section className="bg-card rounded-2xl border shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-6 py-5 border-b bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="font-bold text-lg leading-tight">Bình luận</h2>
                                    <p className="text-[11px] text-muted-foreground font-medium tracking-wide">TỔNG CỘNG {post?.comments?.length || 0} ĐÓNG GÓP</p>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-border/50 max-h-[800px] overflow-y-auto custom-scrollbar bg-background/50">
                            {!post?.comments?.length ? (
                                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                    <div className="h-16 w-16 rounded-3xl bg-muted/50 flex items-center justify-center mb-4 rotate-12">
                                        <MessageSquare className="h-8 w-8 text-muted-foreground/20" />
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium">Chưa có bình luận nào cho bài viết này.</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">Mọi góp ý từ độc giả sẽ hiển thị tại đây.</p>
                                </div>
                            ) : (
                                post.comments.map((comment) => (
                                    <div key={comment.id} className="p-6 hover:bg-muted/10 transition-colors group relative">
                                        <div className="flex gap-4">
                                            <Avatar className="h-11 w-11 border-2 border-background shadow-md">
                                                <AvatarImage src={comment.user?.avatar} />
                                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                    {comment.user?.fullName?.split(' ').pop()?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                        <span className="text-[15px] font-bold text-foreground leading-none">{comment.user?.fullName || "Người dùng Wishzy"}</span>
                                                        <span className="hidden sm:block h-1 w-1 rounded-full bg-muted-foreground/30" />
                                                        <span className="text-[10px] text-muted-foreground font-medium">
                                                            {format(new Date(comment.createdAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all shadow-sm bg-background border border-transparent hover:border-destructive/20"
                                                            onClick={() => setHidingComment({ id: comment.id })}
                                                            title="Ẩn bình luận"
                                                        >
                                                            <EyeOff className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-foreground/80 leading-relaxed bg-muted/30 rounded-2xl p-4 mt-1 border border-border/20 shadow-inner">
                                                    {comment.content}
                                                </div>
                                                <div className="mt-3 flex items-center gap-5">
                                                    <button className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground hover:text-red-500 transition-all bg-muted/40 px-2 py-1 rounded-lg">
                                                        <Heart className="h-3.5 w-3.5" />
                                                        <span>{comment.likes || 0}</span>
                                                    </button>
                                                    <button
                                                        className={cn(
                                                            "flex items-center gap-1.5 text-[11px] font-bold transition-all px-2 py-1 rounded-lg shadow-sm border border-transparent",
                                                            replyingTo === comment.id
                                                                ? "text-primary bg-primary/10 border-primary/20 shadow-inner"
                                                                : "text-muted-foreground hover:text-primary bg-muted/40 hover:bg-primary/5"
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
                                                    <div className="mt-5 flex gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
                                                        <Avatar className="h-9 w-9 border-2 shadow-sm shrink-0 mt-1">
                                                            <AvatarFallback className="text-[10px] font-bold bg-muted">AD</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 relative">
                                                            <Textarea
                                                                placeholder="Nhập nội dung phản hồi chuyên nghiệp..."
                                                                value={replyContent}
                                                                onChange={(e) => setReplyContent(e.target.value)}
                                                                className="text-sm min-h-[100px] pr-12 bg-background shadow-md border-primary/20 focus-visible:ring-primary/20 rounded-2xl p-4"
                                                                autoFocus
                                                            />
                                                            <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-9 w-9 rounded-xl hover:bg-destructive/5 hover:text-destructive"
                                                                    onClick={() => setReplyingTo(null)}
                                                                >
                                                                    <X className="h-5 w-5" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    disabled={!replyContent.trim() || isReplying}
                                                                    className="h-9 w-9 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                                                                    onClick={() => handleReply(comment.id)}
                                                                >
                                                                    {isReplying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Nested Replies */}
                                                {comment.replies && comment.replies.length > 0 && (
                                                    <div className="mt-6 space-y-6 pl-6 border-l-2 border-primary/10">
                                                        {comment.replies.map((reply) => (
                                                            <div key={reply.id} className="flex gap-3 group/reply animate-in fade-in slide-in-from-left-2 duration-300">
                                                                <Avatar className="h-8 w-8 border-2 border-background shadow-sm shrink-0">
                                                                    <AvatarImage src={reply.user?.avatar} />
                                                                    <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                                                                        {reply.user?.fullName?.split(' ').pop()?.charAt(0) || 'U'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[13px] font-bold text-foreground leading-none">{reply.user?.fullName || "Người dùng Wishzy"}</span>
                                                                            <span className="text-[9px] font-semibold text-muted-foreground uppercase opacity-60">
                                                                                {format(new Date(reply.createdAt), "dd/MM HH:mm", { locale: vi })}
                                                                            </span>
                                                                        </div>
                                                                        <button
                                                                            className="p-1.5 opacity-0 group-hover/reply:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all"
                                                                            onClick={() => setHidingComment({ id: reply.id })}
                                                                        >
                                                                            <EyeOff className="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                    <div className="text-[13px] text-foreground/80 bg-primary/5 rounded-2xl p-3 border border-primary/10 shadow-sm">
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
                                        <Label htmlFor="post-status-edit" className="text-sm font-bold cursor-pointer">
                                            {isActive ? "Công khai" : "Lưu nháp / Ẩn"}
                                        </Label>
                                        <span className="text-[10px] text-muted-foreground leading-tight">
                                            {isActive ? "Hiển thị với tất cả người dùng" : "Chỉ bạn mới có thể xem bài viết"}
                                        </span>
                                    </div>
                                    <Switch
                                        id="post-status-edit"
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
                                            <span className="text-sm font-bold truncate leading-none mb-1">{post?.author?.fullName || "N/A"}</span>
                                            <span className="text-[10px] text-muted-foreground truncate italic">Tác giả bài viết</span>
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
                                        <span className="bg-primary/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase font-bold uppercase tracking-widest">PREVIEW</span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-2 px-2 py-0.5 bg-primary/5 w-fit rounded leading-tight">
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
