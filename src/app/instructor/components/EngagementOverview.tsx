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
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Chờ phản hồi
              </span>
              <span>{commentsStats?.pendingComments || 0}</span>
            </div>
            <Progress 
              value={formatPercentage(commentsStats?.pendingComments || 0, commentsStats?.totalComments || 1)} 
              className="h-2" 
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Đã xử lý
              </span>
              <span>{(commentsStats?.repliedComments || 0) + (commentsStats?.resolvedComments || 0)}</span>
            </div>
            <Progress 
              value={formatPercentage(
                (commentsStats?.repliedComments || 0) + (commentsStats?.resolvedComments || 0), 
                commentsStats?.totalComments || 1
              )} 
              className="h-2" 
            />
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

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Đánh giá cao (4-5⭐)
              </span>
              <span>{feedbacksStats?.highRatings || 0}</span>
            </div>
            <Progress 
              value={formatPercentage(feedbacksStats?.highRatings || 0, feedbacksStats?.totalFeedbacks || 1)} 
              className="h-2" 
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Cần phản hồi
              </span>
              <span>{feedbacksStats?.needReply || 0}</span>
            </div>
            <Progress 
              value={formatPercentage(feedbacksStats?.needReply || 0, feedbacksStats?.totalFeedbacks || 1)} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}