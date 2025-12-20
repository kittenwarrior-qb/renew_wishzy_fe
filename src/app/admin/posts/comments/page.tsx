"use client"

import * as React from "react"
import { useCommentBlogListAll, useDeleteCommentBlog, useCreateCommentBlog } from "@/components/shared/blog/useCommentBlog"
import { usePostDetail } from "@/components/shared/post/usePost"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  Trash2,
  User as UserIcon,
  Calendar,
  Clock,
  Eye,
  ExternalLink,
  MessageCircle,
  X,
  CornerDownRight as Reply,
  Send
} from "lucide-react"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { notify } from "@/components/shared/admin/Notifications"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Page() {
  const [page, setPage] = React.useState(1)
  const { data, isPending, isFetching, refetch } = useCommentBlogListAll({
    page,
    limit: 15,
  })

  const [selectedPostId, setSelectedPostId] = React.useState<string | null>(null)
  const [deletingCommentId, setDeletingCommentId] = React.useState<string | null>(null)

  const { data: selectedPost, isLoading: loadingPost, refetch: refetchPost } = usePostDetail(selectedPostId || undefined)
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteCommentBlog("")
  const { mutate: createReply, isPending: isCreatingReply } = useCreateCommentBlog()

  const [replyingToId, setReplyingToId] = React.useState<string | null>(null)
  const [replyContent, setReplyContent] = React.useState("")

  const comments = data?.items || []

  const handleDelete = () => {
    if (!deletingCommentId) return
    deleteComment(deletingCommentId, {
      onSuccess: () => {
        setDeletingCommentId(null)
        notify({ title: "Đã xoá bình luận", variant: "success" })
        refetch()
        if (selectedPostId) refetchPost()
      }
    })
  }

  const handleReply = (parentId: string) => {
    if (!replyContent.trim() || !selectedPostId) return

    createReply({
      content: replyContent,
      blogId: selectedPostId,
      parentId
    }, {
      onSuccess: () => {
        setReplyContent("")
        setReplyingToId(null)
        notify({ title: "Đã gửi phản hồi", variant: "success" })
        refetchPost()
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Nhật ký Bình luận</h1>
          <p className="text-slate-500 text-sm font-medium">Theo dõi và quản lý tất cả các tương tác từ người dùng trên toàn hệ thống.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold shadow-sm">
            Tổng cộng {data?.pagination?.totalItems || 0}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <LoadingOverlay show={isPending || isFetching} />

        {comments.length === 0 && !isPending ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4">
              <MessageSquare className="h-10 w-10 text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold italic">Chưa có bình luận nào để quản lý.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Nội dung bình luận</th>
                  <th className="px-6 py-4">Bài viết</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {comments.map((comment: any) => (
                  <tr key={comment.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                          <AvatarImage src={comment.user?.avatar} />
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold leading-none">
                            {comment.user?.fullName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                            {comment.user?.fullName || "Người dùng"}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="h-3 w-3" />
                            {format(new Date(comment.createdAt), "HH:mm dd/MM/yy", { locale: vi })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="max-w-md">
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
                          {comment.content}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <button
                        onClick={() => setSelectedPostId(comment.blogId)}
                        className="flex items-center gap-2 text-primary hover:underline group/post max-w-[200px]"
                      >
                        <span className="text-sm font-bold truncate">{comment.blog?.title || "Xem chi tiết"}</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover/post:opacity-100 transition-opacity" />
                      </button>
                    </td>
                    <td className="px-6 py-5 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                          onClick={() => setSelectedPostId(comment.blogId)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all"
                          onClick={() => setDeletingCommentId(comment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination?.totalPage > 1 && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="font-bold rounded-xl"
            >
              Trước
            </Button>
            <div className="flex items-center gap-1.5 px-4 font-black text-xs text-slate-400">
              Trang {page} / {data.pagination.totalPage}
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={page === data.pagination.totalPage}
              onClick={() => setPage(p => p + 1)}
              className="font-bold rounded-xl"
            >
              Tiếp
            </Button>
          </div>
        )}
      </div>

      <Dialog open={!!selectedPostId} onOpenChange={(open) => !open && setSelectedPostId(null)}>
        <DialogContent className="sm:max-w-[85vw] sm:w-full h-[90vh] p-0 overflow-hidden border-none rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-none bg-white dark:bg-slate-900 transition-all flex flex-col">
          <DialogTitle className="sr-only">Chi tiết bài viết & Bình luận</DialogTitle>
          <DialogDescription className="sr-only">Hiển thị nội dung chi tiết bài viết và danh sách bình luận liên quan</DialogDescription>

          <LoadingOverlay show={loadingPost} />
          {selectedPost && (
            <div className="flex flex-row h-full overflow-hidden">
              {/* Left Column: Post Content (65%) */}
              <div className="flex-[2] flex flex-col min-h-0 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <ScrollArea className="flex-1">
                  {/* Post Cover Image */}
                  <div className="relative h-64 md:h-80 shrink-0 group overflow-hidden">
                    {selectedPost.image ? (
                      <img
                        src={selectedPost.image}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt=""
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                        <MessageCircle className="h-16 w-16 text-slate-200 dark:text-slate-700" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-10 left-12 right-12">
                      <Badge className="mb-4 bg-primary text-white border-none font-bold text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-lg">
                        {selectedPost.category?.name || "Chưa phân loại"}
                      </Badge>
                      <h2 className="text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-sm line-clamp-2">
                        {selectedPost.title}
                      </h2>
                    </div>
                  </div>

                  {/* Post Stats/Metadata */}
                  <div className="px-12 py-8 grid grid-cols-3 gap-8 border-b border-slate-50 dark:border-slate-800/50">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-black">Ngày đăng</span>
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {format(new Date(selectedPost.createdAt), "dd/MM/yyyy", { locale: vi })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-blue-500/5 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-black">Tác giả</span>
                        <span className="text-base font-black text-slate-900 dark:text-white truncate max-w-[150px]">
                          {selectedPost.author?.fullName || "Wishzy Team"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center">
                        <Eye className="h-6 w-6 text-emerald-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-black">Lượt xem</span>
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {selectedPost.viewCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-12 py-10">
                    {selectedPost.description && (
                      <div className="relative mb-12 pl-8 border-l-4 border-primary/20">
                        <p className="text-2xl text-slate-500 italic font-medium leading-relaxed">
                          {selectedPost.description}
                        </p>
                      </div>
                    )}
                    <div
                      className="prose prose-lg prose-slate dark:prose-invert max-w-none 
                        prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-p:font-medium
                        prose-headings:font-black prose-headings:text-slate-900 dark:prose-headings:text-white
                        prose-img:rounded-[2.5rem] prose-img:shadow-2xl prose-img:border-8 prose-img:border-slate-50 dark:prose-img:border-slate-800 pb-20"
                      dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                    />
                  </div>
                </ScrollArea>
              </div>

              {/* Right Column: Comments (40%) */}
              <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden">
                {/* Header for comments */}
                <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">Bình luận</h3>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-black">
                        {selectedPost.comments?.length || 0} phản hồi
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPostId(null)}
                    className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-all group/close"
                  >
                    <X className="h-5 w-5 group-hover/close:rotate-90 transition-transform" />
                  </button>
                </div>

                <ScrollArea className="flex-1 px-8 py-4">
                  {(!selectedPost.comments || selectedPost.comments.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                      <MessageCircle className="h-12 w-12 mb-4 text-slate-300" />
                      <p className="text-sm font-bold italic text-slate-400">Chưa có bình luận nào</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {selectedPost.comments.map((comment: any) => (
                        <div key={comment.id} className="group relative flex flex-col gap-4 p-6 rounded-[2rem] bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                                <AvatarImage src={comment.user?.avatar} />
                                <AvatarFallback className="text-xs font-black">{comment.user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                  {comment.user?.fullName || "Người dùng"}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                  {format(new Date(comment.createdAt), "HH:mm | dd/MM/yy", { locale: vi })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 rounded-lg text-primary font-black text-[10px] uppercase tracking-wider hover:bg-primary/5"
                                onClick={() => {
                                  if (replyingToId === comment.id) {
                                    setReplyingToId(null)
                                  } else {
                                    setReplyingToId(comment.id)
                                    setReplyContent("")
                                  }
                                }}
                              >
                                <Reply className="mr-1.5 h-3 w-3" />
                                Phản hồi
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-slate-300 hover:text-destructive hover:bg-destructive/5 transition-all"
                                onClick={() => {
                                  setDeletingCommentId(comment.id)
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                            {comment.content}
                          </div>

                          {/* Nested Replies Rendering (if any) */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-2 space-y-4 pl-8 border-l-2 border-slate-100 dark:border-slate-800">
                              {comment.replies.map((reply: any) => (
                                <div key={reply.id} className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={reply.user?.avatar} />
                                      <AvatarFallback className="text-[8px]">{reply.user?.fullName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-[10px] font-black text-slate-900 dark:text-white">{reply.user?.fullName}</span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">
                                      {format(new Date(reply.createdAt), "HH:mm | dd/MM/yy", { locale: vi })}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-900/30 p-2.5 rounded-xl">
                                    {reply.content}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Form */}
                          {replyingToId === comment.id && (
                            <div className="mt-4 flex flex-col gap-3 p-4 rounded-2xl bg-primary/[0.03] border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
                              <textarea
                                autoFocus
                                className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-600 dark:text-slate-300 placeholder:text-slate-300 resize-none min-h-[60px]"
                                placeholder="Viết phản hồi của bạn..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    handleReply(comment.id)
                                  }
                                }}
                              />
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 rounded-lg text-slate-400 font-bold text-[10px] uppercase tracking-tight"
                                  onClick={() => setReplyingToId(null)}
                                >
                                  Huỷ bỏ
                                </Button>
                                <Button
                                  size="sm"
                                  disabled={!replyContent.trim() || isCreatingReply}
                                  className="h-8 rounded-lg px-4 font-black shadow-lg shadow-primary/10 text-[10px] uppercase tracking-wider"
                                  onClick={() => handleReply(comment.id)}
                                >
                                  {isCreatingReply ? "Đang gửi..." : (
                                    <>
                                      Gửi phản hồi
                                      <Send className="ml-1.5 h-3 w-3" />
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <div className="p-10 shrink-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    onClick={() => setSelectedPostId(null)}
                    className="w-full rounded-2xl h-16 font-black shadow-xl shadow-primary/10 hover:shadow-primary/20 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs"
                  >
                    Đóng chi tiết
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deletingCommentId}
        onOpenChange={(open) => !open && setDeletingCommentId(null)}
        title="Xoá bình luận"
        description="Bạn có chắc chắn muốn xoá vĩnh viễn bình luận này? Hành động này không thể hoàn tác."
        confirmText={isDeleting ? "Đang xoá..." : "Xoá vĩnh viễn"}
        confirmVariant="destructive"
        loading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
