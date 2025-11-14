"use client"

import * as React from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useCategoryList, useDeleteCategory, useParentCategories, useCreateCategory, useUpdateCategory, useSubCategories, useCategoryDetail, useSubCategoriesCount } from "@/components/shared/category/useCategory"
import type { CategoryFilter, Category } from "@/types/category"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Search, Filter, Plus, ChevronDown, Inbox, RotateCcw } from "lucide-react"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { notify } from "@/components/shared/admin/Notifications"
import { Pagination } from "@/components/shared/common/Pagination"
import { CategoryFilters } from "@/components/shared/category/CategoryFilters"
import { CategoryTable } from "@/components/shared/category/CategoryTable"
import { AdminActionDialog } from "@/components/admin/common/AdminActionDialog"
import { CategoryForm, type CategoryFormValue } from "@/components/shared/category/CategoryForm"
import { validateCategoryName, normalizeSpaces } from "@/lib/validators"
import { useAppStore } from "@/stores/useAppStore"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"

export default function CategoryListPage() {
    const router = useRouter()
    const params = useParams<{ locale: string }>()
    const locale = params?.locale || "vi"
    const { theme } = useAppStore()
    const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"

    const searchParams = useSearchParams()
    const [page, setPage] = React.useState<number>(Number(searchParams.get("page") || 1))
    const [limit, setLimit] = React.useState<number>(Number(searchParams.get("limit") || 10))
    const [nameFilter, setNameFilter] = React.useState<string>(searchParams.get("name") || searchParams.get("search") || "")
    const [nameInput, setNameInput] = React.useState<string>(searchParams.get("name") || searchParams.get("search") || "")
    const [parentIdFilter, setParentIdFilter] = React.useState<string>(searchParams.get("parentId") || "")
    const [isSubCategory, setIsSubCategory] = React.useState<boolean | undefined>(() => {
        const v = searchParams.get("isSubCategory")
        // Default to showing only parents when not specified
        if (v === null) return undefined
        return v === "true" ? true : v === "false" ? false : undefined
    })
    const [showDeleted, setShowDeleted] = React.useState<boolean>(() => searchParams.get("deleted") === "true")

    const { data: parentsData } = useParentCategories()
    const filtersActive = !!(nameFilter || parentIdFilter || isSubCategory === true)
    const parentNameById = React.useMemo(() => {
        const map = new Map<string, string>()
        const arr = (parentsData?.data ?? []) as any[]
        for (const p of arr) map.set(String(p.id), p.name)
        return map
    }, [parentsData])


    React.useEffect(() => {
        // When actual filter changes (via submit), reset to first page
        const t = setTimeout(() => setPage(1), 0)
        return () => clearTimeout(t)
    }, [nameFilter])

    const filter = React.useMemo<CategoryFilter>(() => ({ page, limit, name: nameFilter || undefined, parentId: parentIdFilter || undefined, isSubCategory, deleted: showDeleted || undefined }), [page, limit, nameFilter, parentIdFilter, isSubCategory, showDeleted])
    const { data, isPending, isFetching, isError } = useCategoryList(filter)
    const { mutate: deleteCategory, isPending: deleting } = useDeleteCategory()
    const { mutate: createCategory, isPending: creating } = useCreateCategory()
    const { mutate: updateCategory, isPending: updating } = useUpdateCategory()
    const [openDeleteConfirm, setOpenDeleteConfirm] = React.useState(false)
    const [target, setTarget] = React.useState<{ id: string; name: string } | null>(null)
    const [openCreate, setOpenCreate] = React.useState(false)
    const [openEdit, setOpenEdit] = React.useState(false)
    const [editing, setEditing] = React.useState<Category | null>(null)
    const [createDefaultParentId, setCreateDefaultParentId] = React.useState<string | undefined>(undefined)
    const [createForm, setCreateForm] = React.useState<CategoryFormValue>({ name: "", notes: "", parentId: "" })
    const [editForm, setEditForm] = React.useState<CategoryFormValue>({ name: "", notes: "", parentId: "" })
    const [nameError, setNameError] = React.useState<string>("")
    const [nameTouched, setNameTouched] = React.useState(false)
    const [unsavedOpen, setUnsavedOpen] = React.useState(false)
    const pendingCloseRef = React.useRef<null | (() => void)>(null)
    const bypassUnsavedGuardRef = React.useRef(false)
    const isCreateDirty = React.useMemo(() => {
        const baselineParent = createDefaultParentId ?? ""
        return openCreate && (
            !!(createForm.name && createForm.name.trim()) ||
            !!(createForm.notes && createForm.notes.trim()) ||
            (createForm.parentId || "") !== baselineParent
        )
    }, [openCreate, createForm, createDefaultParentId])
    const isEditDirty = React.useMemo(() => {
        if (!openEdit || !editing) return false
        const baseName = editing.name ?? ""
        const baseNotes = editing.notes ?? ""
        const baseParent = editing.parentId ? String(editing.parentId) : ""
        return (
            (editForm.name || "") !== baseName ||
            (editForm.notes || "") !== baseNotes ||
            (editForm.parentId || "") !== baseParent
        )
    }, [openEdit, editing, editForm])

    const navPendingRef = React.useRef(false)
    const prevParamsRef = React.useRef<{ page: number; limit: number; name?: string; parentId?: string; isSubCategory?: boolean; deleted?: boolean } | null>(null)
    React.useEffect(() => {
        const qs = new URLSearchParams()
        if (nameFilter) qs.append("name", nameFilter)
        if (parentIdFilter) qs.append("parentId", parentIdFilter)
        if (isSubCategory === true) qs.append("isSubCategory", "true")
        if (showDeleted) qs.append("deleted", "true")

        const hasFilters = !!(nameFilter || parentIdFilter || isSubCategory === true || showDeleted)
        const hasNonDefaultPaging = page !== 1 || limit !== 10

        if (hasFilters || hasNonDefaultPaging) {
            qs.append("page", String(page))
            qs.append("limit", String(limit))
        }

        const query = qs.toString()
        const href = `/${locale}/admin/categories${query ? `?${query}` : ""}`

        const current = `${window.location.pathname}${window.location.search}`
        if (current !== href) {
            const nextParams = { page, limit, name: nameFilter || undefined, parentId: parentIdFilter || undefined, isSubCategory: isSubCategory === true ? true : undefined, deleted: showDeleted || undefined }
            const prev = prevParamsRef.current
            const onlyPagingChanged = !!prev &&
                prev.name === nextParams.name &&
                prev.parentId === nextParams.parentId &&
                prev.isSubCategory === nextParams.isSubCategory &&
                prev.deleted === nextParams.deleted &&
                (prev.page !== nextParams.page || prev.limit !== nextParams.limit)

            const navigate = () => {
                if (onlyPagingChanged) router.push(href)
                else router.replace(href)
                prevParamsRef.current = nextParams
            }

            if ((isEditDirty || isCreateDirty) && !navPendingRef.current) {
                navPendingRef.current = true
                pendingCloseRef.current = () => {
                    navigate()
                    navPendingRef.current = false
                }
                setUnsavedOpen(true)
                return
            }
            if (!navPendingRef.current) navigate()
        } else {
            // Initialize prev on first run
            if (!prevParamsRef.current) prevParamsRef.current = { page, limit, name: nameFilter || undefined, parentId: parentIdFilter || undefined, isSubCategory: isSubCategory === true ? true : undefined, deleted: showDeleted || undefined }
        }
    }, [page, limit, nameFilter, parentIdFilter, isSubCategory, showDeleted, locale, router, isEditDirty, isCreateDirty])

    const openCreateFor = (parentId?: string) => {
        setCreateDefaultParentId(parentId ? String(parentId) : undefined)
        setCreateForm({ name: "", notes: "", parentId: parentId ? String(parentId) : "" })
        setNameError("")
        setNameTouched(false)
        setOpenCreate(true)
    }

    const openEditFor = (cat: Category) => {
        setEditing(cat)
        setEditForm({ name: cat.name ?? "", notes: cat.notes ?? "", parentId: cat.parentId ? String(cat.parentId) : "" })
        setNameError("")
        setNameTouched(false)
        setOpenEdit(true)
    }

    const handleDelete = (id: string, name: string) => {
        setTarget({ id, name })
        setOpenDeleteConfirm(true)
    }

    const total = data?.total ?? 0
    const currentPage = data?.page ?? page
    const pageSize = data?.limit ?? limit
    const totalPages = data?.totalPages ?? Math.ceil(total / pageSize || 1)
    const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
    const toggleExpanded = (id: string) => {
        setExpanded(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id); else next.add(id)
            return next
        })
    }

    function ChildCount({ parentId }: { parentId: string }) {
        const { data } = useSubCategoriesCount(parentId)
        const total = data?.total ?? 0
        return <>{total}</>
    }

    return (
        <div className="relative">
            <div className="mb-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <CategoryFilters
                        nameFilter={nameInput}
                        setNameFilter={setNameInput}
                        parentIdFilter={parentIdFilter}
                        setParentIdFilter={setParentIdFilter}
                        isSubCategory={isSubCategory}
                        setIsSubCategory={setIsSubCategory}
                        setPage={setPage}
                        filtersActive={filtersActive}
                        parents={(parentsData?.data ?? []) as any}
                        onSearchSubmit={(v) => { setNameFilter(v !== undefined ? v : nameInput); setPage(1) }}
                    />
                    <div className="flex items-center gap-2 justify-end">
                        <Link href={`/${locale}/admin/categories/trash`} className="inline-flex">
                            <Button variant="outline" className="h-9 gap-2 cursor-pointer" title="Danh sách thùng rác">
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button className="h-9 gap-2 cursor-pointer" onClick={() => openCreateFor()}>
                            <Plus className="h-4 w-4" />
                            Tạo danh mục
                        </Button>
                    </div>
                </div>
            </div>

            <LoadingOverlay show={isPending || isFetching} />

            <div className="min-h-[300px]">
                {isError ? (
                    <div className="py-10 text-center text-sm text-destructive">Lỗi tải dữ liệu</div>
                ) : (((data?.data ?? []) as Category[]).length === 0) ? (
                    <div className="py-16 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                            <Inbox className="h-10 w-10 text-muted-foreground/60" />
                            <span>Không có dữ liệu</span>
                        </div>
                    </div>
                ) : (
                    <CategoryTable
                        items={(data?.data ?? []) as Category[]}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        total={total}
                        totalPages={totalPages}
                        expanded={expanded}
                        toggleExpanded={(id) => toggleExpanded(id)}
                        onEdit={(c) => openEditFor(c)}
                        onDelete={(id, name) => handleDelete(id, name)}
                        onAddChild={(parentId) => openCreateFor(parentId)}
                        onPageChange={(p) => setPage(p)}
                        deleting={deleting}
                        locale={locale}
                    />
                )}
            </div>

            {/* Bottom pagination */}
            <div className="mt-4 flex justify-end">
                <Pagination
                    pagination={{ totalItems: total, totalPages, currentPage, itemsPerPage: pageSize }}
                    onPageChange={(p) => setPage(p)}
                    size="sm"
                />
            </div>

            <AdminActionDialog
                open={openDeleteConfirm}
                onOpenChange={setOpenDeleteConfirm}
                title="Xác nhận xoá"
                description={<span>Bạn có chắc muốn xoá danh mục "<b>{target?.name}</b>"?</span>}
                confirmText={deleting ? "Đang xoá..." : "Xoá"}
                confirmVariant="destructive"
                loading={deleting}
                onConfirm={() => {
                    if (!target) return
                    deleteCategory({ id: target.id }, {
                        onSuccess: () => { setOpenDeleteConfirm(false); notify({ title: "Đã xoá", variant: "success" }) },
                        onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể xoá"), variant: "destructive" })
                    })
                }}
            />

            {/* Unsaved changes confirm */}
            <ConfirmDialog
                open={unsavedOpen}
                onOpenChange={setUnsavedOpen}
                title="Thay đổi chưa lưu"
                description={<span>Bạn có thay đổi chưa lưu. Thoát mà không lưu?</span>}
                confirmText="Thoát"
                confirmVariant="default"
                position="top"
                onConfirm={() => {
                    const fn = pendingCloseRef.current
                    pendingCloseRef.current = null
                    setUnsavedOpen(false)
                    if (fn) fn()
                }}
            />

            {/* Unified Create Dialog */}
            <AdminActionDialog
                open={openCreate}
                onOpenChange={(next) => {
                    if (!next) {
                        if (isCreateDirty && !bypassUnsavedGuardRef.current) {
                            pendingCloseRef.current = () => {
                                bypassUnsavedGuardRef.current = true
                                setOpenCreate(false)
                                bypassUnsavedGuardRef.current = false
                            }
                            setUnsavedOpen(true)
                            return
                        }
                    }
                    setOpenCreate(next)
                }}
                title="Thêm danh mục"
                confirmText={creating ? "Đang lưu..." : "Lưu"}
                loading={creating}
                position="top"
                onConfirm={() => {
                    const err = validateCategoryName(createForm.name || "")
                    setNameError(err)
                    setNameTouched(true)
                    if (err) return
                    createCategory({
                        name: normalizeSpaces(createForm.name),
                        notes: createForm.notes !== undefined ? normalizeSpaces(createForm.notes) : undefined,
                        parentId: createForm.parentId || undefined,
                    }, {
                        onSuccess: () => { setOpenCreate(false); notify({ title: "Đã tạo", variant: "success" }) },
                        onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể tạo"), variant: "destructive" })
                    })
                }}
            >
                <CategoryForm
                    value={createForm}
                    onChange={(v) => {
                        setCreateForm(v)
                        if (nameTouched) setNameError(validateCategoryName(v.name || ""))
                    }}
                    onValidate={(field, v) => { if (field === "name") { setNameTouched(true); setNameError(validateCategoryName(v)) } }}
                    parents={(parentsData?.data ?? []) as any}
                    error={nameTouched ? (nameError || undefined) : undefined}
                    allowParentSelect={true}
                    showParentField={true}
                />
            </AdminActionDialog>

            {/* Unified Edit Dialog */}
            <AdminActionDialog
                open={openEdit}
                onOpenChange={(next) => {
                    if (!next) {
                        if (isEditDirty && !bypassUnsavedGuardRef.current) {
                            pendingCloseRef.current = () => {
                                bypassUnsavedGuardRef.current = true
                                setOpenEdit(false)
                                bypassUnsavedGuardRef.current = false
                            }
                            setUnsavedOpen(true)
                            return
                        }
                    }
                    setOpenEdit(next)
                }}
                title="Sửa danh mục"
                confirmText={updating ? "Đang lưu..." : "Lưu"}
                loading={updating}
                position="top"
                onConfirm={() => {
                    if (!editing) return
                    const err = validateCategoryName(editForm.name || "")
                    setNameError(err)
                    setNameTouched(true)
                    if (err) return
                    updateCategory({
                        id: String(editing.id),
                        name: normalizeSpaces(editForm.name),
                        notes: editForm.notes !== undefined ? normalizeSpaces(editForm.notes) : undefined,
                        parentId: editForm.parentId || undefined,
                    }, {
                        onSuccess: () => { setOpenEdit(false); notify({ title: "Đã cập nhật", variant: "success" }) },
                        onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể cập nhật"), variant: "destructive" })
                    })
                }}
            >
                <CategoryForm
                    value={editForm}
                    onChange={(v) => {
                        setEditForm(v)
                        if (nameTouched) setNameError(validateCategoryName(v.name || ""))
                    }}
                    onValidate={(field, v) => { if (field === "name") { setNameTouched(true); setNameError(validateCategoryName(v)) } }}
                    parents={(parentsData?.data ?? []) as any}
                    error={nameTouched ? (nameError || undefined) : undefined}
                    excludeId={editing ? editing.id : undefined}
                    allowParentSelect={true}
                    showParentField={true}
                />
            </AdminActionDialog>
        </div>
    );
}
