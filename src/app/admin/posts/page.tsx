"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import { usePostList, useDeletePost } from "@/components/shared/post/usePost"
import type { Post } from "@/services/post"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"
import { TruncateTooltipWrapper } from "@/components/shared/common/TruncateTooltipWrapper"
import { Pencil, Trash2, Filter, Eye, Calendar, Clock, Copy, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore"
import { AdminDataErrorState } from "@/components/shared/admin/AdminDataErrorState"
import { cn } from "@/lib/utils"

export default function Page() {
  const router = useRouter()
  const sp = useSearchParams()
  const { setPrimaryAction } = useAdminHeaderStore()

  const [page, setPage] = React.useState<number>(Number(sp.get("page") || 1))
  const [limit, setLimit] = React.useState<number>(Number(sp.get("limit") || 10))
  const [q, setQ] = React.useState<string>(sp.get("q") || "")
  const [qInput, setQInput] = React.useState<string>(sp.get("q") || "")
  const [status, setStatus] = React.useState<string>("all")

  React.useEffect(() => {
    const qs = new URLSearchParams()
    if (q) qs.set("q", q)
    if (status !== "all") qs.set("status", status)
    if (page !== 1) qs.set("page", String(page))
    if (limit !== 10) qs.set("limit", String(limit))
    const href = `/admin/posts${qs.toString() ? `?${qs.toString()}` : ""}`
    const current = `${window.location.pathname}${window.location.search}`
    if (current !== href) router.replace(href)
  }, [q, page, limit, status, router])

  const { data, isPending, isFetching, isError, refetch } = usePostList({
    page,
    limit,
    q,
    isActive: status === "all" ? undefined : (status === "active" ? true : false)
  })
  const { mutate: deletePost, isPending: deleting } = useDeletePost()
  const [duplicatingId, setDuplicatingId] = React.useState<string | null>(null)

  const handleDuplicate = async (id: string) => {
    try {
      setDuplicatingId(id)
      const { postService } = await import("@/services/post")
      const detail = await postService.get(id)
      const payload = detail?.data ?? detail

      // Filter out system fields
      const { id: _, createdAt: __, updatedAt: ___, views: ____, author: _____, category: ______, comments: _______, ...duplicateData } = payload

      sessionStorage.setItem("wishzy_duplicate_post", JSON.stringify({
        ...duplicateData,
        title: `${duplicateData.title} (Copy)`,
        isActive: false
      }))

      router.push("/admin/posts/create?duplicate=true")
    } catch (e: any) {
      notify({ title: "Lỗi", description: "Không thể lấy thông tin bài viết để nhân bản", variant: "destructive" })
    } finally {
      setDuplicatingId(null)
    }
  }

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const currentPage = data?.page ?? page
  const pageSize = data?.limit ?? limit

  const [openDelete, setOpenDelete] = React.useState(false)
  const [target, setTarget] = React.useState<{ id: string; title: string } | null>(null)

  React.useEffect(() => {
    setPrimaryAction({
      label: "Viết bài",
      variant: "default",
      onClick: () => router.push(`/admin/posts/create`),
    })

    return () => setPrimaryAction(null)
  }, [setPrimaryAction, router])

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

          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
            <SelectTrigger className="w-[140px]">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 opacity-50" />
                <SelectValue placeholder="Trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Công khai</SelectItem>
              <SelectItem value="hidden">Bản nháp</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => { setQ(qInput); setPage(1) }}>Tìm</Button>
        </div>
      </div>

      <div className="relative min-h-[300px]">
        <LoadingOverlay show={isPending || isFetching} />
        <DynamicTable
          columns={(() => {
            type PostRow = Post
            const cols: Column<PostRow>[] = [
              {
                key: "image",
                title: "Ảnh",
                type: "short",
                align: "center",
                render: (row: PostRow) => (
                  row.image ? (
                    <img
                      src={row.image}
                      alt={row.title}
                      className="h-10 w-16 rounded object-cover mx-auto"
                    />
                  ) : (
                    <div className="h-10 w-16 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground mx-auto">
                      No Image
                    </div>
                  )
                ),
              },
              {
                key: "title",
                title: "Tiêu đề",
                render: (row: PostRow) => (
                  <TruncateTooltipWrapper className="max-w-[300px] font-medium">
                    {row.title}
                  </TruncateTooltipWrapper>
                ),
              },
              {
                key: "author",
                title: "Người đăng",
                render: (row: PostRow) => (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{row.author?.fullName || "N/A"}</span>
                    <span className="text-[10px] text-muted-foreground">{row.author?.email || ""}</span>
                  </div>
                ),
              },
              {
                key: "category",
                title: "Danh mục",
                render: (row: PostRow) => (
                  <span className="text-muted-foreground">
                    {row.category?.name || "Uncategorized"}
                  </span>
                ),
              },
              {
                key: "stats",
                title: "Thống kê",
                align: "center",
                render: (row: PostRow) => (
                  <div className="flex flex-col items-center gap-1 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-secondary/30 px-2 py-0.5 rounded-full">
                      <Eye className="h-3 w-3" />
                      <span>{row.views?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                ),
              },
              {
                key: "dates",
                title: "Thời gian",
                render: (row: PostRow) => (
                  <div className="flex flex-col gap-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3 w-3 opacity-70" />
                      <span>{format(new Date(row.createdAt), "dd/MM/yyyy", { locale: vi })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground/60">
                      <Clock className="h-3 w-3 opacity-50" />
                      <span>{format(new Date(row.updatedAt), "HH:mm", { locale: vi })}</span>
                    </div>
                  </div>
                ),
              },
              {
                key: "isActive",
                title: "Trạng thái",
                align: "center",
                render: (row: PostRow) => (
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                    row.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-muted text-muted-foreground border border-transparent"
                  )}>
                    {row.isActive ? "Hoạt động" : "Ẩn"}
                  </span>
                ),
              },
              {
                key: "actions",
                title: "Hành động",
                align: "center",
                type: "action",
                render: (row: PostRow) => (
                  <div className="inline-flex items-center gap-1">
                    <Link
                      href={`/admin/posts/${row.id}`}
                      className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent text-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={duplicatingId === row.id || deleting}
                      onClick={() => handleDuplicate(row.id)}
                      title="Nhân bản"
                    >
                      {duplicatingId === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent text-destructive cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={deleting || !!duplicatingId}
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
