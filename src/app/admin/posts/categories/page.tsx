"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"
import { Pencil, Trash2 } from "lucide-react"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore"
import { categoryBlogService, type CategoryBlog } from "@/services/category-blog"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notify } from "@/components/shared/admin/Notifications"

export default function Page() {
  const { setPrimaryAction } = useAdminHeaderStore()
  const qc = useQueryClient()

  const [openDialog, setOpenDialog] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  // Pagination State
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)

  // Form State
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")

  const [openDelete, setOpenDelete] = React.useState(false)
  const [targetDelete, setTargetDelete] = React.useState<{ id: string; name: string } | null>(null)

  // Fetch Categories
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['category-blogs', 'list', page, limit],
    queryFn: async () => {
      return await categoryBlogService.list({ page, limit })
    }
  })

  const payload = response?.data ?? response
  const categories: CategoryBlog[] = payload?.items ?? payload?.data ?? []
  const meta = payload?.meta ?? payload?.pagination ?? {}

  // Mutations
  const { mutate: createCategory, isPending: creating } = useMutation({
    mutationFn: (data: any) => categoryBlogService.create(data),
    onSuccess: () => {
      notify({ title: "Tạo danh mục thành công", variant: "success" })
      setOpenDialog(false)
      qc.invalidateQueries({ queryKey: ['category-blogs'] })
      refetch()
    },
    onError: (e: any) => notify({ title: "Lỗi", description: e.message, variant: "destructive" })
  })

  const { mutate: updateCategory, isPending: updating } = useMutation({
    mutationFn: (data: { id: string, payload: any }) => categoryBlogService.update(data.id, data.payload),
    onSuccess: () => {
      notify({ title: "Cập nhật thành công", variant: "success" })
      setOpenDialog(false)
      qc.invalidateQueries({ queryKey: ['category-blogs'] })
      refetch()
    },
    onError: (e: any) => notify({ title: "Lỗi", description: e.message, variant: "destructive" })
  })

  const { mutate: deleteCategory, isPending: deleting } = useMutation({
    mutationFn: (id: string) => categoryBlogService.remove(id),
    onSuccess: () => {
      notify({ title: "Xoá thành công", variant: "success" })
      setOpenDelete(false)
      qc.invalidateQueries({ queryKey: ['category-blogs'] })
      refetch()
    },
    onError: (e: any) => notify({ title: "Lỗi", description: e.message, variant: "destructive" })
  })

  // Handlers
  const handleOpenCreate = () => {
    setEditingId(null)
    setName("")
    setDescription("")
    setOpenDialog(true)
  }

  const handleOpenEdit = (c: CategoryBlog) => {
    setEditingId(c.id)
    setName(c.name)
    setDescription(c.description || "")
    setOpenDialog(true)
  }

  const handleSave = () => {
    if (!name.trim()) return
    const payload = { name, description }

    if (editingId) {
      updateCategory({ id: editingId, payload })
    } else {
      createCategory(payload)
    }
  }

  React.useEffect(() => {
    setPrimaryAction({
      label: "Tạo danh mục",
      variant: "default",
      onClick: handleOpenCreate,
    })
    return () => setPrimaryAction(null)
  }, [setPrimaryAction])

  const loading = isLoading || creating || updating || deleting

  // Columns
  const columns: Column<CategoryBlog>[] = [
    {
      key: "name",
      title: "Tên danh mục",
      render: (row: CategoryBlog) => <span className="font-semibold">{row.name}</span>
    },
    {
      key: "description",
      title: "Mô tả",
      render: (row: CategoryBlog) => <span className="text-muted-foreground text-sm line-clamp-1">{row.description}</span>
    },
    {
      key: "actions",
      title: "Hành động",
      align: "center",
      type: "action",
      render: (row: CategoryBlog) => (
        <div className="flex items-center justify-center gap-2">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setTargetDelete(row); setOpenDelete(true) }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="p-4 md:p-6 relative">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Danh mục bài viết</h1>
        <p className="text-sm text-muted-foreground">Quản lý các danh mục cho bài viết blog</p>
      </div>

      <LoadingOverlay show={loading} />

      <div className="border rounded-md">
        <DynamicTable
          data={categories}
          columns={columns}
          loading={isLoading}
          pagination={{
            currentPage: payload?.pagination?.currentPage || 1,
            totalItems: payload?.pagination?.totalItems || categories.length,
            itemsPerPage: limit,
            onPageChange: (p) => setPage(p),
            pageSizeOptions: [10, 20, 50, 100],
            onPageSizeChange: (sz) => {
              setLimit(sz)
              setPage(1)
            }
          }}
        />
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên danh mục</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nhập tên danh mục..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả danh mục..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Huỷ</Button>
            <Button onClick={handleSave} disabled={!name.trim() || creating || updating}>
              {editingId ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Xoá danh mục"
        description={<span>Bạn có chắc muốn xoá danh mục "<b>{targetDelete?.name}</b>"?</span>}
        confirmText="Xoá"
        confirmVariant="destructive"
        onConfirm={() => targetDelete && deleteCategory(targetDelete.id)}
        loading={deleting}
      />
    </div>
  )
}
