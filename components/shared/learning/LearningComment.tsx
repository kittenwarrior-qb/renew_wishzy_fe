import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Trash2, ThumbsUp, ThumbsDown } from "lucide-react"
import { useQueryHook } from "@/src/hooks/useQueryHook"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAppStore } from "@/src/stores/useAppStore"
import { toast } from "sonner"
import api from "@/src/services/api"

interface Comment {
  id: string
  userId: string
  courseId: string
  content: string
  rating: number
  like: number
  dislike: number
  createdAt: string
  user?: {
    id: string
    fullName: string
    avatar?: string
  }
  isLiked?: boolean
  isDisliked?: boolean
}

interface LearningCommentProps {
  courseId: string
  isEnrolled: boolean
}

export function LearningComment({ courseId, isEnrolled }: LearningCommentProps) {
  const [newComment, setNewComment] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const queryClient = useQueryClient()
  const { user } = useAppStore()

  // Fetch comments (without rating filter)
  const { data: commentsData, isLoading } = useQueryHook<{
    items: Comment[]
    pagination: {
      totalItems: number
      currentPage: number
      itemsPerPage: number
      totalPage: number
    }
  }>(
    ['learning-comments', courseId, page.toString()],
    async () => {
      const res = await api.get(`/feedbacks/course/${courseId}`, {
        params: { page, limit, type: 'comment' }
      })
      return res.data?.data || res.data || { items: [], pagination: { totalItems: 0, currentPage: 1, itemsPerPage: 10, totalPage: 0 } }
    }
  )

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) throw new Error("User not authenticated")
      const res = await api.post('/feedbacks', {
        courseId,
        content,
        rating: 0 // 0 = comment, not feedback
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-comments', courseId] })
      setNewComment("")
      toast.success("Bình luận của bạn đã được gửi!")
    },
    onError: (error: any) => {
      toast.error(error?.message === "User not authenticated" 
        ? "Bạn cần đăng nhập để bình luận"
        : "Có lỗi xảy ra. Vui lòng thử lại!")
    }
  })

  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.patch(`/feedbacks/${commentId}/like`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learning-comments', courseId] }),
    onError: () => toast.error("Có lỗi xảy ra!")
  })

  const dislikeCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.patch(`/feedbacks/${commentId}/dislike`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learning-comments', courseId] }),
    onError: () => toast.error("Có lỗi xảy ra!")
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.delete(`/feedbacks/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-comments', courseId] })
      toast.success("Đã xóa bình luận!")
    },
    onError: () => toast.error("Có lỗi xảy ra!")
  })

  const displayComments = commentsData?.items || []

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSubmit = () => {
    if (!newComment.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận")
      return
    }
    if (!user?.id) {
      toast.error("Bạn cần đăng nhập để bình luận")
      return
    }
    createCommentMutation.mutate(newComment)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Write Comment Section */}
      {isEnrolled && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              Hỏi đáp về khóa học
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Đặt câu hỏi hoặc chia sẻ ý kiến của bạn..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              maxLength={500}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {newComment.length}/500 ký tự
              </p>
              <Button
                onClick={handleSubmit}
                disabled={createCommentMutation.isPending || !newComment.trim()}
                className="gap-2"
                size="sm"
              >
                <Send className="w-4 h-4" />
                {createCommentMutation.isPending ? 'Đang gửi...' : 'Gửi'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not Enrolled Message */}
      {!isEnrolled && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-6">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                Bạn cần đăng ký khóa học để tham gia hỏi đáp
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Hỏi đáp
            <Badge variant="secondary" className="ml-1">
              {commentsData?.pagination?.totalItems || 0}
            </Badge>
          </h3>
        </div>

        {displayComments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <MessageCircle className="w-10 h-10 opacity-50" />
                <p className="text-sm">Chưa có bình luận nào</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {displayComments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={comment.user?.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(comment.user?.fullName || 'U')}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="font-medium text-sm">
                            {comment.user?.fullName || 'Người dùng'}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>

                        <p className="text-sm leading-relaxed">
                          {comment.content}
                        </p>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => likeCommentMutation.mutate(comment.id)}
                            disabled={likeCommentMutation.isPending}
                            className={`flex items-center gap-1 text-xs font-medium transition-colors rounded px-2 py-1 ${
                              comment.isLiked 
                                ? 'text-blue-600 bg-blue-50' 
                                : 'text-muted-foreground hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                            <span>{comment.like > 0 ? comment.like : 'Thích'}</span>
                          </button>

                          <button
                            onClick={() => dislikeCommentMutation.mutate(comment.id)}
                            disabled={dislikeCommentMutation.isPending}
                            className={`flex items-center gap-1 text-xs font-medium transition-colors rounded px-2 py-1 ${
                              comment.isDisliked 
                                ? 'text-red-600 bg-red-50' 
                                : 'text-muted-foreground hover:text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <ThumbsDown className={`w-3.5 h-3.5 ${comment.isDisliked ? 'fill-current' : ''}`} />
                            <span>{comment.dislike > 0 ? comment.dislike : 'Không thích'}</span>
                          </button>
                          
                          {user?.id === comment.userId && (
                            <button
                              onClick={() => {
                                if (confirm("Bạn có chắc muốn xóa bình luận này?")) {
                                  deleteCommentMutation.mutate(comment.id)
                                }
                              }}
                              disabled={deleteCommentMutation.isPending}
                              className="flex items-center gap-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors rounded px-2 py-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {commentsData?.pagination && commentsData.pagination.totalPage > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {page} / {commentsData.pagination.totalPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(commentsData.pagination.totalPage, page + 1))}
                  disabled={page === commentsData.pagination.totalPage}
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
