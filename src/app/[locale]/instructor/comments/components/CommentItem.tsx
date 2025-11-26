"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Comment } from "@/types/comment"
import { Star, ThumbsUp, ThumbsDown, ArrowLeft, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface CommentItemProps {
  comment: Comment
  onReply?: (comment: Comment) => void
  showCourseName?: boolean
}

export function CommentItem({ comment, onReply, showCourseName = true }: CommentItemProps) {
  const userInitials = comment.user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?"

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: vi,
  })

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={comment.user?.avatar} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{comment.user?.fullName || "Người dùng"}</div>
            {showCourseName && comment.courseName && (
              <div className="text-sm text-muted-foreground">{comment.courseName}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {comment.reply && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <MessageSquare className="h-3 w-3 mr-1" />
              Đã phản hồi
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-4 w-4",
                star <= comment.rating
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-gray-300"
              )}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">({comment.rating}/5)</span>
      </div>

      {/* Content */}
      <div className="text-sm">{comment.content}</div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{comment.like}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsDown className="h-4 w-4" />
            <span>{comment.dislike}</span>
          </div>
        </div>
        {onReply && !comment.reply && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReply(comment)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Phản hồi
          </Button>
        )}
      </div>

      {/* Reply */}
      {comment.reply && (
        <div className="ml-8 mt-3 p-3 bg-muted rounded-lg border-l-2 border-primary">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={comment.reply.user?.avatar} />
              <AvatarFallback>
                {comment.reply.user?.fullName?.[0] || "G"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {comment.reply.user?.fullName || "Giảng viên"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.reply.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
          </div>
          <div className="text-sm">{comment.reply.content}</div>
        </div>
      )}
    </div>
  )
}

