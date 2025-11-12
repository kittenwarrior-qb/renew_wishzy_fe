"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useUserEnrollments } from "@/components/shared/enrollment/useEnrollment"
import { useAppStore } from "@/stores/useAppStore"
import { Inbox } from "lucide-react"

export default function UserEnrollmentsPage() {
  const params = useParams<{ locale: string; userId: string }>()
  const userId = params?.userId
  const { theme } = useAppStore()
  const logoSrc = theme === "dark" ? "/images/white-logo.png" : "/images/black-logo.png"

  const { data, isPending, isError } = useUserEnrollments(userId)
  const items = data ?? []

  return (
    <div className="relative">
      {isPending ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <img src={logoSrc} alt="Wishzy" className="h-10 w-auto opacity-90" />
            <div aria-label="loading" className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Đang tải dữ liệu...</span>
          </div>
        </div>
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Học viên - Enrollments</h1>
      </div>

      {isError ? (
        <div className="py-16 text-center text-sm text-destructive">Lỗi tải dữ liệu</div>
      ) : items.length === 0 ? (
        <div className="py-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Inbox className="h-10 w-10 text-muted-foreground/60" />
            <span>Không có enrollment</span>
          </div>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-2 text-left">Khóa học</th>
                <th className="p-2 text-center">Trạng thái</th>
                <th className="p-2 text-center">Tiến độ</th>
                <th className="p-2 text-center">Lần truy cập cuối</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {e.course?.thumbnail ? (
                        <img src={e.course.thumbnail} alt={e.course.name} className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs">{(e.course?.name || "?").slice(0,1).toUpperCase()}</div>
                      )}
                      <div className="font-medium">{e.course?.name || "-"}</div>
                    </div>
                  </td>
                  <td className="p-2 text-center capitalize">{(e.status || "").toLowerCase()}</td>
                  <td className="p-2 text-center">{typeof e.progress === "number" ? `${e.progress}%` : "-"}</td>
                  <td className="p-2 text-center">{e.lastAccess ? new Date(e.lastAccess).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


