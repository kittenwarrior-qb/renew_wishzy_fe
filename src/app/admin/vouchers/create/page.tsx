"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { notify } from "@/components/shared/admin/Notifications"
import { VoucherForm, type VoucherFormValue } from "@/components/shared/voucher/VoucherForm"
import { useCreateVoucher } from "@/components/shared/voucher/useVoucher"

const initialForm: VoucherFormValue = {
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
}

export default function CreateVoucherPage() {
    const router = useRouter()
    const { mutate: createVoucher, isPending } = useCreateVoucher()

    const [form, setForm] = React.useState<VoucherFormValue>(initialForm)
    const [errors, setErrors] = React.useState<Partial<Record<keyof VoucherFormValue, string>>>({})

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

    const handleSubmit = () => {
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
                applyScope: form.applyScope,
                categoryId:
                    form.applyScope === "category" ? form.categoryId || undefined : undefined,
                courseId:
                    form.applyScope === "course" ? form.courseId || undefined : undefined,
                isActive: !!form.isActive,
                startDate: form.startDate ?? null,
                endDate: form.endDate ?? null,
            },
            {
                onSuccess: () => {
                    notify({ title: "Đã tạo voucher", variant: "success" })
                    router.push(`/admin/vouchers`)
                },
                onError: (err: any) => {
                    notify({
                        title: "Lỗi",
                        description: String(err?.message || "Không thể tạo voucher"),
                        variant: "destructive",
                    })
                },
            },
        )
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-lg font-semibold">Tạo voucher mới</h1>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/admin/vouchers`)}
                    >
                        Quay lại
                    </Button>
                    <Button type="button" variant="default" disabled={isPending} onClick={handleSubmit}>
                        {isPending ? "Đang lưu..." : "Lưu"}
                    </Button>
                </div>
            </div>

            <VoucherForm value={form} onChange={setForm} error={errors} />
        </div>
    )
}
