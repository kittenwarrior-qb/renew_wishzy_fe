"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"
import QueryController from "@/components/shared/common/QueryController"
import { AdminDataErrorState } from "@/components/shared/admin/AdminDataErrorState"
import { TruncateTooltipWrapper } from "@/components/shared/common/TruncateTooltipWrapper"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAdminFeedbackList, type AdminFeedback } from "@/hooks/useAdminFeedback"
import { Star } from "lucide-react"

export default function FeedbacksPage() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"
  const router = useRouter()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get("page") || 1)
  const limit = Number(searchParams.get("limit") || 10)
  const courseId = searchParams.get("courseId") || ""

  const updateUrl = (updates: { page?: number; limit?: number; courseId?: string }) => {
    const qs = new URLSearchParams(searchParams.toString())
    
    if (updates.page) qs.set("page", String(updates.page))
    if (updates.limit) qs.set("limit", String(updates.limit))
    
    if (updates.courseId !== undefined) {
      if (updates.courseId) qs.set("courseId", updates.courseId)
      else qs.delete("courseId")
    }

    const href = `/${locale}/admin/communication/feedbacks?${qs.toString()}`
    router.replace(href)
  }

  const { data, isPending, isFetching, isError, refetch } = useAdminFeedbackList({
    page,
    limit,
    courseId: courseId || undefined,
  })

  const items = data?.data ?? []
  const total = data?.total ?? 0
  const currentPage = data?.page ?? page
  const pageSize = data?.limit ?? limit
  const baseIndex = (currentPage - 1) * pageSize

  const [detail, setDetail] = React.useState<AdminFeedback | null>(null)
  const [openDetail, setOpenDetail] = React.useState(false)

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )

  const columns: Column<AdminFeedback & any>[] = [
    {
      key: "stt",
      title: "STT",
      align: "center",
      type: "short",
      width: 70,
      render: (_v: unknown, _r: AdminFeedback, i: number) => baseIndex + i + 1,
    },
    {
      key: "user",
      title: "Người dùng",
      render: (row: AdminFeedback) => (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{row.user?.email || row.userId}</span>
        </div>
      ),
    },
    {
      key: "course",
      title: "Khoá học",
      render: (row: AdminFeedback) => (
        <Link
          href={`/${locale}/course-detail/${row.courseId}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {row.course?.thumbnail && (
            <img
              src={row.course.thumbnail}
              alt={row.course.name || "Course"}
              className="w-12 h-8 object-cover rounded"
            />
          )}
          <span className="text-sm text-primary hover:underline line-clamp-2">
            {row.course?.name || row.courseId}
          </span>
        </Link>
      ),
    },
    {
      key: "rating",
      title: "Đánh giá",
      type: "short",
      align: "center",
      render: (row: AdminFeedback) => (
        <div className="flex flex-col items-center gap-1">
          {renderStars(row.rating)}
          <span className="text-xs text-muted-foreground">{row.rating}/5</span>
        </div>
      ),
    },
    {
      key: "content",
      title: "Nội dung",
      render: (row: AdminFeedback) => (
        <TruncateTooltipWrapper className="max-w-[320px]">
          {row.content}
        </TruncateTooltipWrapper>
      ),
    },
    {
      key: "likes",
      title: "👍",
      type: "short",
      align: "center",
      render: (row: AdminFeedback) => row.like || 0,
    },
    {
      key: "dislikes",
      title: "👎",
      type: "short",
      align: "center",
      render: (row: AdminFeedback) => row.dislike || 0,
    },
    {
      key: "createdAt",
      title: "Thời gian",
      type: "short",
      align: "center",
      render: (row: AdminFeedback) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Hành động",
      type: "action",
      align: "center",
      render: (row: AdminFeedback) => (
        <button
          type="button"
          className="h-8 px-3 inline-flex items-center justify-center rounded border text-xs hover:bg-accent cursor-pointer"
          onClick={() => {
            setDetail(row)
            setOpenDetail(true)
          }}
        >
          Xem
        </button>
      ),
    },
  ]

  return (
    <div className="relative p-4 md:p-6">
      <div className="mb-3">
        <h1 className="text-lg font-semibold mb-2">Quản lý Feedback</h1>
        <p className="text-sm text-muted-foreground">
          Xem đánh giá từ học viên về các khóa học
        </p>
      </div>

      <LoadingOverlay show={isPending || isFetching} />

      <QueryController
        initial={{ courseId: courseId }}
        debounceMs={300}
        onChange={(q) => {
          updateUrl({ courseId: (q as any).courseId, page: 1 })
        }}
      >
        {({ query, setQuery, reset }) => (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <input
              value={query.courseId || ""}
              onChange={(e) => setQuery({ courseId: e.target.value })}
              placeholder="Lọc theo ID khoá học..."
              className="h-9 rounded border px-3 text-sm w-64"
            />
            <button
              type="button"
              className="h-9 px-3 border rounded text-sm"
              onClick={reset}
            >
              Reset
            </button>
          </div>
        )}
      </QueryController>

      {isError ? (
        <AdminDataErrorState
          title="Không thể tải danh sách feedback"
          onRetry={() => refetch()}
        />
      ) : (
        <DynamicTable
          columns={columns}
          data={items as any}
          loading={isPending || isFetching}
          pagination={{
            totalItems: total,
            currentPage,
            itemsPerPage: pageSize,
            onPageChange: (np) => updateUrl({ page: np }),
            pageSizeOptions: [10, 20, 50],
            onPageSizeChange: (sz) => updateUrl({ limit: sz, page: 1 }),
          }}
        />
      )}

      <Dialog
        open={openDetail}
        onOpenChange={(open) => {
          setOpenDetail(open)
          if (!open) setDetail(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết Feedback</DialogTitle>
          </DialogHeader>
          {detail ? (
            <div className="space-y-4 text-sm">
              {/* Rating */}
              <div className="flex items-center gap-3">
                {renderStars(detail.rating)}
                <span className="font-semibold">{detail.rating}/5</span>
              </div>
              
              {/* User Info */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">Người dùng:</span>
                <div className="mt-1">
                  <p>{detail.user?.name || "Ẩn danh"}</p>
                  <p className="text-muted-foreground text-xs">{detail.user?.email || detail.userId}</p>
                </div>
              </div>

              {/* Course Info */}
              <div>
                <span className="font-medium">Khoá học:</span>{" "}
                <Link
                  href={`/${locale}/course-detail/${detail.courseId}`}
                  className="text-primary hover:underline break-all"
                >
                  {detail.course?.name || detail.courseId}
                </Link>
              </div>

              {/* Engagement */}
              <div className="flex items-center gap-4">
                <span>👍 {detail.like || 0}</span>
                <span>👎 {detail.dislike || 0}</span>
              </div>

              {/* Timestamps */}
              <div>
                <span className="font-medium">Thời gian:</span>{" "}
                <span className="text-muted-foreground">
                  {new Date(detail.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>

              {/* Content */}
              <div className="pt-2 border-t">
                <div className="font-medium mb-1">Nội dung</div>
                <p className="whitespace-pre-wrap text-sm">{detail.content}</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
