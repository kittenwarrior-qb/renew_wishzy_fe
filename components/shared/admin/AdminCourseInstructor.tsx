"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Instructor = {
  id?: string
  fullName?: string
  email?: string
  avatar?: string
  bio?: string
}

function initials(name?: string) {
  const n = (name || "?").trim()
  if (!n) return "?"
  return n.split(" ").slice(0, 2).map(w => w.charAt(0)).join("").toUpperCase()
}

export default function AdminCourseInstructor({ instructor }: { instructor?: Instructor | null }) {
  return (
    <section className="space-y-3">
      <div className="border-b pb-2">
        <h3 className="text-sm font-medium text-foreground">Giảng viên</h3>
      </div>
      {!instructor ? (
        <div className="text-sm text-muted-foreground">Chưa có thông tin giảng viên.</div>
      ) : (
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 ring-1 ring-border">
            <AvatarImage src={instructor.avatar || ""} alt={instructor.fullName || "Instructor"} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials(instructor.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            {instructor.bio ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <div className="text-sm font-medium text-foreground">{instructor.fullName || "Giảng viên"}</div>
                  <div className="text-xs text-muted-foreground">Giảng viên</div>
                </div>
                <div className="md:text-right">
                  {instructor.email ? (
                    <a href={`mailto:${instructor.email}`} className="text-xs text-muted-foreground hover:underline">{instructor.email}</a>
                  ) : null}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm font-medium text-foreground">{instructor.fullName || "Giảng viên"}</div>
                <div className="text-xs text-muted-foreground">Giảng viên</div>
                {instructor.email ? (
                  <a href={`mailto:${instructor.email}`} className="text-xs text-muted-foreground mt-1 hover:underline">{instructor.email}</a>
                ) : null}
              </div>
            )}
            {instructor.bio ? (
              <p className="text-sm text-muted-foreground leading-6 line-clamp-3">{instructor.bio}</p>
            ) : null}
          </div>
        </div>
      )}
    </section>
  )
}
