import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Star, ThumbsUp, MessageCircle, Send } from "lucide-react"

interface Comment {
  id: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  content: string
  rating: number
  createdAt: string
  likes: number
  isLiked: boolean
}

interface CourseCommentProps {
  courseId: string
  comments?: Comment[]
}

const CourseComment = ({ courseId, comments = [] }: CourseCommentProps) => {
  const [newComment, setNewComment] = useState("")
  const [newRating, setNewRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mockComments: Comment[] = [
    {
      id: "1",
      user: {
        id: "user1",
        name: "Nguyễn Văn A",
        avatar: ""
      },
      content: "Khóa học rất hay và bổ ích! Giảng viên giải thích rất dễ hiểu, nội dung được cập nhật mới nhất. Tôi đã học được rất nhiều kiến thức hữu ích từ khóa học này.",
      rating: 5,
      createdAt: "2024-11-07",
      likes: 12,
      isLiked: false
    },
    {
      id: "2",
      user: {
        id: "user2",
        name: "Trần Thị B",
        avatar: ""
      },
      content: "Nội dung khóa học khá tốt, tuy nhiên tôi mong muốn có thêm nhiều bài tập thực hành hơn nữa.",
      rating: 4,
      createdAt: "2024-11-06",
      likes: 8,
      isLiked: true
    },
    {
      id: "3",
      user: {
        id: "user3",
        name: "Lê Văn C",
        avatar: ""
      },
      content: "Excellent course! Very comprehensive and well-structured. Highly recommend to anyone wanting to learn this subject.",
      rating: 5,
      createdAt: "2024-11-05",
      likes: 15,
      isLiked: false
    }
  ]

  const displayComments = comments.length > 0 ? comments : mockComments

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return
    
    setIsSubmitting(true)
    
    // TODO: Implement API call to submit comment
    console.log('Submitting comment:', {
      courseId,
      content: newComment,
      rating: newRating
    })
    
    // Simulate API delay
    setTimeout(() => {
      setNewComment("")
      setNewRating(5)
      setIsSubmitting(false)
    }, 1000)
  }

  const handleLikeComment = (commentId: string) => {
    // TODO: Implement like functionality
    console.log('Liking comment:', commentId)
  }

  return (
    <div className="space-y-6">
      {/* Comments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Đánh giá từ học viên ({displayComments.length})
          </h3>
        </div>

        {displayComments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="px-6 py-2">
              <div className="flex gap-4">
                {/* User Avatar */}
                <Avatar className="w-10 h-10">
                  <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(comment.user.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Comment Content */}
                <div className="flex-1 space-y-2">
                  {/* User Info & Rating */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{comment.user.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {renderStars(comment.rating)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {comment.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-2">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        comment.isLiked 
                          ? 'text-blue-600 hover:text-blue-700' 
                          : 'text-muted-foreground hover:text-blue-600'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default CourseComment