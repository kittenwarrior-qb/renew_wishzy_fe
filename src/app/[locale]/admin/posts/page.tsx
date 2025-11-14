"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import { usePostList, useDeletePost } from "@/components/shared/post/usePost"
import type { PostStatus } from "@/services/post"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Pagination } from "@/components/shared/common/Pagination"
import { Pencil, Trash2, Plus } from "lucide-react"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"

export default function Page() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "vi"
  const router = useRouter()
  const sp = useSearchParams()

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

  const { data, isPending, isFetching, isError } = usePostList({ page, limit, q, status })
  const { mutate: deletePost, isPending: deleting } = useDeletePost()

  const items = data?.data ?? []
  const total = data?.total ?? 0
  const currentPage = data?.page ?? page
  const pageSize = data?.limit ?? limit
  const totalPages = data?.totalPages ?? Math.ceil((total || 0) / (pageSize || 10))

  const [openDelete, setOpenDelete] = React.useState(false)
  const [target, setTarget] = React.useState<{ id: string; title: string } | null>(null)

  return (
    <div className="relative p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Input placeholder="Tìm kiếm..." value={qInput} onChange={(e) => setQInput(e.target.value)} className="w-[260px]" />
          <Button variant="outline" onClick={() => { setQ(qInput); setPage(1) }}>Tìm</Button>
          <Select value={status} onValueChange={(v) => { setStatus(v as any); setPage(1) }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Tất cả trạng thái</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="published">Đã xuất bản</SelectItem>
              <SelectItem value="archived">Lưu trữ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href={`/${locale}/admin/posts/create`} className="inline-flex"><Button className="gap-2"><Plus className="h-4 w-4" /> Viết bài</Button></Link>
      </div>

      <div className="relative min-h-[300px]">
        <LoadingOverlay show={isPending || isFetching} />

        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left">Tiêu đề</th>
                <th className="px-3 py-2 text-left">Slug</th>
                <th className="px-3 py-2 text-left">Trạng thái</th>
                <th className="px-3 py-2 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isError ? (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-destructive">Lỗi tải dữ liệu</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">Không có dữ liệu</td></tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2 font-medium">{p.title}</td>
                    <td className="px-3 py-2 text-muted-foreground">/{p.slug}</td>
                    <td className="px-3 py-2">{p.status}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link href={`/${locale}/admin/posts/${p.id}`} className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent"><Pencil className="h-4 w-4" /></Link>
                        <button type="button" className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent text-destructive" disabled={deleting} onClick={() => { setTarget({ id: p.id, title: p.title }); setOpenDelete(true) }}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <Pagination pagination={{ totalItems: total, totalPages, currentPage, itemsPerPage: pageSize }} onPageChange={(p) => setPage(p)} size="sm" />
        </div>
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
