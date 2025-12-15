"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Star, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

interface QuickAction {
  title: string;
  description: string;
  count: number;
  href: string;
  icon: React.ReactNode;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  urgent?: boolean;
}

interface QuickActionsProps {
  pendingComments?: number;
  needReplyFeedbacks?: number;
  isLoading?: boolean;
}

export function QuickActions({ 
  pendingComments = 0, 
  needReplyFeedbacks = 0, 
  isLoading = false 
}: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      title: "Bình luận chờ phản hồi",
      description: "Học viên đang chờ bạn trả lời",
      count: pendingComments,
      href: "/instructor/comments?status=pending",
      icon: <MessageSquare className="h-4 w-4" />,
      variant: pendingComments > 0 ? 'destructive' : 'outline',
      urgent: pendingComments > 5,
    },
    {
      title: "Đánh giá cần phản hồi",
      description: "Phản hồi để tăng tương tác",
      count: needReplyFeedbacks,
      href: "/instructor/feedbacks?hasReply=false",
      icon: <Star className="h-4 w-4" />,
      variant: needReplyFeedbacks > 0 ? 'secondary' : 'outline',
      urgent: needReplyFeedbacks > 10,
    },
    {
      title: "Xem tất cả bình luận",
      description: "Quản lý toàn bộ bình luận",
      count: 0,
      href: "/instructor/comments",
      icon: <CheckCircle className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      title: "Xem tất cả đánh giá",
      description: "Theo dõi phản hồi học viên",
      count: 0,
      href: "/instructor/feedbacks",
      icon: <Star className="h-4 w-4" />,
      variant: 'outline',
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hành động nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Hành động nhanh
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                variant={action.variant}
                className="w-full h-auto p-4 justify-start"
                asChild
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    {action.icon}
                    <div className="text-left">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {action.title}
                        {action.urgent && (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      <div className="text-xs opacity-70">
                        {action.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {action.count > 0 && (
                      <Badge 
                        variant={action.urgent ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {action.count}
                      </Badge>
                    )}
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}