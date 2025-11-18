"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import { usePostList, useDeletePost } from "@/components/shared/post/usePost"
import type { PostStatus, Post } from "@/services/post"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"
import { TruncateTooltipWrapper } from "@/components/shared/common/TruncateTooltipWrapper"
import { Pencil, Trash2, Plus } from "lucide-react"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore"
import { AdminDataErrorState } from "@/components/shared/admin/AdminDataErrorState"

export default function Page() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"
  const router = useRouter()
  const sp = useSearchParams()
  const { setPrimaryAction } = useAdminHeaderStore()

  const [page, setPage] = React.useState<number>(Number(sp.get("page") || 1))
  const [limit, setLimit] = React.useState<number>(Number(sp.get("limit") || 10))
  const [q, setQ] = React.useState<string>(sp.get("q") || "")
  const [qInput, setQInput] = React.useState<string>(sp.get("q") || "")
  const [status, setStatus] = React.useState<PostStatus | "__all">((sp.get("status") as any) || "__all")

  React.useEffect(() => {
    const qs = new URLSearchParams()
    if (q) qs.set("q", q)
    if (status && status !== "__all") qs.set("status", status)
    if (page !== 1) qs.set("page", String(page))
    if (limit !== 10) qs.set("limit", String(limit))
    const href = `/${locale}/admin/posts${qs.toString() ? `?${qs.toString()}` : ""}`
    const current = `${window.location.pathname}${window.location.search}`
    if (current !== href) router.replace(href)
  }, [q, status, page, limit, locale, router])

  const { data, isPending, isFetching, isError, refetch } = usePostList({ page, limit, q, status })
  const { mutate: deletePost, isPending: deleting } = useDeletePost()

  const items = data?.data ?? []
  const total = data?.total ?? 0
  const currentPage = data?.page ?? page
  const pageSize = data?.limit ?? limit
  const totalPages = data?.totalPages ?? Math.ceil((total || 0) / (pageSize || 10))

  const [openDelete, setOpenDelete] = React.useState(false)
  const [target, setTarget] = React.useState<{ id: string; title: string } | null>(null)

  React.useEffect(() => {
    setPrimaryAction({
      label: "Viết bài",
      variant: "default",
      onClick: () => router.push(`/${locale}/admin/posts/create`),
    })

    return () => setPrimaryAction(null)
  }, [setPrimaryAction, router, locale])

  if (isError) {
    return (
      <div className="relative">
        <AdminDataErrorState
          title="Không thể tải danh sách bài viết"
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="relative p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Input placeholder="Tìm kiếm..." value={qInput} onChange={(e) => setQInput(e.target.value)} className="w-[260px]" />
          <Button variant="outline" onClick={() => { setQ(qInput); setPage(1) }}>Tìm</Button>
          <Select value={status} onValueChange={(v) => { setStatus(v as any); setPage(1) }}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Tất cả trạng thái</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="published">Đã xuất bản</SelectItem>
              <SelectItem value="archived">Lưu trữ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative min-h-[300px]">
        <LoadingOverlay show={isPending || isFetching} />
        <DynamicTable
          columns={(() => {
            type PostRow = Post
            const cols: Column<PostRow>[] = [
              {
                key: "title",
                title: "Tiêu đề",
                render: (row: PostRow) => (
                  <TruncateTooltipWrapper className="max-w-[260px]">
                    {row.title}
                  </TruncateTooltipWrapper>
                ),
              },
              {
                key: "slug",
                title: "Slug",
                render: (row: PostRow) => (
                  <span className="text-muted-foreground">/{row.slug}</span>
                ),
              },
              {
                key: "status",
                title: "Trạng thái",
                align: "center",
                render: (row: PostRow) => (
                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize">
                    {row.status}
                  </span>
                ),
              },
              {
                key: "actions",
                title: "Hành động",
                align: "right",
                type: "action",
                render: (row: PostRow) => (
                  <div className="inline-flex items-center gap-1">
                    <Link
                      href={`/${locale}/admin/posts/${row.id}`}
                      className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent text-destructive cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={deleting}
                      onClick={() => { setTarget({ id: row.id, title: row.title }); setOpenDelete(true) }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ),
              },
            ]
            return cols
          })()}
          data={items as Post[]}
          loading={isPending || isFetching}
          pagination={{
            totalItems: total,
            currentPage,
            itemsPerPage: pageSize,
            onPageChange: (p) => setPage(p),
            pageSizeOptions: [10, 20, 50],
            onPageSizeChange: (sz) => {
              setLimit(sz)
              setPage(1)
            },
          }}
        />
      </div>

      <ConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Xoá bài viết"
        description={<span>Bạn có chắc xoá bài "<b>{target?.title}</b>"?</span>}
        confirmText={deleting ? "Đang xoá..." : "Xoá"}
        confirmVariant="destructive"
        loading={deleting}
        onConfirm={() => {
          if (!target) return
          deletePost({ id: target.id }, { onSuccess: () => setOpenDelete(false) })
        }}
      />
    </div>
  )
}
