"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable";
import { 
  Star, 
  MessageSquare,
  Inbox,
  ThumbsUp
} from "lucide-react";

import { 
  useInstructorFeedbacks
} from "@/hooks/useInstructorApi";
import type { Feedback, FeedbackListQuery } from "@/types/instructor";

export default function FeedbacksPage() {
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [ratingFilter, setRatingFilter] = React.useState<"all" | "high" | "low">("all");

  // Build query parameters
  const queryParams: FeedbackListQuery = React.useMemo(() => ({
    page,
    limit,
    search: searchTerm || undefined,
    ratingRange: ratingFilter === "all" ? undefined : ratingFilter,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }), [page, limit, searchTerm, ratingFilter]);

  // API Hooks - read only, no reply needed
  const { data: feedbacksData, isPending, isFetching, isError, error } = useInstructorFeedbacks(queryParams);

  // Extract data from API response
  const feedbacks = feedbacksData?.data?.items || [];
  const pagination = feedbacksData?.data?.pagination;
  const statistics = feedbacksData?.data?.statistics;

  const totalFeedbacks = statistics?.totalFeedbacks || 0;
  
  // Calculate averageRating with validation
  let averageRating = statistics?.averageRating || 0;
  if (averageRating > 5 || averageRating < 0 || isNaN(averageRating)) {
    const validFeedbacks = feedbacks.filter(f => {
      const rating = Number(f.rating);
      return !isNaN(rating) && rating >= 1 && rating <= 5;
    });
    if (validFeedbacks.length > 0) {
      averageRating = validFeedbacks.reduce((acc, f) => {
        return acc + Math.max(1, Math.min(5, Number(f.rating)));
      }, 0) / validFeedbacks.length;
    } else {
      averageRating = 0;
    }
  }
  averageRating = Math.max(0, Math.min(5, averageRating));

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
              {row.studentName?.charAt(0) || 'U'}
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
        <span className="text-sm line-clamp-2">{row.courseName}</span>
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
          <span className="text-sm">{row.helpfulCount || 0}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Mức độ',
      type: 'short',
      render: (row: Feedback) => getRatingBadge(row.rating),
    },
  ];

  return (
    <div className="relative p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold">Xem đánh giá khóa học</h1>
        <p className="text-sm text-muted-foreground">Đánh giá từ học viên về các khóa học của bạn (chỉ xem)</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {isPending ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-24 mb-2 animate-pulse" />
                  <div className="h-8 bg-muted rounded w-16 animate-pulse" />
                </div>
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tổng đánh giá</p>
                  <p className="text-2xl font-bold">{totalFeedbacks}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Điểm trung bình</p>
                  <p className="text-2xl font-bold">{averageRating.toFixed(1)}/5</p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Đánh giá cao (4-5 sao)</p>
                  <p className="text-2xl font-bold">{statistics?.highRatings || 0}</p>
                </div>
                <ThumbsUp className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm đánh giá
            </label>
            <Input 
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} 
              placeholder="Nhập nội dung đánh giá..." 
              className="h-9 w-52" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lọc theo mức đánh giá
            </label>
            <Select value={ratingFilter} onValueChange={(value) => { setRatingFilter(value as "all" | "high" | "low"); setPage(1); }}>
              <SelectTrigger className="h-9 w-48">
                <SelectValue placeholder="Chọn mức đánh giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đánh giá</SelectItem>
                <SelectItem value="high">Đánh giá cao (4-5 sao)</SelectItem>
                <SelectItem value="low">Cần cải thiện (1-3 sao)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative min-h-[300px]">
        {isError ? (
          <div className="py-16 text-center">
            <div className="text-sm text-destructive mb-2">Lỗi tải dữ liệu</div>
            <div className="text-xs text-muted-foreground">
              {error?.message || 'Không thể kết nối đến server'}
            </div>
          </div>
        ) : feedbacks.length === 0 && !isPending ? (
          <div className="py-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="h-10 w-10 text-muted-foreground/60" />
              <span>Chưa có đánh giá nào</span>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}