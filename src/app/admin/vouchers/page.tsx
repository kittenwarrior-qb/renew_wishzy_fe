"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { notify } from "@/components/shared/admin/Notifications"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import { Pencil, Trash2 } from "lucide-react"
import { formatDateDDMMYYYY, formatPercent, formatVND } from "@/lib/format"
import { useVoucherList, useCreateVoucher, useUpdateVoucher, useDeleteVoucher } from "@/components/shared/voucher/useVoucher"
import type { Voucher } from "@/services/voucher"
import { VoucherForm, type VoucherFormValue } from "@/components/shared/voucher/VoucherForm"
import DynamicTable, { type Column } from "@/components/shared/common/DynamicTable"
import QueryController from "@/components/shared/common/QueryController"
import { AdminDataErrorState } from "@/components/shared/admin/AdminDataErrorState"
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore"

export default function Page() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { setPrimaryAction } = useAdminHeaderStore()

    const [page, setPage] = React.useState<number>(Number(searchParams.get("page") || 1))
    const [limit, setLimit] = React.useState<number>(Number(searchParams.get("limit") || 10))

    const [filter, setFilter] = React.useState<{ code?: string; isActive?: string }>(() => ({
        code: searchParams.get("code") || "",
        isActive: searchParams.get("isActive") || "",
    }))
    const { data, isPending, isFetching, isError, refetch } = useVoucherList({
        page,
        limit,
        code: filter.code,
        isActive:
            filter.isActive === undefined || filter.isActive === ""
                ? undefined
                : filter.isActive === "true",
    })
    const [editInitialForm, setEditInitialForm] = React.useState<VoucherFormValue | null>(null)
    const { mutate: createVoucher, isPending: creating } = useCreateVoucher()
    const { mutate: updateVoucher, isPending: updating } = useUpdateVoucher()
    const { mutate: deleteVoucher, isPending: deleting } = useDeleteVoucher()

    const [openCreate, setOpenCreate] = React.useState(false)
    const [openEdit, setOpenEdit] = React.useState(false)
    const [editing, setEditing] = React.useState<Voucher | null>(null)
    const [openDeleteConfirm, setOpenDeleteConfirm] = React.useState(false)
    const [openUnsavedConfirm, setOpenUnsavedConfirm] = React.useState(false)
    const [target, setTarget] = React.useState<Voucher | null>(null)

    const [form, setForm] = React.useState<VoucherFormValue>({
        code: "",
        name: "",
        discountType: "percent",
        discountValue: 0,
        maxDiscountAmount: "",
        minOrderAmount: "",
        perUserLimit: "",
        totalLimit: "",
        applyScope: "all",
        categoryId: "",
        courseId: "",
        isActive: true,
        startDate: null,
        endDate: null,
    })
    const [errors, setErrors] = React.useState<Partial<Record<keyof VoucherFormValue, string>>>({})

    const toISODate = React.useCallback((s?: string | null): string | null => {
        if (!s) return null
        const str = String(s).trim()
        if (!str) return null
        if (str.includes("/")) {
            const [dd, mm, yyyy] = str.split("/")
            const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
            if (Number.isNaN(d.getTime())) return null
            const y = d.getFullYear()
            const m = String(d.getMonth() + 1).padStart(2, "0")
            const day = String(d.getDate()).padStart(2, "0")
            return `${y}-${m}-${day}`
        }
        const d = new Date(str)
        if (Number.isNaN(d.getTime())) return null
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, "0")
        const day = String(d.getDate()).padStart(2, "0")
        return `${y}-${m}-${day}`
    }, [])

    const validate = (v: VoucherFormValue) => {
        const e: Partial<Record<keyof VoucherFormValue, string>> = {}
        if (!v.code?.trim()) e.code = "Vui lòng nhập mã"
        if (!v.name?.trim()) e.name = "Vui lòng nhập tên"
        if (!v.discountType) e.discountType = "Chọn loại"
        if (v.discountValue === "" || Number.isNaN(Number(v.discountValue)) || Number(v.discountValue) <= 0)
            e.discountValue = "Nhập giá trị hợp lệ"
        if (v.perUserLimit === "" || Number(v.perUserLimit) < 1)
            e.perUserLimit = "Giới hạn/người phải >= 1"
        if (v.applyScope === "category" && !v.categoryId) e.categoryId = "Chọn danh mục"
        if (v.applyScope === "course" && !v.courseId) e.courseId = "Chọn khoá học"
        return e
    }

    const resetForm = () => {
        setForm({
            code: "",
            name: "",
            discountType: "percent",
            discountValue: 0,
            maxDiscountAmount: "",
            minOrderAmount: "",
            perUserLimit: "",
            totalLimit: "",
            applyScope: "all",
            categoryId: "",
            courseId: "",
            isActive: true,
            startDate: null,
            endDate: null,
        })
        setErrors({})
        setEditInitialForm(null)
    }

    const isEditDirty = React.useMemo(() => {
        if (!openEdit || !editInitialForm) return false
        try {
            return JSON.stringify(editInitialForm) !== JSON.stringify(form)
        } catch {
            return false
        }
    }, [openEdit, editInitialForm, form])

    const handleEditOpenChange = (open: boolean) => {
        if (!open) {
            if (isEditDirty) {
                setOpenUnsavedConfirm(true)
                return
            }
            setOpenEdit(false)
            setEditing(null)
            setEditInitialForm(null)
            return
        }
        setOpenEdit(true)
    }

    React.useEffect(() => {
        const qs = new URLSearchParams()
        if (filter.code) qs.set("code", filter.code)
        if (filter.isActive) qs.set("isActive", filter.isActive)
        if (page !== 1) qs.set("page", String(page))
        if (limit !== 10) qs.set("limit", String(limit))

        const href = `/admin/vouchers${qs.toString() ? `?${qs.toString()}` : ""}`
        const current = `${window.location.pathname}${window.location.search}`
        if (current !== href) router.replace(href)
    }, [filter, page, limit, router])

    React.useEffect(() => {
        setPrimaryAction({
            label: "Thêm voucher",
            variant: "default",
            onClick: () => {
                resetForm()
                setOpenCreate(true)
            },
        })

        return () => setPrimaryAction(null)
    }, [])

    const items = data?.data ?? []
    const total = data?.total ?? 0
    const currentPage = data?.page ?? page
    const pageSize = data?.limit ?? limit

    const columns: Column<Voucher>[] = [
        { key: "code", title: "Mã" },
        { key: "name", title: "Tên" },
        {
            key: "discountType",
            title: "Loại",
            align: "center",
            render: (row: Voucher) => String(row.discountType || "").toLowerCase(),
        },
        {
            key: "discountValue",
            title: "Giá trị",
            align: "right",
            render: (row: Voucher) =>
                row.discountType === "percent"
                    ? formatPercent(row.discountValue)
                    : formatVND(row.discountValue),
        },
        {
            key: "maxDiscountAmount",
            title: "Giảm tối đa",
            align: "right",
            render: (row: Voucher) => (row.maxDiscountAmount ? formatVND(row.maxDiscountAmount) : "-"),
        },
        {
            key: "minOrderAmount",
            title: "Đơn tối thiểu",
            align: "right",
            render: (row: Voucher) => (row.minOrderAmount ? formatVND(row.minOrderAmount) : "-"),
        },
        {
            key: "applyScope",
            title: "Phạm vi",
            render: (row: Voucher) => (
                <span className="text-xs capitalize">{row.applyScope}</span>
            ),
        },
        {
            key: "time",
            title: "Thời gian",
            align: "center",
            render: (row: Voucher) => (
                <span className="text-xs">
                    {row.startDate ? formatDateDDMMYYYY(row.startDate) : "—"} {" "}→{" "}
                    {row.endDate ? formatDateDDMMYYYY(row.endDate) : "—"}
                </span>
            ),
        },
        {
            key: "isActive",
            title: "Kích hoạt",
            align: "center",
            render: (row: Voucher) => (
                <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.isActive
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                        }`}
                >
                    {row.isActive ? "Bật" : "Tắt"}
                </span>
            ),
        },
        {
            key: "actions",
            title: "Hành động",
            align: "right",
            render: (row: Voucher) => (
                <div className="inline-flex items-center gap-1">
                    <button
                        title="Sửa"
                        type="button"
                        className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent cursor-pointer"
                        onClick={() => {
                            setEditing(row)
                            const nextForm: VoucherFormValue = {
                                code: row.code,
                                name: row.name || "",
                                discountType: row.discountType || "percent",
                                discountValue: row.discountValue ?? 0,
                                maxDiscountAmount: row.maxDiscountAmount ?? "",
                                minOrderAmount: row.minOrderAmount ?? "",
                                perUserLimit: row.perUserLimit ?? "",
                                totalLimit: row.totalLimit ?? "",
                                applyScope: row.applyScope || "all",
                                categoryId: row.categoryId ?? "",
                                courseId: row.courseId ?? "",
                                isActive: !!row.isActive,
                                startDate: row.startDate || null,
                                endDate: row.endDate || null,
                            }
                            setForm(nextForm)
                            setEditInitialForm(nextForm)
                            setOpenEdit(true)
                        }}
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        title="Xoá"
                        type="button"
                        className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-accent text-destructive cursor-pointer"
                        onClick={() => {
                            setTarget(row)
                            setOpenDeleteConfirm(true)
                        }}
                        disabled={deleting}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ]

    return (
        <div className="relative p-4 md:p-6">
            <LoadingOverlay show={isPending || isFetching} />
            <QueryController
                initial={{ code: filter.code || "", isActive: filter.isActive || "" }}
                debounceMs={300}
                onChange={(q) => {
                    setFilter(q as any)
                    setPage(1)
                }}
            >
                {({ query, setQuery, reset }) => (
                    <div className="mb-2 flex items-center gap-2">
                        <input
                            value={query.code || ""}
                            onChange={(e) => setQuery({ code: e.target.value })}
                            placeholder="Tìm mã voucher..."
                            className="h-9 rounded border px-3 text-sm"
                        />
                        <select
                            className="h-9 rounded border px-2 text-sm"
                            value={query.isActive || ""}
                            onChange={(e) => setQuery({ isActive: e.target.value })}
                        >
                            <option value="">Tất cả</option>
                            <option value="true">Kích hoạt</option>
                            <option value="false">Tắt</option>
                        </select>
                        <button className="h-9 px-3 border rounded" onClick={reset}>
                            Reset
                        </button>
                    </div>
                )}
            </QueryController>

            {isError ? (
                <AdminDataErrorState
                    title="Không thể tải danh sách voucher"
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

            {/* Create Dialog */}
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="sm:max-w-lg h-screen sm:left-auto sm:right-0 sm:top-0 sm:translate-x-0 sm:translate-y-0">
                    <DialogHeader className="border-b pb-3">
                        <DialogTitle>Thêm voucher</DialogTitle>
                    </DialogHeader>
                    <VoucherForm value={form} onChange={setForm} error={errors} />
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setOpenCreate(false)}>
                            Huỷ
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            onClick={() => {
                                const e = validate(form)
                                setErrors(e)
                                if (Object.keys(e).length) return
                                createVoucher(
                                    {
                                        code: form.code.trim().toUpperCase(),
                                        name: form.name.trim(),
                                        discountType: form.discountType,
                                        discountValue: Number(form.discountValue),
                                        maxDiscountAmount:
                                            form.maxDiscountAmount === "" ? undefined : Number(form.maxDiscountAmount),
                                        minOrderAmount:
                                            form.minOrderAmount === "" ? undefined : Number(form.minOrderAmount),
                                        perUserLimit:
                                            form.perUserLimit === "" ? undefined : Number(form.perUserLimit),
                                        totalLimit:
                                            form.totalLimit === "" ? undefined : Number(form.totalLimit),
                                        applyScope: form.applyScope,
                                        categoryId:
                                            form.applyScope === "category"
                                                ? form.categoryId || undefined
                                                : undefined,
                                        courseId:
                                            form.applyScope === "course" ? form.courseId || undefined : undefined,
                                        isActive: !!form.isActive,
                                        startDate: toISODate(form.startDate),
                                        endDate: toISODate(form.endDate),
                                    },
                                    {
                                        onSuccess: () => {
                                            setOpenCreate(false)
                                            notify({ title: "Đã tạo", variant: "success" })
                                        },
                                        onError: (err: any) =>
                                            notify({
                                                title: "Lỗi",
                                                description: String(err?.message || "Không thể tạo"),
                                                variant: "destructive",
                                            }),
                                    },
                                )
                            }}
                        >
                            {creating ? "Đang tạo..." : "Tạo"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={openEdit} onOpenChange={handleEditOpenChange}>
                <DialogContent className="sm:max-w-lg sm:left-auto sm:right-0 h-screen sm:top-0 sm:translate-x-0 sm:translate-y-0">
                    <DialogHeader className="border-b pb-3">
                        <DialogTitle>Sửa voucher</DialogTitle>
                    </DialogHeader>
                    <VoucherForm value={form} onChange={setForm} error={errors} />
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => handleEditOpenChange(false)}>
                            Huỷ
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            disabled={!!updating}
                            onClick={() => {
                                if (!editing) return
                                const e = validate(form)
                                setErrors(e)
                                if (Object.keys(e).length) return
                                updateVoucher(
                                    {
                                        id: editing.id,
                                        code: form.code.trim().toUpperCase(),
                                        name: form.name.trim(),
                                        discountType: form.discountType,
                                        discountValue: Number(form.discountValue),
                                        maxDiscountAmount:
                                            form.maxDiscountAmount === "" ? null : Number(form.maxDiscountAmount),
                                        minOrderAmount:
                                            form.minOrderAmount === "" ? null : Number(form.minOrderAmount),
                                        perUserLimit:
                                            form.perUserLimit === "" ? null : Number(form.perUserLimit),
                                        totalLimit:
                                            form.totalLimit === "" ? null : Number(form.totalLimit),
                                        applyScope: form.applyScope,
                                        categoryId:
                                            form.applyScope === "category" ? form.categoryId || null : null,
                                        courseId:
                                            form.applyScope === "course" ? form.courseId || null : null,
                                        isActive: !!form.isActive,
                                        startDate: toISODate(form.startDate),
                                        endDate: toISODate(form.endDate),
                                    },
                                    {
                                        onSuccess: () => {
                                            setOpenEdit(false)
                                            notify({ title: "Đã cập nhật", variant: "success" })
                                        },
                                        onError: (err: any) =>
                                            notify({
                                                title: "Lỗi",
                                                description: String(err?.message || "Không thể cập nhật"),
                                                variant: "destructive",
                                            }),
                                    },
                                )
                            }}
                        >
                            {updating ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unsaved changes confirm (Edit) */}
            <ConfirmDialog
                open={openUnsavedConfirm}
                onOpenChange={setOpenUnsavedConfirm}
                title="Thay đổi chưa lưu"
                description={
                    <span>
                        Bạn có thay đổi <b>chưa lưu</b>. Đóng cửa sổ sẽ <b>mất tất cả thay đổi</b>. Bạn có chắc muốn đóng?
                    </span>
                }
                confirmText="Thoát"
                confirmVariant="default"
                loading={false}
                position="top"
                onConfirm={() => {
                    setOpenUnsavedConfirm(false)
                    setOpenEdit(false)
                    setEditing(null)
                    setEditInitialForm(null)
                }}
            />

            {/* Delete confirm */}
            <ConfirmDialog
                open={openDeleteConfirm}
                onOpenChange={setOpenDeleteConfirm}
                title="Xác nhận xoá"
                description={
                    <span>
                        Bạn có chắc muốn xoá voucher "<b>{target?.code}</b>"?
                    </span>
                }
                confirmText={deleting ? "Đang xoá..." : "Xoá"}
                confirmVariant="destructive"
                loading={deleting}
                position="top"
                onConfirm={() => {
                    if (!target) return
                    deleteVoucher(
                        { id: target.id },
                        {
                            onSuccess: () => {
                                setOpenDeleteConfirm(false)
                                notify({ title: "Đã xoá", variant: "success" })
                            },
                            onError: (err: any) =>
                                notify({
                                    title: "Lỗi",
                                    description: String(err?.message || "Không thể xoá"),
                                    variant: "destructive",
                                }),
                        },
                    )
                }}
            />
        </div>
    )
}
