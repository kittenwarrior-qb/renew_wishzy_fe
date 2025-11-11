"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export type FeedbackItem = {
  id: string
  user: { id: string; name: string; avatar?: string }
  rating: number
  content: string
  createdAt: string
}

export default function AdminCourseFeedback({
  courseId,
  feedback = [],
}: {
  courseId: string
  feedback?: FeedbackItem[]
}) {
  const items = feedback

  const avg = items.length ? items.reduce((s, i) => s + (i.rating || 0), 0) / items.length : 0

  const renderStars = (rating: number) => (
    <div className="inline-flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  )

  const initials = (name?: string) => (name || "?").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Đánh giá & phản hồi</h3>
        <div className="flex items-center gap-2 text-xs">
          {renderStars(Math.round(avg))}
          <span className="rounded-md border px-1.5 py-0.5 font-medium">{avg.toFixed(1)}</span>
          <span className="text-muted-foreground">· {items.length} đánh giá</span>
        </div>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">Chưa có phản hồi nào.</div>
        ) : (
          items.map((c) => (
            <div key={c.id} className="flex gap-3 rounded border border-muted-foreground/20 p-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={c.user.avatar || ''} alt={c.user.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials(c.user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="truncate text-sm font-medium">{c.user.name}</div>
                  <div className="shrink-0 text-[11px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
                <div className="mt-0.5">{renderStars(c.rating)}</div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">{c.content}</p>
              </div>
              <div className="hidden md:flex items-start gap-2 pl-2">
                {/* actions placeholder */}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
