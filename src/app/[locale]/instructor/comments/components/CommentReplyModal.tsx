"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { Comment } from "@/types/comment"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface CommentReplyModalProps {
  comment: Comment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReply: (commentId: string, content: string) => void
  loading?: boolean
}

export function CommentReplyModal({
  comment,
  open,
  onOpenChange,
  onReply,
  loading = false,
}: CommentReplyModalProps) {
  const [content, setContent] = useState("")

  if (!comment) return null

  const handleSubmit = () => {
    if (!content.trim()) return
    onReply(comment.id, content.trim())
    setContent("")
  }

  const userInitials = comment.user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Phản hồi bình luận</DialogTitle>
          <DialogDescription>
            Trả lời bình luận của học viên về khóa học của bạn
          </DialogDescription>
        </DialogHeader>

        {/* Original Comment Preview */}
        <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={comment.user?.avatar} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{comment.user?.fullName || "Người dùng"}</div>
              {comment.courseName && (
                <div className="text-sm text-muted-foreground">{comment.courseName}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= comment.rating
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground">({comment.rating}/5)</span>
          </div>
          <div className="text-sm">{comment.content}</div>
        </div>

        {/* Reply Form */}
        <div className="space-y-2">
          <Label htmlFor="reply-content">Nội dung phản hồi</Label>
          <Textarea
            id="reply-content"
            placeholder="Nhập nội dung phản hồi..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {content.length}/1000 ký tự
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !content.trim()}>
            {loading ? "Đang gửi..." : "Gửi phản hồi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

