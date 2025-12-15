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
  Star, 
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  MessageCircle,
  Inbox
} from "lucide-react";

import { 
  useInstructorFeedbacks, 
  useReplyToFeedback, 
  useMarkFeedbackHelpful 
} from "@/hooks/useInstructorApi";
import type { Feedback, FeedbackListQuery } from "@/types/instructor";

export default function FeedbacksPage() {
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [ratingFilter, setRatingFilter] = React.useState<"all" | "high" | "low">("all");
  const [courseFilter, setCourseFilter] = React.useState("");
  const [selectedFeedback, setSelectedFeedback] = React.useState<Feedback | null>(null);

  // Build query parameters
  const queryParams: FeedbackListQuery = React.useMemo(() => ({
    page,
    limit,
    search: searchTerm || undefined,
    ratingRange: ratingFilter === "all" ? undefined : ratingFilter,
    courseId: courseFilter || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }), [page, limit, searchTerm, ratingFilter, courseFilter]);

  // API Hooks
  const { data: feedbacksData, isPending, isFetching, isError, error } = useInstructorFeedbacks(queryParams);
  const { mutate: replyToFeedback, isPending: isReplying } = useReplyToFeedback();
  const { mutate: markHelpful, isPending: isMarkingHelpful } = useMarkFeedbackHelpful();

  // Extract data from API response
  const feedbacks = feedbacksData?.data?.items || [];
  const pagination = feedbacksData?.data?.pagination;
  const statistics = feedbacksData?.data?.statistics;

  // Debug log
  React.useEffect(() => {
    if (feedbacksData) {
      console.log('Feedbacks data received:', feedbacksData);
    }
    if (isError) {
      console.error('Feedbacks error:', error);
    }
  }, [feedbacksData, isError, error]);

  const totalFeedbacks = statistics?.totalFeedbacks || 0;
  const averageRating = statistics?.averageRating || 0;
  const highRatings = statistics?.highRatings || 0;
  const needReply = statistics?.needReply || 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4) {
      return <Badge className="bg-green-100 text-green-800">Tích cực</Badge>;
    } else if (rating >= 3) {
      return <Badge variant="secondary">Trung bình</Badge>;
    } else {
      return <Badge variant="destructive">Cần cải thiện</Badge>;
    }
  };

  const handleReply = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
  };

  const submitReply = (content: string) => {
    if (!selectedFeedback || !content.trim()) return;
    
    replyToFeedback(
      { feedbackId: selectedFeedback.id, data: { content: content.trim() } },
      {
        onSuccess: () => {
          setSelectedFeedback(null);
        }
      }
    );
  };

  const handleMarkHelpful = (feedbackId: string) => {
    markHelpful(feedbackId);
  };

  return (
    <div className="relative py-4 px-4 md:px-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Tổng đánh giá</div>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{totalFeedbacks}</div>
          <p className="text-xs text-muted-foreground">Từ học viên</p>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Điểm trung bình</div>
            <Star className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="flex items-center mt-1">
            {renderStars(Math.round(averageRating))}
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Đánh giá cao</div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{highRatings}</div>
          <p className="text-xs text-muted-foreground">
            4-5 sao ({Math.round((highRatings / totalFeedbacks) * 100)}%)
          </p>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">Cần phản hồi</div>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{needReply}</div>
          <p className="text-xs text-muted-foreground">Chưa phản hồi</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <Input 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Tìm kiếm đánh giá..." 
              className="h-9 w-52" 
            />
            <Select value={ratingFilter} onValueChange={(value) => setRatingFilter(value as "all" | "high" | "low")}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Đánh giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="high">Đánh giá cao (4-5 sao)</SelectItem>
                <SelectItem value="low">Cần cải thiện (1-3 sao)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="relative min-h-[300px]">
        <LoadingOverlay show={isPending || isFetching} />

        {isError ? (
          <div className="py-16 text-center">
            <div className="text-sm text-destructive mb-2">Lỗi tải dữ liệu</div>
            <div className="text-xs text-muted-foreground">
              {error?.message || 'Không thể kết nối đến server'}
            </div>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="py-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="h-10 w-10 text-muted-foreground/60" />
              <span>Không có dữ liệu</span>
            </div>
          </div>
        ) : (
          (() => {
            const columns: Column<Feedback>[] = [
              {
                key: 'rating',
                label: 'Đánh giá',
                type: 'text',
                render: (row: Feedback) => (
                  <div className="max-w-[350px] space-y-2">
                    <div className="flex items-center space-x-1">
                      {renderStars(row.rating)}
                      <span className="text-sm font-medium ml-2">{row.rating}/5</span>
                    </div>
                    <p className="text-sm line-clamp-2">{row.comment}</p>
                  </div>
                ),
              },
              {
                key: 'student',
                label: 'Học viên',
                type: 'text',
                render: (row: Feedback) => (
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
                key: 'courseName',
                label: 'Khóa học',
                type: 'short',
                render: (row: Feedback) => (
                  <span className="text-sm">{row.courseName}</span>
                ),
              },
              {
                key: 'createdAt',
                label: 'Thời gian',
                type: 'short',
                render: (row: Feedback) => (
                  <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>
                ),
              },
              {
                key: 'helpful',
                label: 'Hữu ích',
                type: 'short',
                render: (row: Feedback) => (
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span className="text-sm">{row.helpfulCount}</span>
                  </div>
                ),
              },
              {
                key: 'status',
                label: 'Trạng thái',
                type: 'short',
                render: (row: Feedback) => (
                  <div className="flex flex-col space-y-1">
                    {getRatingBadge(row.rating)}
                    {row.isReplied ? (
                      <Badge variant="outline" className="text-xs">Đã phản hồi</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Chưa phản hồi</Badge>
                    )}
                  </div>
                ),
              },
              {
                key: 'actions',
                label: 'Hành động',
                type: 'action',
                render: (row: Feedback) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isReplying || isMarkingHelpful}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleReply(row)}>
                        {row.isReplied ? "Xem phản hồi" : "Phản hồi"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMarkHelpful(row.id)}>
                        Đánh dấu hữu ích
                      </DropdownMenuItem>
                      <DropdownMenuItem>Báo cáo</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            ];
            return (
              <DynamicTable
                columns={columns}
                data={feedbacks}
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
            )
          })()
        )}
      </div>

      {/* Reply Dialog */}
      <ReplyDialog
        open={!!selectedFeedback}
        onOpenChange={() => setSelectedFeedback(null)}
        type="feedback"
        item={selectedFeedback ? {
          id: selectedFeedback.id,
          comment: selectedFeedback.comment,
          rating: selectedFeedback.rating,
          studentName: selectedFeedback.studentName,
          studentAvatar: selectedFeedback.studentAvatar,
          courseName: selectedFeedback.courseName,
          createdAt: selectedFeedback.createdAt,
        } : null}
        onSubmit={submitReply}
        isSubmitting={isReplying}
      />
    </div>
  );
}