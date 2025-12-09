"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatVND } from "@/lib/format"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import type { TopStudent } from "@/types/revenue"

interface TopStudentsProps {
  students: TopStudent[]
  isLoading?: boolean
  isError?: boolean
}

export function TopStudents({ students, isLoading, isError }: TopStudentsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Học viên hàng đầu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Học viên hàng đầu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Không thể tải dữ liệu học viên
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!students || students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Học viên hàng đầu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Chưa có dữ liệu học viên
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Học viên hàng đầu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.map((student, index) => {
            const initials = student.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)

            const lastActiveText = student.lastActive
              ? formatDistanceToNow(new Date(student.lastActive), {
                  addSuffix: true,
                  locale: vi,
                })
              : "Chưa có hoạt động"

            return (
              <div
                key={student.id}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback className="bg-purple-100 text-purple-700">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">
                      {student.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {student.email}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-green-600">
                    {formatVND(student.totalSpent)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {student.coursesEnrolled} khóa học
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
