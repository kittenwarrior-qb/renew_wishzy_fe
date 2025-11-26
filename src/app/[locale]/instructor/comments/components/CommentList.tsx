"use client"

import { CommentItem } from "./CommentItem"
import type { Comment } from "@/types/comment"
import { Inbox } from "lucide-react"

interface CommentListProps {
  comments: Comment[]
  onReply?: (comment: Comment) => void
  loading?: boolean
}

export function CommentList({ comments, onReply, loading }: CommentListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <Inbox className="h-10 w-10 text-muted-foreground/60" />
          <span>Không có bình luận nào</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          showCourseName={true}
        />
      ))}
    </div>
  )
}

