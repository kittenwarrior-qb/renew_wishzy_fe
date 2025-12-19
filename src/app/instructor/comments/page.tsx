"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay";
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReplyDialog } from "../components/ReplyDialog";
import { 
  MoreHorizontal, 
  MessageSquare, 
  MessageCircle, 
  Eye,
  ThumbsUp,
  Clock,
  Inbox
} from "lucide-react";
import { 
  useInstructorComments, 
  useReplyToComment, 
  useUpdateCommentStatus,
  useDeleteComment 
} from "@/hooks/useInstructorApi";
import type { Comment, CommentListQuery } from "@/types/instructor";
import { Row } from "react-day-picker";

export default function CommentsPage() {
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "pending" | "replied" | "resolved">("all");
  const [courseFilter, setCourseFilter] = React.useState("");
  const [selectedComment, setSelectedComment] = React.useState<Comment | null>(null);

  // Build query parameters
  const queryParams: CommentListQuery = React.useMemo(() => ({
    page,
    limit,
    search: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    courseId: courseFilter || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }), [page, limit, searchTerm, statusFilter, courseFilter]);

  // API Hooks
  const { data: commentsData, isPending, isFetching, isError } = useInstructorComments(queryParams);
  const { mutate: replyToComment, isPending: isReplying } = useReplyToComment();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateCommentStatus();
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment();

  // Debug logging
  React.useEffect(() => {
    if (commentsData) {
      console.log('Comments page data:', {
        totalItems: commentsData.data?.items?.length,
        queryParams,
        sampleComment: commentsData.data?.items?.[0]
      });
    }
  }, [commentsData, queryParams]);

  // Extract data from API response
  const comments = commentsData?.data?.items || [];
  const pagination = commentsData?.data?.pagination;
  const statistics = commentsData?.data?.statistics;

  const totalComments = statistics?.totalComments || 0;
  const pendingComments = statistics?.pendingComments || 0;
  const repliedComments = statistics?.repliedComments || 0;
  const resolvedComments = statistics?.resolvedComments || 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "replied":
        return <Badge className="bg-green-100 text-green-800">Đã phản hồi</Badge>;
      case "pending":
        return <Badge variant="secondary">Chờ phản hồi</Badge>;
      case "resolved":
        return <Badge className="bg-blue-100 text-blue-800">Đã giải quyết</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const handleReply = (comment: Comment) => {
    setSelectedComment(comment);
  };

  const submitReply = (content: string) => {
    if (!selectedComment || !content.trim()) return;
    
    replyToComment(
      { commentId: selectedComment.id, data: { content: content.trim() } },
      {
        onSuccess: () => {
          setSelectedComment(null);
        }
      }
    );
  };

  const handleUpdateStatus = (commentId: string, status: "pending" | "replied" | "resolved") => {
    updateStatus({ commentId, data: { status } });
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      deleteComment(commentId);
    }
  };
  const columns: Column<any>[] = [
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
              {row.studentName.charAt(0)}
            </span>
          </div>
          <span className="text-sm">{row.studentName}</span>
        </div>
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
      key: 'interactions',
      label: 'Phản hồi',
      type: 'short',
      render: (row: Comment) => (
        <div className="flex items-center space-x-3 text-sm">
          <span className="flex items-center">
            <MessageCircle className="h-3 w-3 mr-1" />
            {row.repliesCount}
          </span>
          {row.lastReplyAt && (
            <span className="text-xs text-muted-foreground">
              {formatDate(row.lastReplyAt)}
            </span>
          )}
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
            <Button variant="ghost" size="icon" disabled={isReplying || isUpdatingStatus || isDeleting}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleReply(row)}>
              Phản hồi
            </DropdownMenuItem>
            {row.status === "pending" && (
              <DropdownMenuItem onClick={() => handleUpdateStatus(row.id, "replied")}>
                Đánh dấu đã phản hồi
              </DropdownMenuItem>
            )}
            {row.status !== "resolved" && (
              <DropdownMenuItem onClick={() => handleUpdateStatus(row.id, "resolved")}>
                Đánh dấu đã giải quyết
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => handleDeleteComment(row.id)}
            >
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="relative">
      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng bình luận</p>
              <p className="text-2xl font-bold">{totalComments}</p>
              <p className="text-xs text-muted-foreground">Tất cả bình luận</p>
            </div>
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chờ phản hồi</p>
              <p className="text-2xl font-bold">{pendingComments}</p>
              <p className="text-xs text-muted-foreground">Cần phản hồi</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Đã phản hồi</p>
              <p className="text-2xl font-bold">{repliedComments}</p>
              <p className="text-xs text-muted-foreground">Đã được phản hồi</p>
            </div>
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Đã giải quyết</p>
              <p className="text-2xl font-bold">{resolvedComments}</p>
              <p className="text-xs text-muted-foreground">Hoàn thành</p>
            </div>
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </div> */}

      {/* Filters */}
      <div className="mb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm bình luận
              </label>
              <Input 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }} 
                placeholder="Nhập nội dung bình luận để tìm kiếm..." 
                className="h-9 w-52" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo trạng thái
              </label>
              <Select value={statusFilter} onValueChange={(v: "all" | "pending" | "replied" | "resolved") => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="h-9 w-44">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ phản hồi</SelectItem>
                  <SelectItem value="replied">Đã phản hồi</SelectItem>
                  <SelectItem value="resolved">Đã giải quyết</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative min-h-[300px]">
        <LoadingOverlay show={isPending || isFetching} />

        {isError ? (
          <div className="py-16 text-center text-sm text-destructive">Lỗi tải dữ liệu</div>
        ) : comments.length === 0 ? (
          <div className="py-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="h-10 w-10 text-muted-foreground/60" />
              <span>Không có dữ liệu</span>
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
                setLimit(sz);
                setPage(1);
              },
            }}
          />
        )}
      </div>

      {/* Reply Dialog */}
      <ReplyDialog
        open={!!selectedComment}
        onOpenChange={() => setSelectedComment(null)}
        type="comment"
        item={selectedComment ? {
          id: selectedComment.id,
          content: selectedComment.content,
          studentName: selectedComment.studentName,
          studentAvatar: selectedComment.studentAvatar,
          courseName: selectedComment.courseName,
          createdAt: selectedComment.createdAt,
        } : null}
        onSubmit={submitReply}
        isSubmitting={isReplying}
      />
    </div>
  );
}