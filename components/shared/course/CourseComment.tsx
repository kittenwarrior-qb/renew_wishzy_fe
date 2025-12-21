import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Send, Trash2 } from "lucide-react"
import { useQueryHook } from "@/src/hooks/useQueryHook"
import { commentService, type Comment as CommentType } from "@/src/services/comment"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAppStore } from "@/src/stores/useAppStore"
import { toast } from "sonner"

interface CommentWithUser extends CommentType {
  user?: {
    id: string
    name: string
    avatar?: string
  }
  userReaction?: 'like' | 'dislike' | null
}

interface CourseCommentProps {
  courseId: string
  isEnrolled?: boolean
  progress?: number // Progress percentage (0-100)
}

const CourseComment = ({ courseId, isEnrolled = false, progress = 0 }: CourseCommentProps) => {
  const isCompleted = progress >= 100;
  const [newComment, setNewComment] = useState("")
  const [newRating, setNewRating] = useState(5)
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const queryClient = useQueryClient()
  const { user } = useAppStore()

  // Check if user already submitted feedback
  const { data: userFeedback } = useQueryHook<CommentWithUser | null>(
    ['user-feedback', courseId, user?.id || 'anonymous'],
    async () => {
      if (!user?.id) return null
      const res = await commentService.listByCourse(courseId, 1, 100)
      return res.items.find(item => item.userId === user.id && item.rating > 0) || null
    },
    {
      enabled: !!user?.id && isCompleted
    }
  )

  const hasSubmittedFeedback = !!userFeedback

  // Fetch feedbacks (only with rating > 0)
  const { data: commentsData, isLoading } = useQueryHook<{
    items: CommentWithUser[]
    pagination: {
      totalItems: number
      currentPage: number
      itemsPerPage: number
      totalPage: number
    }
  }>(
    ['feedbacks', courseId, page.toString(), limit.toString()],
    () => commentService.listByCourse(courseId, page, limit)
  )

  const createCommentMutation = useMutation({
    mutationFn: (data: { content: string; rating: number }) => {
      if (!user?.id) {
        throw new Error("User not authenticated")
      }
      return commentService.create({
        courseId,
        content: data.content,
        rating: data.rating
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks', courseId] })
      queryClient.invalidateQueries({ queryKey: ['user-feedback', courseId] })
      setNewComment("")
      setNewRating(5)
      toast.success("Đánh giá của bạn đã được gửi thành công!")
    },
    onError: (error: any) => {
      const message = error?.message === "User not authenticated" 
        ? "Bạn cần đăng nhập để viết đánh giá"
        : "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!"
      toast.error(message)
    }
  })

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string) => {
      if (!user?.id) {
        throw new Error("User not authenticated")
      }
      return commentService.like(commentId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks', courseId] })
    },
    onError: (error: any) => {
      if (error?.message === "User not authenticated" || error?.response?.status === 401) {
        toast.error("Bạn cần đăng nhập để thích đánh giá")
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!")
      }
    }
  })

  // Dislike comment mutation
  const dislikeCommentMutation = useMutation({
    mutationFn: (commentId: string) => {
      if (!user?.id) {
        throw new Error("User not authenticated")
      }
      return commentService.dislike(commentId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks', courseId] })
    },
    onError: (error: any) => {
      if (error?.message === "User not authenticated" || error?.response?.status === 401) {
        toast.error("Bạn cần đăng nhập để không thích đánh giá")
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!")
      }
    }
  })

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentService.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks', courseId] })
      queryClient.invalidateQueries({ queryKey: ['user-feedback', courseId] })
      toast.success("Đã xóa đánh giá thành công!")
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa đánh giá. Vui lòng thử lại!")
    }
  })

  const displayComments = commentsData?.items || []

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá")
      return
    }
    if (newComment.length > 500) {
      toast.error("Nội dung đánh giá không được vượt quá 500 ký tự")
      return
    }
    if (!user?.id) {
      toast.error("Bạn cần đăng nhập để viết đánh giá")
      return
    }
    
    createCommentMutation.mutate({
      content: newComment,
      rating: newRating
    })
  }

  const handleLikeComment = (commentId: string) => {
    if (!user?.id) {
      toast.error("Bạn cần đăng nhập để thích đánh giá")
      return
    }
    likeCommentMutation.mutate(commentId)
  }

  const handleDislikeComment = (commentId: string) => {
    if (!user?.id) {
      toast.error("Bạn cần đăng nhập để không thích đánh giá")
      return
    }
    dislikeCommentMutation.mutate(commentId)
  }

  const handleDeleteComment = (commentId: string) => {
    if (!user?.id) {
      toast.error("Bạn cần đăng nhập để xóa đánh giá")
      return
    }
    if (confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      deleteCommentMutation.mutate(commentId)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    // Scroll to feedback section smoothly after a small delay to let React render
    setTimeout(() => {
      const feedbackSection = document.getElementById('feedback')
      if (feedbackSection) {
        const yOffset = -80 // Offset for fixed header if any
        const y = feedbackSection.getBoundingClientRect().top + window.pageYOffset + yOffset
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }, 100)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8" id="feedback">
      {/* Already Submitted Feedback */}
      {isCompleted && hasSubmittedFeedback && (
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="py-6">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <div className="p-2 bg-green-500/10 rounded-full">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Bạn đã đánh giá khóa học này
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Cảm ơn bạn đã chia sẻ đánh giá!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Write Review Section */}
      {isCompleted && !hasSubmittedFeedback && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              Viết đánh giá của bạn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Rating Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Đánh giá của bạn
              </label>
              <div className="flex items-center gap-1.5 p-3 bg-muted/30 rounded-lg border">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNewRating(i + 1)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        i < newRating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium text-foreground">
                  {newRating}/5
                </span>
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nội dung đánh giá
              </label>
              <Textarea
                placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {newComment.length}/500 ký tự
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={createCommentMutation.isPending || !newComment.trim()}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {createCommentMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not Completed Message */}
      {!isCompleted && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-6">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <div className="p-2 bg-primary/10 rounded-full">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {!isEnrolled 
                    ? "Bạn cần đăng ký khóa học để viết đánh giá"
                    : "Bạn cần hoàn thành khóa học để viết đánh giá"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {!isEnrolled
                    ? "Hãy tham gia khóa học để chia sẻ trải nghiệm của bạn"
                    : `Tiến độ hiện tại: ${progress.toFixed(0)}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            Đánh giá từ học viên đã hoàn thành
            <Badge variant="secondary" className="ml-1">
              {commentsData?.pagination?.totalItems || 0}
            </Badge>
          </h3>
        </div>

        {displayComments.filter(c => c.rating > 0).length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <Star className="w-10 h-10 opacity-50" />
                <p className="text-sm">Chưa có đánh giá nào cho khóa học này</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {displayComments.filter(c => c.rating > 0).map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={comment.user?.avatar} alt={comment.user?.name || 'User'} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {getInitials(comment.user?.name || 'U')}
                        </AvatarFallback>
                      </Avatar>

                      {/* Comment Content */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="font-medium text-sm">
                            {comment.user?.name || 'Người dùng'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-0.5">
                              {renderStars(comment.rating)}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              • {formatDate(comment.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Comment Text */}
                        <p className="text-sm leading-relaxed text-foreground/90">
                          {comment.content}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleLikeComment(comment.id)}
                            disabled={likeCommentMutation.isPending}
                            className={`flex items-center gap-1 text-xs font-medium transition-colors rounded px-2 py-1 ${
                              comment.userReaction === 'like' 
                                ? 'text-blue-600 bg-blue-50' 
                                : 'text-muted-foreground hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${comment.userReaction === 'like' ? 'fill-current' : ''}`} />
                            <span>{comment.like > 0 ? comment.like : 'Thích'}</span>
                          </button>

                          <button
                            onClick={() => handleDislikeComment(comment.id)}
                            disabled={dislikeCommentMutation.isPending}
                            className={`flex items-center gap-1 text-xs font-medium transition-colors rounded px-2 py-1 ${
                              comment.userReaction === 'dislike' 
                                ? 'text-red-600 bg-red-50' 
                                : 'text-muted-foreground hover:text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <ThumbsDown className={`w-3.5 h-3.5 ${comment.userReaction === 'dislike' ? 'fill-current' : ''}`} />
                            <span>{comment.dislike > 0 ? comment.dislike : 'Không thích'}</span>
                          </button>
                          
                          {user?.id === comment.userId && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
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
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
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
                  onClick={() => handlePageChange(Math.min(commentsData.pagination.totalPage, page + 1))}
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

export default CourseComment