"use client"

import * as React from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useCourseList, useDeleteCourse, useCreateCourse, useUpdateCourse, useUpdateCourseStatus } from "@/components/shared/course/useCourse"
import { useParentCategories } from "@/components/shared/category/useCategory"
import type { CourseFilter, Course } from "@/types/course/course.types"
import { Button } from "@/components/ui/button"
import { Plus, Inbox } from "lucide-react"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { notify } from "@/components/shared/admin/Notifications"
import { Pagination } from "@/components/shared/common/Pagination"
import { CourseFilters } from "@/components/shared/course/CourseFilters"
import { CourseTable } from "@/components/shared/course/CourseTable"
import { AdminActionDialog } from "@/components/admin/common/AdminActionDialog"
import { CourseForm, type CourseFormValue } from "@/components/shared/course/CourseForm"
import { validateCategoryName, normalizeSpaces } from "@/lib/validators"
import { useAppStore } from "@/stores/useAppStore"

export default function CourseListPage() {
    const router = useRouter()
    const params = useParams<{ locale: string }>()
    const locale = params?.locale || "vi"
    const { theme } = useAppStore()
    const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"

    const searchParams = useSearchParams()
    const [page, setPage] = React.useState<number>(Number(searchParams.get("page") || 1))
    const [limit, setLimit] = React.useState<number>(Number(searchParams.get("limit") || 10))
    const [nameFilter, setNameFilter] = React.useState<string>(searchParams.get("name") || searchParams.get("search") || "")
    const [categoryIdFilter, setCategoryIdFilter] = React.useState<string>(searchParams.get("categoryId") || "")
    const [statusFilter, setStatusFilter] = React.useState<boolean | undefined>(() => {
        const v = searchParams.get("status")
        if (v === null) return undefined
        return v === "true" ? true : v === "false" ? false : undefined
    })
    const [showDeleted, setShowDeleted] = React.useState<boolean>(() => searchParams.get("deleted") === "true")

    const { data: categoriesData } = useParentCategories()
    const filtersActive = !!(nameFilter || categoryIdFilter || typeof statusFilter === 'boolean')

    React.useEffect(() => {
        const t = setTimeout(() => setPage(1), 400)
        return () => clearTimeout(t)
    }, [nameFilter])

    const filter = React.useMemo<CourseFilter>(() => ({ 
        page, 
        limit, 
        name: nameFilter || undefined, 
        categoryId: categoryIdFilter || undefined, 
        status: statusFilter,
        deleted: showDeleted || undefined 
    }), [page, limit, nameFilter, categoryIdFilter, statusFilter, showDeleted])
    
    const { data, isPending, isError } = useCourseList(filter)
    const { mutate: deleteCourse, isPending: deleting } = useDeleteCourse()
    const { mutate: createCourse, isPending: creating } = useCreateCourse()
    const { mutate: updateCourse, isPending: updating } = useUpdateCourse()
    const { mutate: updateCourseStatus, isPending: updatingStatus } = useUpdateCourseStatus()
    const [openDeleteConfirm, setOpenDeleteConfirm] = React.useState(false)
    const [target, setTarget] = React.useState<{ id: string; name: string } | null>(null)
    const [openCreate, setOpenCreate] = React.useState(false)
    const [openEdit, setOpenEdit] = React.useState(false)
    const [editing, setEditing] = React.useState<Course | null>(null)
    const [createForm, setCreateForm] = React.useState<CourseFormValue>({ 
        name: "", 
        description: "", 
        notes: "", 
        thumbnail: "", 
        price: "0", 
        categoryId: "", 
        level: "", 
        status: true 
    })
    const [editForm, setEditForm] = React.useState<CourseFormValue>({ 
        name: "", 
        description: "", 
        notes: "", 
        thumbnail: "", 
        price: "0", 
        categoryId: "", 
        level: "", 
        status: true 
    })
    const [nameError, setNameError] = React.useState<string>("")
    const [nameTouched, setNameTouched] = React.useState(false)
    const [unsavedOpen, setUnsavedOpen] = React.useState(false)
    const pendingCloseRef = React.useRef<null | (() => void)>(null)
    const bypassUnsavedGuardRef = React.useRef(false)
    
    const isCreateDirty = React.useMemo(() => {
        if (!openCreate) return false
        return (
            !!(createForm.name && createForm.name.trim()) ||
            !!(createForm.description && createForm.description.trim()) ||
            !!(createForm.notes && createForm.notes.trim()) ||
            !!(createForm.thumbnail && createForm.thumbnail.trim()) ||
            createForm.price !== "0" ||
            !!(createForm.categoryId && createForm.categoryId.trim()) ||
            !!(createForm.level && createForm.level.trim()) ||
            createForm.status !== true
        )
    }, [openCreate, createForm])
    
    const isEditDirty = React.useMemo(() => {
        if (!openEdit || !editing) return false
        const baseName = editing.name ?? ""
        const baseDescription = editing.description ?? ""
        const baseNotes = editing.notes ?? ""
        const baseThumbnail = editing.thumbnail ?? ""
        const basePrice = String(editing.price ?? "0")
        const baseCategoryId = editing.categoryId ? String(editing.categoryId) : ""
        const baseLevel = editing.level ?? ""
        const baseStatus = editing.status ?? true
        return (
            (editForm.name || "") !== baseName ||
            (editForm.description || "") !== baseDescription ||
            (editForm.notes || "") !== baseNotes ||
            (editForm.thumbnail || "") !== baseThumbnail ||
            (editForm.price || "0") !== basePrice ||
            (editForm.categoryId || "") !== baseCategoryId ||
            (editForm.level || "") !== baseLevel ||
            (editForm.status ?? true) !== baseStatus
        )
    }, [openEdit, editing, editForm])

    const navPendingRef = React.useRef(false)
    const prevParamsRef = React.useRef<{ page: number; limit: number; name?: string; categoryId?: string; status?: boolean; deleted?: boolean } | null>(null)
    
    React.useEffect(() => {
        const qs = new URLSearchParams()
        if (nameFilter) qs.append("name", nameFilter)
        if (categoryIdFilter) qs.append("categoryId", categoryIdFilter)
        if (typeof statusFilter === 'boolean') qs.append("status", String(statusFilter))
        if (showDeleted) qs.append("deleted", "true")

        const hasFilters = !!(nameFilter || categoryIdFilter || typeof statusFilter === 'boolean' || showDeleted)
        const hasNonDefaultPaging = page !== 1 || limit !== 10

        if (hasFilters || hasNonDefaultPaging) {
            qs.append("page", String(page))
            qs.append("limit", String(limit))
        }

        const query = qs.toString()
        const href = `/${locale}/admin/courses${query ? `?${query}` : ""}`

        const current = `${window.location.pathname}${window.location.search}`
        if (current !== href) {
            const nextParams = { 
                page, 
                limit, 
                name: nameFilter || undefined, 
                categoryId: categoryIdFilter || undefined, 
                status: statusFilter,
                deleted: showDeleted || undefined 
            }
            const prev = prevParamsRef.current
            const onlyPagingChanged = !!prev &&
                prev.name === nextParams.name &&
                prev.categoryId === nextParams.categoryId &&
                prev.status === nextParams.status &&
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
            if (!prevParamsRef.current) prevParamsRef.current = { 
                page, 
                limit, 
                name: nameFilter || undefined, 
                categoryId: categoryIdFilter || undefined, 
                status: statusFilter,
                deleted: showDeleted || undefined 
            }
        }
    }, [page, limit, nameFilter, categoryIdFilter, statusFilter, showDeleted, locale, router, isEditDirty, isCreateDirty])

    const openCreateFor = () => {
        setCreateForm({ 
            name: "", 
            description: "", 
            notes: "", 
            thumbnail: "", 
            price: "0", 
            categoryId: "", 
            level: "", 
            status: true 
        })
        setNameError("")
        setNameTouched(false)
        setOpenCreate(true)
    }

    const openEditFor = (course: Course) => {
        setEditing(course)
        setEditForm({ 
            name: course.name ?? "", 
            description: course.description ?? "", 
            notes: course.notes ?? "", 
            thumbnail: course.thumbnail ?? "", 
            price: String(course.price ?? "0"), 
            categoryId: course.categoryId ? String(course.categoryId) : "", 
            level: course.level ?? "", 
            status: course.status ?? true 
        })
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

    const handleToggleStatus = (id: string, currentStatus: boolean) => {
        updateCourseStatus({ id, status: !currentStatus }, {
            onSuccess: () => {
                notify({ title: "Đã cập nhật trạng thái", variant: "success" })
            },
            onError: (e: any) => {
                notify({ title: "Lỗi", description: String(e?.message || "Không thể cập nhật trạng thái"), variant: "destructive" })
            }
        })
    }

  return (
        <div className="">
            <div className="mb-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <CourseFilters
                        nameFilter={nameFilter}
                        setNameFilter={setNameFilter}
                        categoryIdFilter={categoryIdFilter}
                        setCategoryIdFilter={setCategoryIdFilter}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        setPage={setPage}
                        filtersActive={filtersActive}
                        categories={(categoriesData?.data ?? []) as any}
                    />
                    <div className="flex items-center gap-2 justify-end">
                        <Pagination
                            pagination={{ totalItems: total, totalPages, currentPage, itemsPerPage: pageSize }}
                            onPageChange={(p) => setPage(p)}
                            className="m-0"
                            size="sm"
                        />
                        <Link href={`/${locale}/admin/courses/trash`} className="inline-flex">
                            <Button variant="outline" className="h-9 gap-2 cursor-pointer" title="Thùng rác">
                                Thùng rác
                            </Button>
                        </Link>
                        <Button className="h-9 gap-2" onClick={() => openCreateFor()}>
                            <Plus className="h-4 w-4" />
                            Tạo khóa học
                        </Button>
                    </div>
                </div>
            </div>

            <div className="relative min-h-[300px]">
                {isPending ? (
                    <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                            <img src={logoSrc} alt="Wishzy" className="h-10 w-auto opacity-90" />
                            <div aria-label="loading" className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <span>Đang tải dữ liệu...</span>
                        </div>
                    </div>
                ) : null}
                {isError ? (
                    <div className="py-10 text-center text-sm text-destructive">Lỗi tải dữ liệu</div>
                ) : (((data?.data ?? []) as Course[]).length === 0) ? (
                    <div className="py-16 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                            <Inbox className="h-10 w-10 text-muted-foreground/60" />
                            <span>Không có dữ liệu</span>
                        </div>
                    </div>
                ) : (
                    <CourseTable
                        items={(data?.data ?? []) as Course[]}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        total={total}
                        totalPages={totalPages}
                        onEdit={(c) => openEditFor(c)}
                        onDelete={(id, name) => handleDelete(id, name)}
                        deleting={deleting}
                    />
                )}
            </div>

            <AdminActionDialog
                open={openDeleteConfirm}
                onOpenChange={setOpenDeleteConfirm}
                title="Xác nhận xoá"
                description={<span>Bạn có chắc muốn xoá khóa học "<b>{target?.name}</b>"?</span>}
                confirmText={deleting ? "Đang xoá..." : "Xoá"}
                confirmVariant="destructive"
                loading={deleting}
                onConfirm={() => {
                    if (!target) return
                    deleteCourse({ id: target.id }, {
                        onSuccess: () => { 
                            setOpenDeleteConfirm(false)
                            notify({ title: "Đã xoá", variant: "success" })
                        },
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
                confirmVariant="destructive"
                position="top"
                onConfirm={() => {
                    const fn = pendingCloseRef.current
                    pendingCloseRef.current = null
                    setUnsavedOpen(false)
                    if (fn) fn()
                }}
            />

            {/* Create Course Dialog */}
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
                title="Thêm khóa học"
                confirmText={creating ? "Đang lưu..." : "Tạo khóa học"}
                loading={creating}
                position="top"
                onConfirm={() => {
                    const err = validateCategoryName(createForm.name || "")
                    setNameError(err)
                    setNameTouched(true)
                    if (err) return
                    if (!createForm.categoryId) {
                        notify({ title: "Lỗi", description: "Vui lòng chọn danh mục", variant: "destructive" })
                        return
                    }
                    // Create course only (no chapters)
                    const priceValue = parseFloat(createForm.price) || 0
                    if (priceValue <= 0) {
                        notify({ title: "Lỗi", description: "Giá phải lớn hơn 0", variant: "destructive" })
                        return
                    }
                    
                    // Build request body exactly as Swagger spec
                    const courseData: {
                        name: string
                        price: number
                        categoryId: string
                        totalDuration: number
                        level?: string
                        description?: string
                        notes?: string
                        thumbnail?: string
                    } = {
                        name: normalizeSpaces(createForm.name),
                        price: priceValue,
                        categoryId: createForm.categoryId,
                        totalDuration: 0,
                    }
                    
                    // Add optional fields only if they have values
                    if (createForm.level && createForm.level !== "__none") {
                        courseData.level = createForm.level
                    }
                    if (createForm.description?.trim()) {
                        courseData.description = normalizeSpaces(createForm.description)
                    }
                    if (createForm.notes?.trim()) {
                        courseData.notes = normalizeSpaces(createForm.notes)
                    }
                    if (createForm.thumbnail?.trim()) {
                        courseData.thumbnail = createForm.thumbnail.trim()
                    }
                    
                    console.log("Creating course with data:", JSON.stringify(courseData, null, 2))

                    createCourse(courseData, {
                        onSuccess: (response: any) => {
                            console.log("Course creation response:", response)
                            const courseId = response?.data?.id || response?.id || response?.data?.data?.id
                            if (!courseId) {
                                console.error("Course creation response (full):", JSON.stringify(response, null, 2))
                                notify({ title: "Lỗi", description: "Không thể lấy ID khóa học. Vui lòng kiểm tra console.", variant: "destructive" })
                                return
                            }
                            // Set status if checked
                            if (createForm.status) {
                                updateCourseStatus({ id: String(courseId), status: true }, {
                                    onSuccess: () => {
                                        setOpenCreate(false)
                                        notify({ title: "Đã tạo khóa học thành công", variant: "success" })
                                    },
                                    onError: (_e: any) => {
                                        setOpenCreate(false)
                                        notify({ title: "Đã tạo khóa học", description: "Không thể kích hoạt khóa học.", variant: "warning" })
                                    }
                                })
                            } else {
                                setOpenCreate(false)
                                notify({ title: "Đã tạo khóa học thành công", variant: "success" })
                            }
                        },
                        onError: (e: any) => {
                            console.error("Course creation error:", e)
                            notify({ title: "Lỗi", description: String(e?.message || "Không thể tạo"), variant: "destructive" })
                        }
                    })
                }}
            >
                <div className="space-y-4">
                    <CourseForm
                        value={createForm}
                        onChange={(v) => {
                            setCreateForm(v)
                            if (nameTouched) setNameError(validateCategoryName(v.name || ""))
                        }}
                        onValidate={(field, v) => { if (field === "name") { setNameTouched(true); setNameError(validateCategoryName(String(v))) } }}
                        categories={(categoriesData?.data ?? []) as any}
                        error={nameTouched ? (nameError || undefined) : undefined}
                    />
                </div>
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
                title="Sửa khóa học"
                confirmText={updating ? "Đang lưu..." : "Lưu"}
                loading={updating}
                position="top"
                onConfirm={() => {
                    if (!editing) return
                    const err = validateCategoryName(editForm.name || "")
                    setNameError(err)
                    setNameTouched(true)
                    if (err) return
                    if (!editForm.categoryId) {
                        notify({ title: "Lỗi", description: "Vui lòng chọn danh mục", variant: "destructive" })
                        return
                    }
                    // Format update request according to API: { name, price, level, totalDuration, categoryId, description?, notes?, thumbnail? }
                    // Note: status is not part of PUT request body, use PATCH /courses/{id}/status instead
                    const updateData: any = {
                        id: String(editing.id),
                        name: normalizeSpaces(editForm.name),
                        price: parseFloat(editForm.price) || 0,
                        categoryId: editForm.categoryId,
                        totalDuration: editing.totalDuration ?? 0, // Always include totalDuration
                    }
                    
                    // Add optional fields only if they have values
                    if (editForm.level) {
                        updateData.level = editForm.level
                    }
                    if (editForm.description?.trim()) {
                        updateData.description = normalizeSpaces(editForm.description)
                    }
                    if (editForm.notes?.trim()) {
                        updateData.notes = normalizeSpaces(editForm.notes)
                    }
                    if (editForm.thumbnail?.trim()) {
                        updateData.thumbnail = editForm.thumbnail.trim()
                    }
                    
                    // Check if status changed
                    const statusChanged = (editForm.status ?? true) !== (editing.status ?? true)
                    
                    updateCourse(updateData, {
                        onSuccess: () => {
                            // If status changed, update it separately using PATCH endpoint
                            if (statusChanged) {
                                updateCourseStatus({ id: String(editing.id), status: editForm.status ?? true }, {
                                    onSuccess: () => {
                                        setOpenEdit(false)
                                        notify({ title: "Đã cập nhật", variant: "success" })
                                    },
                                    onError: (e: any) => {
                                        setOpenEdit(false)
                                        notify({ 
                                            title: "Đã cập nhật thông tin", 
                                            description: `Nhưng không thể cập nhật trạng thái: ${String(e?.message || "Lỗi không xác định")}`, 
                                            variant: "warning" 
                                        })
                                    }
                                })
                            } else {
                                setOpenEdit(false)
                                notify({ title: "Đã cập nhật", variant: "success" })
                            }
                        },
                        onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể cập nhật"), variant: "destructive" })
                    })
                }}
            >
                <CourseForm
                    value={editForm}
                    onChange={(v) => {
                        setEditForm(v)
                        if (nameTouched) setNameError(validateCategoryName(v.name || ""))
                    }}
                    onValidate={(field, v) => { if (field === "name") { setNameTouched(true); setNameError(validateCategoryName(String(v))) } }}
                    categories={(categoriesData?.data ?? []) as any}
                    error={nameTouched ? (nameError || undefined) : undefined}
                />
            </AdminActionDialog>
    </div>
    );
}
