"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CommentStats, CommentList, CommentFilter, CommentReplyModal } from "./components"
import type { Comment, CommentFilter as CommentFilterType, CommentStats as CommentStatsType } from "@/types/comment"
import { mockCommentListResponse, mockCommentStats } from "@/src/mocks/comments"
import { notify } from "@/components/shared/admin/Notifications"
import { useCourseList } from "@/components/shared/course/useCourse"
import { useAppStore } from "@/src/stores/useAppStore"

export default function CommentsPage() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"

  // Mock data - sẽ thay bằng API call sau
  const [commentsData] = useState(mockCommentListResponse)
  const [statsData] = useState(mockCommentStats)
  const [filter, setFilter] = useState<CommentFilterType>({
    page: 1,
    limit: 10,
  })
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [replyModalOpen, setReplyModalOpen] = useState(false)
  const [loading] = useState(false)

  // Lấy danh sách courses để filter
  const { user } = useAppStore()
  const { data: coursesData } = useCourseList({
    page: 1,
    limit: 100,
    createdBy: user?.id,
  })
  const courses = (coursesData?.data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
  }))

  // Filter comments theo filter state (mock)
  const filteredComments = commentsData.items.filter((comment) => {
    if (filter.courseId && comment.courseId !== filter.courseId) return false
    if (filter.rating && comment.rating !== filter.rating) return false
    if (filter.hasReply !== undefined) {
      const hasReply = !!comment.reply
      if (filter.hasReply !== hasReply) return false
    }
    return true
  })

  // Sort comments
  const sortedComments = [...filteredComments].sort((a, b) => {
    switch (filter.sort) {
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "rating_high":
        return b.rating - a.rating
      case "rating_low":
        return a.rating - b.rating
      case "likes":
        return b.like - a.like
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const handleReply = (comment: Comment) => {
    setSelectedComment(comment)
    setReplyModalOpen(true)
  }

  const handleSubmitReply = (commentId: string, content: string) => {
    // TODO: Gọi API POST /comments/:commentId/reply khi backend sẵn sàng
    notify({
      title: "Đã gửi phản hồi",
      description: "Phản hồi đã được gửi (mock data)",
      variant: "success",
    })
    setReplyModalOpen(false)
    setSelectedComment(null)
  }

  return (
    <div className="relative py-4 px-4 md:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý bình luận</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xem và phản hồi các bình luận của học viên về khóa học của bạn
        </p>
      </div>

      {/* Stats */}
      <CommentStats stats={statsData} loading={loading} />

      {/* Filters */}
      <div className="border rounded-lg p-4">
        <CommentFilter
          filter={filter}
          onFilterChange={setFilter}
          courses={courses}
        />
      </div>

      {/* Comments List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Bình luận ({sortedComments.length})
          </h2>
        </div>
        <CommentList
          comments={sortedComments}
          onReply={handleReply}
          loading={loading}
        />
      </div>

      {/* Pagination (nếu cần) */}
      {commentsData.pagination.totalPage > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filter.page === 1}
            onClick={() => setFilter({ ...filter, page: (filter.page || 1) - 1 })}
          >
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {filter.page || 1} / {commentsData.pagination.totalPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={filter.page === commentsData.pagination.totalPage}
            onClick={() => setFilter({ ...filter, page: (filter.page || 1) + 1 })}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Reply Modal */}
      <CommentReplyModal
        comment={selectedComment}
        open={replyModalOpen}
        onOpenChange={setReplyModalOpen}
        onReply={handleSubmitReply}
        loading={loading}
      />
    </div>
  )
}

