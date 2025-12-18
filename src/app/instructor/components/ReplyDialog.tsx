"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Star, MessageSquare, Clock } from "lucide-react"

interface ReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'comment' | 'feedback';
  item: {
    id: string;
    content?: string;
    comment?: string;
    rating?: number;
    studentName: string;
    studentAvatar?: string;
    courseName: string;
    createdAt: string;
  } | null;
  onSubmit: (content: string) => void;
  isSubmitting?: boolean;
}

export function ReplyDialog({
  open,
  onOpenChange,
  type,
  item,
  onSubmit,
  isSubmitting = false
}: ReplyDialogProps) {
  const [replyContent, setReplyContent] = useState("");

  const handleSubmit = () => {
    if (!replyContent.trim()) return;
    onSubmit(replyContent.trim());
    setReplyContent("");
  };

  const handleClose = () => {
    setReplyContent("");
    onOpenChange(false);
  };

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

  const getReplyTemplate = () => {
    if (type === 'feedback') {
      if (item?.rating && item.rating >= 4) {
        return "Cảm ơn bạn đã đánh giá tích cực! Tôi rất vui khi biết bạn hài lòng với khóa học. Chúc bạn học tập hiệu quả!";
      } else {
        return "Cảm ơn bạn đã phản hồi. Tôi sẽ cải thiện nội dung khóa học dựa trên góp ý của bạn. Nếu có thắc mắc gì, hãy liên hệ với tôi nhé!";
      }
    } else {
      return "Cảm ơn bạn đã đặt câu hỏi. Tôi sẽ trả lời chi tiết để giúp bạn hiểu rõ hơn về vấn đề này.";
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'feedback' ? (
              <Star className="h-5 w-5" />
            ) : (
              <MessageSquare className="h-5 w-5" />
            )}
            {type === 'feedback' ? 'Phản hồi đánh giá' : 'Phản hồi bình luận'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Original Content */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {item.studentName.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-sm">{item.studentName}</div>
                  <div className="text-xs text-muted-foreground">{item.courseName}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {type === 'feedback' && item.rating && (
                  <div className="flex items-center gap-1">
                    {renderStars(item.rating)}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDate(item.createdAt)}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              {type === 'feedback' ? item.comment : item.content}
            </p>
          </div>

          {/* Reply Form */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Phản hồi của bạn</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReplyContent(getReplyTemplate())}
                disabled={isSubmitting}
              >
                Sử dụng mẫu
              </Button>
            </div>
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={getReplyTemplate()}
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              {replyContent.length}/500 ký tự
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">💡 Gợi ý phản hồi hiệu quả:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Cảm ơn học viên đã dành thời gian phản hồi</li>
              <li>• Trả lời cụ thể và hữu ích</li>
              <li>• Khuyến khích học viên tiếp tục học tập</li>
              <li>• Giữ tông giọi thân thiện và chuyên nghiệp</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!replyContent.trim() || isSubmitting || replyContent.length > 500}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}