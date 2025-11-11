"use client"

import * as React from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useCourseList, useDeleteCourse, useCreateCourse, useUpdateCourse, useUpdateCourseStatus } from "@/components/shared/course/useCourse"
import { useParentCategories } from "@/components/shared/category/useCategory"
import { useCreateChapter } from "@/components/shared/chapter/useChapter"
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
import { ChapterForm, type ChapterFormItem } from "@/components/shared/chapter/ChapterForm"
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
    const { mutate: createChapter, isPending: creatingChapter } = useCreateChapter()
    const [openDeleteConfirm, setOpenDeleteConfirm] = React.useState(false)
    const [target, setTarget] = React.useState<{ id: string; name: string } | null>(null)
    const [openCreate, setOpenCreate] = React.useState(false)
    const [openEdit, setOpenEdit] = React.useState(false)
    const [editing, setEditing] = React.useState<Course | null>(null)
    const [createStep, setCreateStep] = React.useState<1 | 2>(1) // Step 1: Chapters, Step 2: Course Info
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
    const [createChapters, setCreateChapters] = React.useState<ChapterFormItem[]>([{ name: "", description: "", duration: "0" }])
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
        if (createStep === 1) {
            // Step 1: Only check chapters
            return createChapters.some(ch => ch.name.trim() || ch.description.trim() || ch.duration !== "0")
        } else {
            // Step 2: Check course form
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
        }
    }, [openCreate, createStep, createForm, createChapters])
    
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
        setCreateChapters([{ name: "", description: "", duration: "0" }])
        setCreateStep(1) // Start with chapters step
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

            {/* Unified Create Dialog - Wizard Style */}
            <AdminActionDialog
                open={openCreate}
                onOpenChange={(next) => {
                    if (!next) {
                        if (isCreateDirty && !bypassUnsavedGuardRef.current) {
                            pendingCloseRef.current = () => {
                                bypassUnsavedGuardRef.current = true
                                setOpenCreate(false)
                                setCreateStep(1)
                                bypassUnsavedGuardRef.current = false
                            }
                            setUnsavedOpen(true)
                            return
                        }
                    }
                    if (!next) {
                        setCreateStep(1) // Reset to step 1 when closing
                    }
                    setOpenCreate(next)
                }}
                title={createStep === 1 ? "Bước 1: Tạo Chapters" : "Bước 2: Thông tin khóa học"}
                confirmText={
                    creating || creatingChapter ? "Đang lưu..." : 
                    createStep === 1 ? "Tiếp theo" : "Tạo khóa học"
                }
                loading={creating || creatingChapter}
                position="top"
                onConfirm={() => {
                    if (createStep === 1) {
                        // Step 1: Validate chapters and move to step 2
                        const validChapters = createChapters.filter(ch => ch.name.trim())
                        if (validChapters.length === 0) {
                            notify({ title: "Lỗi", description: "Vui lòng thêm ít nhất một chapter", variant: "destructive" })
                            return
                        }
                        // Validate each chapter has name and duration
                        for (const ch of validChapters) {
                            if (!ch.name.trim()) {
                                notify({ title: "Lỗi", description: "Tất cả chapters phải có tên", variant: "destructive" })
                                return
                            }
                            if (!ch.duration || parseFloat(ch.duration) <= 0) {
                                notify({ title: "Lỗi", description: "Tất cả chapters phải có thời lượng lớn hơn 0", variant: "destructive" })
                                return
                            }
                        }
                        setCreateStep(2)
                        return
                    }
                    
                    // Step 2: Create course with chapters
                    const err = validateCategoryName(createForm.name || "")
                    setNameError(err)
                    setNameTouched(true)
                    if (err) return
                    if (!createForm.categoryId) {
                        notify({ title: "Lỗi", description: "Vui lòng chọn danh mục", variant: "destructive" })
                        return
                    }
                    // Validate chapters
                    const validChapters = createChapters.filter(ch => ch.name.trim())
                    if (validChapters.length === 0) {
                        notify({ title: "Lỗi", description: "Vui lòng thêm ít nhất một chapter", variant: "destructive" })
                        return
                    }
                    // Calculate totalDuration in seconds
                    const totalDuration = validChapters.reduce((sum, ch) => {
                        const minutes = parseFloat(ch.duration) || 0
                        return sum + (minutes * 60)
                    }, 0)
                    
                    // Create course first with chapters-based totalDuration
                    // Format request according to Swagger API spec:
                    // { name, price, level, totalDuration, categoryId, description?, notes?, thumbnail? }
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
                        totalDuration: totalDuration, // In seconds, calculated from chapters
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
                            // Extract courseId from response - API returns { success: true, data: { id: ... } }
                            // apiRequest returns response.data from axios, which is the API response body
                            // Response structure: { success: true, data: { id: "...", ... }, message: "...", url: "..." }
                            const courseId = response?.data?.id || response?.id || response?.data?.data?.id
                            if (!courseId) {
                                console.error("Course creation response (full):", JSON.stringify(response, null, 2))
                                notify({ title: "Lỗi", description: "Không thể lấy ID khóa học. Vui lòng kiểm tra console.", variant: "destructive" })
                                return
                            }
                            
                            // Create chapters sequentially and track created durations
                            let chapterIndex = 0
                            const createdDurations: number[] = []
                            
                            const createNextChapter = () => {
                                if (chapterIndex >= validChapters.length) {
                                    // All chapters created, now update course with actual totalDuration and set status = true
                                    const actualTotalDuration = createdDurations.reduce((sum, dur) => sum + dur, 0)
                                    const needsDurationUpdate = actualTotalDuration !== totalDuration
                                    
                                    // Always set status to true after creating course (checkbox is checked by default)
                                    const finalizeCourse = () => {
                                        updateCourseStatus({ id: String(courseId), status: true }, {
                                            onSuccess: () => {
                                                setOpenCreate(false)
                                                setCreateStep(1)
                                                notify({ title: "Đã tạo khóa học thành công", variant: "success" })
                                            },
                                            onError: (e: any) => {
                                                setOpenCreate(false)
                                                setCreateStep(1)
                                                notify({ 
                                                    title: "Đã tạo khóa học", 
                                                    description: `Không thể kích hoạt khóa học: ${String(e?.message || "Lỗi không xác định")}`, 
                                                    variant: "warning" 
                                                })
                                            }
                                        })
                                    }
                                    
                                    // Update totalDuration if different, then set status
                                    if (needsDurationUpdate) {
                                        updateCourse({
                                            id: String(courseId),
                                            totalDuration: actualTotalDuration,
                                        }, {
                                            onSuccess: () => {
                                                finalizeCourse()
                                            },
                                            onError: (e: any) => {
                                                // Still try to set status even if duration update fails
                                                finalizeCourse()
                                            }
                                        })
                                    } else {
                                        // Just set status
                                        finalizeCourse()
                                    }
                                    return
                                }
                                
                                const ch = validChapters[chapterIndex]
                                const chapterDuration = parseFloat(ch.duration) * 60 || 0 // Convert minutes to seconds
                                
                                createChapter({
                                    name: normalizeSpaces(ch.name),
                                    description: ch.description ? normalizeSpaces(ch.description) : undefined,
                                    duration: chapterDuration,
                                    courseId: String(courseId),
                                }, {
                                    onSuccess: (chapterResponse: any) => {
                                        // Track the actual duration that was created
                                        const actualDuration = chapterResponse?.data?.duration || chapterResponse?.data?.data?.duration || chapterDuration
                                        createdDurations.push(actualDuration)
                                        chapterIndex++
                                        createNextChapter()
                                    },
                                    onError: (e: any) => {
                                        notify({ title: "Lỗi", description: `Không thể tạo chapter "${ch.name}": ${String(e?.message || "Lỗi không xác định")}`, variant: "destructive" })
                                        chapterIndex++
                                        createNextChapter() // Continue with next chapter even if one fails
                                    }
                                })
                            }
                            
                            createNextChapter()
                        },
                        onError: (e: any) => {
                            console.error("Course creation error:", e)
                            notify({ title: "Lỗi", description: String(e?.message || "Không thể tạo"), variant: "destructive" })
                        }
                    })
                }}
            >
                <div className="space-y-4">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 pb-4 border-b">
                        <div className={`flex items-center gap-2 ${createStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${createStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                1
                            </div>
                            <span className="text-sm font-medium">Chapters</span>
                        </div>
                        <div className="flex-1 h-px bg-border mx-2" />
                        <div className={`flex items-center gap-2 ${createStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${createStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                2
                            </div>
                            <span className="text-sm font-medium">Thông tin khóa học</span>
                        </div>
                    </div>

                    {createStep === 1 ? (
                        <div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Vui lòng tạo ít nhất một chapter trước khi tiếp tục. Thông tin chapters sẽ được sử dụng để tính tổng thời lượng khóa học.
                            </p>
                            <ChapterForm
                                chapters={createChapters}
                                onChange={setCreateChapters}
                                disabled={creating || creatingChapter}
                            />
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Đã tạo {createChapters.filter(ch => ch.name.trim()).length} chapter(s). Vui lòng nhập thông tin khóa học.
                            </p>
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
                            <div className="mt-4 p-3 bg-muted/50 rounded-md">
                                <p className="text-xs font-medium mb-2">Tổng hợp chapters:</p>
                                <div className="space-y-1 text-xs">
                                    {createChapters.filter(ch => ch.name.trim()).map((ch, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <span>{ch.name}</span>
                                            <span className="text-muted-foreground">{ch.duration} phút</span>
                                        </div>
                                    ))}
                                    <div className="pt-2 border-t mt-2 flex justify-between font-medium">
                                        <span>Tổng thời lượng:</span>
                                        <span>{(createChapters.reduce((sum, ch) => sum + (parseFloat(ch.duration) || 0), 0) / 60).toFixed(1)} giờ</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCreateStep(1)}
                                    disabled={creating || creatingChapter}
                                    className="w-full"
                                >
                                    Quay lại
                                </Button>
                            </div>
                        </div>
                    )}
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
