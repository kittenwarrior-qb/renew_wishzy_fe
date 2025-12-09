"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Users, BookOpen } from "lucide-react"
import type { TopInstructor } from "@/types/revenue"

interface TopInstructorsProps {
  instructors: TopInstructor[]
  isLoading?: boolean
  isError?: boolean
}

export function TopInstructors({ instructors, isLoading, isError }: TopInstructorsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Giảng viên hàng đầu</CardTitle>
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
          <CardTitle>Giảng viên hàng đầu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Không thể tải dữ liệu giảng viên
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!instructors || instructors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Giảng viên hàng đầu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Chưa có dữ liệu giảng viên
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Giảng viên hàng đầu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {instructors.map((instructor) => {
            const initials = instructor.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)

            return (
              <div
                key={instructor.id}
                className="flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={instructor.avatar} alt={instructor.fullName} />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">
                      {instructor.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {instructor.email}
                    </p>
                    {instructor.specialties.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {instructor.specialties.slice(0, 2).map((specialty, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs px-2 py-0"
                          >
                            {specialty}
                          </Badge>
                        ))}
                        {instructor.specialties.length > 2 && (
                          <Badge variant="secondary" className="text-xs px-2 py-0">
                            +{instructor.specialties.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">
                      {instructor.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{instructor.courses}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{instructor.students}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
