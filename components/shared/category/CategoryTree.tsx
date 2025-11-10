"use client"

import * as React from "react"
import { ChevronDown, Folder, FolderOpen, Plus, Pencil, Trash2 } from "lucide-react"
import { useSubCategories, useCategoryDetail, useCreateCategory, useUpdateCategory, useDeleteCategory, useParentCategories, useSubCategoriesCount } from "@/components/shared/category/useCategory"
import type { Category } from "@/types/category"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CategoryForm, type CategoryFormValue } from "@/components/shared/category/CategoryForm"
import { validateCategoryName, normalizeSpaces } from "@/lib/validators"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { notify } from "@/components/shared/admin/Notifications"

function TreeToggle({ open }: { open: boolean }) {
    return <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
}

function ChildCount({ parentId }: { parentId: string }) {
    const { data } = useSubCategoriesCount(parentId)
    const total = data?.total ?? 0
    return <span className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-accent/20 px-1.5 text-[10px] font-medium text-accent-foreground/80">{total}</span>
}

function TreeRow({
    cat,
    depth,
    onSelect,
    onAdd,
    onEdit,
    onDelete,
}: {
    cat: Category
    depth: number
    onSelect?: (c: Category) => void
    onAdd?: (parent: Category) => void
    onEdit?: (c: Category) => void
    onDelete?: (c: Category) => void
}) {
    const [open, setOpen] = React.useState(false)
    const hasChildren = !!cat?.id // true; we'll fetch to confirm count
    const indent = depth * 16
    return (
        <div className="select-none">
            <div className="group flex items-center gap-2 rounded-sm px-2 py-2 transition-colors hover:bg-muted/60" style={{ paddingLeft: indent }}>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 text-left cursor-pointer"
                    onClick={() => setOpen((v) => !v)}
                    title={open ? "Thu gọn" : "Mở rộng"}
                >
                    {hasChildren ? <TreeToggle open={open} /> : <span className="inline-block w-4" />}
                    {open ? <FolderOpen className="h-4 w-4 text-foreground/70" /> : <Folder className="h-4 w-4 text-foreground/70" />}
                    <span className="font-medium" onClick={() => onSelect && onSelect(cat)}>{cat.name}</span>
                    <ChildCount parentId={String(cat.id)} />
                </button>
                <div className="ml-auto flex items-center gap-1 text-muted-foreground/70 [&>button]:opacity-70 group-hover:[&>button]:opacity-100">
                    {/* <Button variant="ghost" size="icon" className="cursor-pointer" title="Thêm danh mục con" onClick={() => onAdd && onAdd(cat)}>
                        <Plus className="h-4 w-4" />
                    </Button> */}
                    <Button variant="ghost" size="icon" className="cursor-pointer" title="Sửa" onClick={() => onEdit && onEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="cursor-pointer" title="Xoá" onClick={() => onDelete && onDelete(cat)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </div>
            <div className="text-[11px] text-muted-foreground" style={{ paddingLeft: indent + 28 }}>
                <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1">
                    <span> Tạo: {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : "-"}</span>
                    <span> Cập nhật: {cat.updatedAt ? new Date(cat.updatedAt).toLocaleDateString() : "-"}</span>
                </div>
                {cat.notes ? <div className="mt-1 line-clamp-2 leading-relaxed">{cat.notes}</div> : null}
            </div>
            {open ? <TreeChildren parentId={String(cat.id)} depth={depth + 1} onSelect={onSelect} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} /> : null}
        </div>
    )
}

function TreeChildren({ parentId, depth, onSelect, onAdd, onEdit, onDelete }: { parentId: string; depth: number; onSelect?: (c: Category) => void; onAdd?: (c: Category) => void; onEdit?: (c: Category) => void; onDelete?: (c: Category) => void }) {
    const { data, isPending, isError } = useSubCategories(parentId, 1, 100)
    const items = (data?.data ?? []) as Category[]
    if (isPending) return <div className="pl-8 text-xs text-muted-foreground">Đang tải...</div>
    if (isError) return <div className="pl-8 text-xs text-destructive">Không tải được dữ liệu</div>
    if (items.length === 0) return null
    return (
        <div>
            {items.map((c) => (
                <TreeRow key={String(c.id)} cat={c} depth={depth} onSelect={onSelect} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </div>
    )
}

export function CategoryTree({ id, onSelect, onSelectedChange }: { id: string; onSelect?: (c: Category) => void; onSelectedChange?: (c: Category) => void }) {
    const { data: root, isPending, isError } = useCategoryDetail(id)
    const { mutate: createCategory, isPending: creating } = useCreateCategory()
    const { mutate: updateCategory, isPending: updating } = useUpdateCategory()
    const { mutate: deleteCategory, isPending: deleting } = useDeleteCategory()
    const { data: parentsData } = useParentCategories()

    const [openCreate, setOpenCreate] = React.useState(false)
    const [openEdit, setOpenEdit] = React.useState(false)
    const [openDelete, setOpenDelete] = React.useState(false)
    const [target, setTarget] = React.useState<Category | null>(null)
    const [createForm, setCreateForm] = React.useState<CategoryFormValue>({ name: "", notes: "", parentId: "" })
    const [editForm, setEditForm] = React.useState<CategoryFormValue>({ name: "", notes: "", parentId: "" })
    const [nameError, setNameError] = React.useState<string>("")
    const [nameTouched, setNameTouched] = React.useState(false)

    const addChild = (parent: Category) => {
        setTarget(parent)
        setCreateForm({ name: "", notes: "", parentId: String(parent.id) })
        setNameError("")
        setNameTouched(false)
        setOpenCreate(true)
    }
    const editCat = (c: Category) => {
        setTarget(c)
        setEditForm({ name: c.name ?? "", notes: c.notes ?? "", parentId: c.parentId ? String(c.parentId) : "" })
        setNameError("")
        setNameTouched(false)
        setOpenEdit(true)
    }
    const deleteCat = (c: Category) => {
        setTarget(c)
        setOpenDelete(true)
    }

    const handleSelect = (c: Category) => {
        onSelect && onSelect(c)
        onSelectedChange && onSelectedChange(c)
    }

    if (isPending) return <div className="py-6 text-sm text-muted-foreground">Đang tải...</div>
    if (isError || !root) return <div className="py-6 text-sm text-destructive">Không tải được danh mục</div>

    return (
        <>
            <TreeRow cat={root} depth={0} onSelect={handleSelect} onAdd={addChild} onEdit={editCat} onDelete={deleteCat} />

            {/* Create Modal */}
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Thêm danh mục con</DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                        value={createForm}
                        onChange={(v) => {
                            setCreateForm(v)
                            if (nameTouched) setNameError(validateCategoryName(v.name || ""))
                        }}
                        onValidate={(field, v) => { if (field === "name") { setNameTouched(true); setNameError(validateCategoryName(v)) } }}
                        parents={(parentsData?.data ?? []) as any}
                        error={nameTouched ? (nameError || undefined) : undefined}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenCreate(false)}>Huỷ</Button>
                        <Button onClick={() => {
                            const err = validateCategoryName(createForm.name || "")
                            setNameError(err)
                            setNameTouched(true)
                            if (err) return
                            createCategory({
                                name: normalizeSpaces(createForm.name),
                                notes: createForm.notes ? normalizeSpaces(createForm.notes) : undefined,
                                parentId: createForm.parentId || undefined,
                            }, {
                                onSuccess: () => { setOpenCreate(false); notify({ title: "Đã tạo", variant: "success" }) },
                                onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể tạo"), variant: "destructive" })
                            })
                        }} disabled={creating}>{creating ? "Đang lưu..." : "Lưu"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Sửa danh mục</DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                        value={editForm}
                        onChange={(v) => {
                            setEditForm(v)
                            if (nameTouched) setNameError(validateCategoryName(v.name || ""))
                        }}
                        onValidate={(field, v) => { if (field === "name") { setNameTouched(true); setNameError(validateCategoryName(v)) } }}
                        parents={(parentsData?.data ?? []) as any}
                        error={nameTouched ? (nameError || undefined) : undefined}
                        excludeId={target ? target.id : undefined}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenEdit(false)}>Huỷ</Button>
                        <Button onClick={() => {
                            if (!target) return
                            const err = validateCategoryName(editForm.name || "")
                            setNameError(err)
                            setNameTouched(true)
                            if (err) return
                            updateCategory({
                                id: String(target.id),
                                name: normalizeSpaces(editForm.name),
                                notes: editForm.notes ? normalizeSpaces(editForm.notes) : undefined,
                                parentId: editForm.parentId || undefined,
                            }, {
                                onSuccess: () => { setOpenEdit(false); notify({ title: "Đã cập nhật", variant: "success" }) },
                                onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể cập nhật"), variant: "destructive" })
                            })
                        }} disabled={updating}>{updating ? "Đang lưu..." : "Lưu"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <ConfirmDialog
                open={openDelete}
                onOpenChange={setOpenDelete}
                title="Xác nhận xoá"
                description={<span>Bạn có chắc muốn xoá danh mục "<b>{target?.name}</b>"?</span>}
                confirmText={deleting ? "Đang xoá..." : "Xoá"}
                confirmVariant="destructive"
                onConfirm={() => {
                    if (!target) return
                    deleteCategory({ id: String(target.id) }, {
                        onSuccess: () => { setOpenDelete(false); notify({ title: "Đã xoá", variant: "success" }) },
                        onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể xoá"), variant: "destructive" })
                    })
                }}
            />
        </>
    )
}
