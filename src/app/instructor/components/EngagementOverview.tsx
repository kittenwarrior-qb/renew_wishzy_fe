"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "../../../../components/ui/progress"
import { 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Users,
  Clock,
  CheckCircle
} from "lucide-react"

interface CommentStats {
  totalComments: number;
  pendingComments: number;
  repliedComments: number;
  resolvedComments: number;
}

interface FeedbackStats {
  totalFeedbacks: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  highRatings: number;
  needReply: number;
}

interface EngagementOverviewProps {
  commentsStats?: CommentStats;
  feedbacksStats?: FeedbackStats;
  isLoading?: boolean;
}

export function EngagementOverview({ 
  commentsStats, 
  feedbacksStats, 
  isLoading = false 
}: EngagementOverviewProps) {
  const formatPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent className="animate-pulse">
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent className="animate-pulse">
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Comments Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Tổng quan bình luận
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tổng bình luận</span>
            <Badge variant="outline">{commentsStats?.totalComments || 0}</Badge>
          </div>
          
          {/* Chart Style Display */}
          <div className="relative bg-gradient-to-t from-muted/20 to-transparent rounded-lg p-3">
            <div className="flex items-end justify-center gap-4 h-24">
              {/* Pending Comments */}
              <div className="flex flex-col items-center gap-1 group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold bg-orange-500 text-white px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  {commentsStats?.pendingComments || 0} bình luận
                </div>
                <div className="relative w-12 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-md transition-all duration-500"
                    style={{ 
                      height: `${Math.max(formatPercentage(commentsStats?.pendingComments || 0, commentsStats?.totalComments || 1), 8)}%`,
                      minHeight: '8px'
                    }}
                  />
                  <div className="w-full h-0.5 bg-border rounded-full" />
                </div>
                <div className="text-xs text-center text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 mx-auto mb-1" />
                  Chờ phản hồi
                </div>
              </div>

              {/* Processed Comments */}
              <div className="flex flex-col items-center gap-1 group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold bg-green-500 text-white px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  {(commentsStats?.repliedComments || 0) + (commentsStats?.resolvedComments || 0)} bình luận
                </div>
                <div className="relative w-12 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-md transition-all duration-500"
                    style={{ 
                      height: `${Math.max(formatPercentage(
                        (commentsStats?.repliedComments || 0) + (commentsStats?.resolvedComments || 0), 
                        commentsStats?.totalComments || 1
                      ), 8)}%`,
                      minHeight: '8px'
                    }}
                  />
                  <div className="w-full h-0.5 bg-border rounded-full" />
                </div>
                <div className="text-xs text-center text-muted-foreground mt-1">
                  <CheckCircle className="h-3 w-3 mx-auto mb-1" />
                  Đã xử lý
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedbacks Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Tổng quan đánh giá
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tổng đánh giá</span>
            <Badge variant="outline">{feedbacksStats?.totalFeedbacks || 0}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Điểm trung bình</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {renderStars(Math.round(feedbacksStats?.averageRating || 0))}
              </div>
              <span className="text-sm font-medium">
                {(feedbacksStats?.averageRating || 0).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Chart Style Display */}
          <div className="relative bg-gradient-to-t from-muted/20 to-transparent rounded-lg p-3">
            <div className="flex items-end justify-center gap-4 h-24">
              {/* High Ratings */}
              <div className="flex flex-col items-center gap-1 group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold bg-yellow-500 text-white px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  {feedbacksStats?.highRatings || 0} đánh giá
                </div>
                <div className="relative w-12 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-md transition-all duration-500"
                    style={{ 
                      height: `${Math.max(formatPercentage(feedbacksStats?.highRatings || 0, feedbacksStats?.totalFeedbacks || 1), 8)}%`,
                      minHeight: '8px'
                    }}
                  />
                  <div className="w-full h-0.5 bg-border rounded-full" />
                </div>
                <div className="text-xs text-center text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3 mx-auto mb-1" />
                  Đánh giá cao
                </div>
              </div>

              {/* Need Reply */}
              <div className="flex flex-col items-center gap-1 group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold bg-blue-500 text-white px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  {feedbacksStats?.needReply || 0} đánh giá
                </div>
                <div className="relative w-12 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all duration-500"
                    style={{ 
                      height: `${Math.max(formatPercentage(feedbacksStats?.needReply || 0, feedbacksStats?.totalFeedbacks || 1), 8)}%`,
                      minHeight: '8px'
                    }}
                  />
                  <div className="w-full h-0.5 bg-border rounded-full" />
                </div>
                <div className="text-xs text-center text-muted-foreground mt-1">
                  <Users className="h-3 w-3 mx-auto mb-1" />
                  Cần phản hồi
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}