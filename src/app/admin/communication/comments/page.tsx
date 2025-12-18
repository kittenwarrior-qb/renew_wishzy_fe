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
import { useAdminCommentList, type AdminComment } from "@/components/shared/comment/useAdminComment"

export default function Page() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"
  const router = useRouter()
  const searchParams = useSearchParams()

  const [page, setPage] = React.useState<number>(Number(searchParams.get("page") || 1))
  const [limit, setLimit] = React.useState<number>(Number(searchParams.get("limit") || 10))

  const [filter, setFilter] = React.useState<{ courseId?: string }>(() => ({
    courseId: searchParams.get("courseId") || "",
  }))

  React.useEffect(() => {
    const qs = new URLSearchParams()
    if (filter.courseId) qs.set("courseId", filter.courseId)
    if (page !== 1) qs.set("page", String(page))
    if (limit !== 10) qs.set("limit", String(limit))

    const href = `/admin/communication/comments${qs.toString() ? `?${qs.toString()}` : ""}`
    const current = `${window.location.pathname}${window.location.search}`
    if (current !== href) router.replace(href)
  }, [filter, page, limit, router])

  const { data, isPending, isFetching, isError, refetch } = useAdminCommentList({
    page,
    limit,
    courseId: filter.courseId || undefined,
  })

  const items = data?.data ?? []
  const total = data?.total ?? 0
  const currentPage = data?.page ?? page
  const pageSize = data?.limit ?? limit
  const baseIndex = (currentPage - 1) * pageSize

  const [detail, setDetail] = React.useState<AdminComment | null>(null)
  const [openDetail, setOpenDetail] = React.useState(false)

  const columns: Column<AdminComment & any>[] = [
    {
      key: "stt",
      title: "STT",
      align: "center",
      type: "short",
      width: 70,
      render: (_v: unknown, _r: AdminComment, i: number) => baseIndex + i + 1,
    },
    {
      key: "courseId",
      title: "Khoá học",
      render: (row: AdminComment) => (
        <Link
          href={`/course-detail/${row.courseId}`}
          className="text-xs text-primary hover:underline"
        >
          {row.courseId}
        </Link>
      ),
    },
    {
      key: "userId",
      title: "Người dùng",
      render: (row: AdminComment) => (
        <span className="text-xs text-muted-foreground">{row.userId}</span>
      ),
    },
    {
      key: "rating",
      title: "Đánh giá",
      type: "short",
      align: "center",
      render: (row: AdminComment) => (row.rating != null ? row.rating.toFixed(1) : "-") as any,
    },
    {
      key: "content",
      title: "Nội dung",
      render: (row: AdminComment) => (
        <TruncateTooltipWrapper className="max-w-[320px]">
          {row.content}
        </TruncateTooltipWrapper>
      ),
    },
    {
      key: "likes",
      title: "Like",
      type: "short",
      align: "center",
      render: (row: AdminComment) => row.likes,
    },
    {
      key: "dislikes",
      title: "Dislike",
      type: "short",
      align: "center",
      render: (row: AdminComment) => row.dislikes,
    },
    {
      key: "createdAt",
      title: "Thời gian",
      type: "short",
      align: "center",
      render: (row: AdminComment) => (
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
      render: (row: AdminComment) => (
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
        <h1 className="text-lg font-semibold mb-2">Bình luận (Giao tiếp)</h1>
      </div>

      <LoadingOverlay show={isPending || isFetching} />

      <QueryController
        initial={{ courseId: filter.courseId || "" }}
        debounceMs={300}
        onChange={(q) => {
          setFilter(q as any)
          setPage(1)
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
          title="Không thể tải danh sách bình luận"
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
            onPageChange: (np) => setPage(np),
            pageSizeOptions: [10, 20, 50],
            onPageSizeChange: (sz) => {
              setLimit(sz)
              setPage(1)
            },
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
            <DialogTitle>Chi tiết bình luận</DialogTitle>
          </DialogHeader>
          {detail ? (
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Khoá học:</span>{" "}
                <Link
                  href={`/course-detail/${detail.courseId}`}
                  className="text-primary hover:underline break-all"
                >
                  {detail.courseId}
                </Link>
              </div>
              <div>
                <span className="font-medium">Người dùng:</span>{" "}
                <span className="text-muted-foreground break-all">{detail.userId}</span>
              </div>
              <div>
                <span className="font-medium">Đánh giá:</span>{" "}
                <span>{detail.rating}</span>
              </div>
              <div>
                <span className="font-medium">Thời gian:</span>{" "}
                <span className="text-muted-foreground">
                  {new Date(detail.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
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
