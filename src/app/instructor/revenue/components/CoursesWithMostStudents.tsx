"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Star } from "lucide-react"
import Image from "next/image"
import type { CourseRevenue } from "@/types/revenue"

interface CoursesWithMostStudentsProps {
  courses: CourseRevenue[]
}

export function CoursesWithMostStudents({ courses }: CoursesWithMostStudentsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Khóa học có nhiều học viên nhất
        </CardTitle>
        <CardDescription>
          Top {courses.length} khóa học có số lượng học viên đăng ký nhiều nhất
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course, index) => (
            <div
              key={course.courseId}
              className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="relative flex-shrink-0">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.courseName}
                    width={120}
                    height={80}
                    className="rounded-md object-cover"
                  />
                ) : (
                  <div className="w-[120px] h-[80px] bg-muted rounded-md flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No image</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm line-clamp-2">
                    {course.courseName}
                  </h4>
                  <Badge variant="secondary" className="flex-shrink-0">
                    {index + 1}
                  </Badge>
                </div>
                {course.categoryName && (
                  <Badge variant="outline" className="text-xs mb-2">
                    {course.categoryName}
                  </Badge>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  {course.averageRating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{course.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                  <span className="font-semibold text-primary">
                    {course.totalStudents} học viên
                  </span>
                  <span>{course.totalSales} đơn hàng</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-primary">
                  {formatCurrency(course.totalRevenue)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(course.price)}/khóa
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

