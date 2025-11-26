"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { CommentFilter } from "@/types/comment"
import { Search } from "lucide-react"

interface CommentFilterProps {
  filter: CommentFilter
  onFilterChange: (filter: CommentFilter) => void
  courses?: Array<{ id: string; name: string }>
}

export function CommentFilter({ filter, onFilterChange, courses = [] }: CommentFilterProps) {
  const handleChange = (key: keyof CommentFilter, value: any) => {
    onFilterChange({ ...filter, [key]: value, page: 1 }) // Reset về page 1 khi filter
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Search (nếu cần) */}
      <div className="space-y-2">
        <Label>Khóa học</Label>
        <Select
          value={filter.courseId || "__all"}
          onValueChange={(v) => handleChange("courseId", v === "__all" ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tất cả khóa học" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">Tất cả khóa học</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2">
        <Label>Đánh giá</Label>
        <Select
          value={filter.rating ? String(filter.rating) : "__all"}
          onValueChange={(v) => handleChange("rating", v === "__all" ? undefined : Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tất cả đánh giá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">Tất cả đánh giá</SelectItem>
            <SelectItem value="5">5 sao</SelectItem>
            <SelectItem value="4">4 sao</SelectItem>
            <SelectItem value="3">3 sao</SelectItem>
            <SelectItem value="2">2 sao</SelectItem>
            <SelectItem value="1">1 sao</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Has Reply Filter */}
      <div className="space-y-2">
        <Label>Trạng thái</Label>
        <Select
          value={
            filter.hasReply === undefined
              ? "__all"
              : filter.hasReply
              ? "replied"
              : "unreplied"
          }
          onValueChange={(v) =>
            handleChange("hasReply", v === "__all" ? undefined : v === "replied")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">Tất cả</SelectItem>
            <SelectItem value="replied">Đã phản hồi</SelectItem>
            <SelectItem value="unreplied">Chưa phản hồi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label>Sắp xếp</Label>
        <Select
          value={filter.sort || "newest"}
          onValueChange={(v) => handleChange("sort", v as CommentFilter["sort"])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="oldest">Cũ nhất</SelectItem>
            <SelectItem value="rating_high">Đánh giá cao nhất</SelectItem>
            <SelectItem value="rating_low">Đánh giá thấp nhất</SelectItem>
            <SelectItem value="likes">Nhiều like nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

