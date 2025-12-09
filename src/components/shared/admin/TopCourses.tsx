"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Users, TrendingUp } from "lucide-react"
import type { HotCourse } from "@/types/revenue"
import { formatVND } from "@/lib/format"
import Image from "next/image"

interface TopCoursesProps {
  hotCourses?: HotCourse[]
  total?: number
  isLoading?: boolean
  isError?: boolean
}

export function TopCourses({ hotCourses = [], total = 0, isLoading, isError }: TopCoursesProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Khóa học nổi bật</h3>
          <Badge variant="secondary">
            <div className="h-4 w-8 bg-gray-300 rounded animate-pulse" />
          </Badge>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 p-3 border rounded-lg animate-pulse">
              <div className="h-16 w-24 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-gray-200 rounded" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-40 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Khóa học nổi bật</h3>
        </div>
        <p className="text-sm text-muted-foreground">Không thể tải dữ liệu khóa học</p>
      </div>
    )
  }

  if (!hotCourses || hotCourses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Khóa học nổi bật</h3>
        </div>
        <p className="text-sm text-muted-foreground">Chưa có dữ liệu khóa học</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Khóa học nổi bật</h3>
        <Badge variant="secondary">{total} khóa học</Badge>
      </div>

      <div className="space-y-3">
        {hotCourses.slice(0, 10).map((course) => (
          <div
            key={course.courseId}
            className="flex gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            {/* Course thumbnail */}
            <div className="relative h-16 w-24 flex-shrink-0 rounded overflow-hidden bg-muted">
              {course.thumbnail ? (
                <Image
                  src={course.thumbnail}
                  alt={course.courseName}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-blue-100 to-purple-100">
                  <span className="text-2xl">📚</span>
                </div>
              )}
              {/* Rank badge */}
              <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {course.rank}
              </div>
            </div>

            {/* Course info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{course.courseName}</h4>
              {course.categoryName && (
                <p className="text-xs text-muted-foreground mt-0.5">{course.categoryName}</p>
              )}

              <div className="flex items-center gap-4 mt-2 text-xs">
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.averageRating.toFixed(1)}</span>
                </div>

                {/* Students */}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{course.totalStudents.toLocaleString()}</span>
                </div>

                {/* Revenue */}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span className="font-medium text-green-600">
                    {formatVND(course.totalRevenue)}
                  </span>
                </div>

                {/* Sales */}
                <div className="text-muted-foreground">
                  <span>{course.totalSales} đơn</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-primary">{formatVND(course.price)}</p>
            </div>
          </div>
        ))}
      </div>

      {hotCourses.length > 10 && (
        <p className="text-xs text-muted-foreground text-center">
          Hiển thị 10/{hotCourses.length} khóa học
        </p>
      )}
    </div>
  )
}
