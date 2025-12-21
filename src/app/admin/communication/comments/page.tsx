"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  MessageCircle,
  Inbox,
  Clock,
  MessageSquare,
  Eye
} from "lucide-react"
import {
  useInstructorComments,
  useReplyToComment,
} from "@/hooks/useInstructorApi"
import type { Comment, CommentListQuery } from "@/types/instructor"
import { useQuery } from "@tanstack/react-query"
import api from "@/services/api"

export default function AdminCommentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [page, setPage] = React.useState<number>(Number(searchParams.get("page") || 1))
  const [limit, setLimit] = React.useState<number>(Number(searchParams.get("limit") || 10))
  const [searchTerm, setSearchTerm] = React.useState("")

  // Selected comment for reply or view
  const [selectedComment, setSelectedComment] = React.useState<Comment | null>(null)
  const [dialogMode, setDialogMode] = React.useState<'view' | 'reply'>('view')
  const [replyContent, setReplyContent] = React.useState("")

  // Build query parameters
  const queryParams: CommentListQuery = React.useMemo(() => ({
    page,
    limit,
    search: searchTerm || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }), [page, limit, searchTerm])

  // API Hooks - reuse instructor hooks (backend handles role-based filtering)
  const { data: commentsData, isPending, isFetching, isError } = useInstructorComments(queryParams)
  const { mutate: replyToComment, isPending: isReplying } = useReplyToComment()

  // Fetch replies when viewing a comment
  const { data: repliesData, refetch: refetchReplies, isLoading: repliesLoading } = useQuery({
    queryKey: ['comment-replies', selectedComment?.id],
    queryFn: async () => {
      if (!selectedComment?.id) return []
      console.log('Fetching replies for comment:', selectedComment.id)
      const response = await api.get(`/comments/${selectedComment.id}/replies`)
      console.log('Replies response:', response.data)
      
      // Handle different response formats
      const items = response.data?.items || response.data?.data?.items || response.data || []
      console.log('Extracted replies:', items)
      return items
    },
    enabled: !!selectedComment?.id,
    staleTime: 0, // Always refetch to get latest replies
  })

  // Extract data from API response
  const comments = commentsData?.data?.items || []
  const pagination = commentsData?.data?.pagination
  const statistics = commentsData?.data?.statistics

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "replied":
        return <Badge className="bg-green-100 text-green-800">Đã phản hồi</Badge>
      case "pending":
        return <Badge variant="secondary">Chờ phản hồi</Badge>
      case "resolved":
        return <Badge className="bg-blue-100 text-blue-800">Đã giải quyết</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  const handleView = (comment: Comment) => {
    setSelectedComment(comment)
    setDialogMode('view')
    setReplyContent("")
  }

  const handleReply = (comment: Comment) => {
    setSelectedComment(comment)
    setDialogMode('reply')
    setReplyContent("")
  }

  const submitReply = () => {
    if (!selectedComment || !replyContent.trim()) return

    replyToComment(
      { commentId: selectedComment.id, data: { content: replyContent.trim() } },
      {
        onSuccess: () => {
          setReplyContent("")
          setSelectedComment(null) // Close modal
          // No reload, just close
        }
      }
    )
  }

  const handleCloseDialog = () => {
    setSelectedComment(null)
    setReplyContent("")
  }

  const columns: Column<Comment>[] = [
    {
      key: 'content',
      label: 'Bình luận',
      type: 'text',
      render: (row: Comment) => (
        <div className="max-w-[300px]">
          <p className="text-sm line-clamp-2">{row.content}</p>
        </div>
      ),
    },
    {
      key: 'student',
      label: 'Học viên',
      type: 'text',
      render: (row: Comment) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {row.studentName?.charAt(0) || 'U'}
            </span>
          </div>
          <span className="text-sm">{row.studentName || 'Unknown'}</span>
        </div>
      ),
    },
    {
      key: 'courseName',
      label: 'Khóa học',
      type: 'short',
      render: (row: Comment) => (
        <span className="text-sm text-muted-foreground line-clamp-1">{row.courseName || 'Unknown Course'}</span>
      ),
    },
    {
      key: 'lectureTitle',
      label: 'Bài giảng',
      type: 'short',
      render: (row: Comment) => (
        <span className="text-sm">{row.lectureTitle || 'Unknown Lecture'}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Thời gian',
      type: 'short',
      render: (row: Comment) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'repliesCount',
      label: 'Phản hồi',
      type: 'short',
      render: (row: Comment) => (
        <div className="flex items-center space-x-1 text-sm">
          <MessageCircle className="h-3 w-3" />
          <span>{row.repliesCount || 0}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'short',
      render: (row: Comment) => getStatusBadge(row.status),
    },
    {
      key: 'actions',
      label: 'Hành động',
      type: 'action',
      render: (row: Comment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isReplying}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleView(row)}>
              <Eye className="h-4 w-4 mr-2" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleReply(row)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Phản hồi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="relative p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold">Bình luận trong khóa học</h1>
        <p className="text-sm text-muted-foreground">Quản lý và phản hồi bình luận của học viên</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {isPending ? (
          // Skeleton for initial load
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-2 animate-pulse" />
                    <div className="h-8 bg-muted rounded w-16 animate-pulse" />
                  </div>
                  <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tổng bình luận</p>
                  <p className="text-2xl font-bold">{statistics?.totalComments || 0}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chờ phản hồi</p>
                  <p className="text-2xl font-bold">{statistics?.pendingComments || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Đã phản hồi</p>
                  <p className="text-2xl font-bold">{statistics?.repliedComments || 0}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Đã giải quyết</p>
                  <p className="text-2xl font-bold">{statistics?.resolvedComments || 0}</p>
                </div>
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Search Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm bình luận
            </label>
            <Input
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
              placeholder="Nhập nội dung bình luận để tìm kiếm..."
              className="h-9 w-64"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative min-h-[300px]">
        {isError ? (
          <div className="py-16 text-center text-sm text-destructive">Lỗi tải dữ liệu</div>
        ) : comments.length === 0 ? (
          <div className="py-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="h-10 w-10 text-muted-foreground/60" />
              <span>Không có bình luận</span>
            </div>
          </div>
        ) : (
          <DynamicTable
            columns={columns}
            data={comments}
            loading={isPending || isFetching}
            pagination={{
              totalItems: pagination?.total || 0,
              currentPage: pagination?.page || page,
              itemsPerPage: pagination?.limit || limit,
              onPageChange: (p) => setPage(p),
              pageSizeOptions: [10, 20, 50],
              onPageSizeChange: (sz) => {
                setLimit(sz)
                setPage(1)
              },
            }}
          />
        )}
      </div>

      {/* View/Reply Dialog */}
      <Dialog open={!!selectedComment} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogMode === 'reply' ? (
                <>
                  <MessageCircle className="h-5 w-5" />
                  Phản hồi bình luận
                </>
              ) : (
                <>
                  <Eye className="h-5 w-5" />
                  Chi tiết bình luận
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedComment && (
            <div className="space-y-4">
              {/* Original Comment */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {selectedComment.studentName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{selectedComment.studentName}</div>
                      <div className="text-xs text-muted-foreground">{selectedComment.courseName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedComment.status)}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(selectedComment.createdAt)}
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{selectedComment.content}</p>
                {selectedComment.lectureTitle && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Bài giảng: {selectedComment.lectureTitle}
                  </div>
                )}
              </div>

              {/* Replies Section (only in view mode) */}
              {dialogMode === 'view' && repliesData && repliesData.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Các phản hồi ({repliesData.length})
                  </h4>
                  <div className="space-y-3">
                    {repliesData.map((reply: any) => (
                      <div key={reply.id} className="bg-blue-50 p-3 rounded-lg border-l-2 border-blue-500">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-700">
                                {reply.user?.fullName?.charAt(0) || 'A'}
                              </span>
                            </div>
                            <span className="text-xs font-medium">{reply.user?.fullName || 'Admin'}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-700">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Form (only in reply mode) */}
              {dialogMode === 'reply' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Phản hồi của bạn</label>
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Nhập nội dung phản hồi..."
                    rows={4}
                    className="resize-none"
                  />
                  <div className="text-xs text-muted-foreground">
                    {replyContent.length}/500 ký tự
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isReplying}>
              {dialogMode === 'view' ? 'Đóng' : 'Hủy'}
            </Button>
            {dialogMode === 'view' ? (
              <Button onClick={() => setDialogMode('reply')}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Phản hồi
              </Button>
            ) : (
              <Button
                onClick={submitReply}
                disabled={!replyContent.trim() || isReplying || replyContent.length > 500}
              >
                {isReplying ? 'Đang gửi...' : 'Gửi phản hồi'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
