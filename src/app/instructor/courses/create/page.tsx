"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAllCategories } from "@/components/shared/category/useCategory"
import { useCreateCourse } from "@/components/shared/course/useCourse"
import { CourseForm, type CourseFormValue, useUnsavedChanges } from "@/components/shared/course/CourseForm"
import { notify } from "@/components/shared/admin/Notifications"
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore"

export default function CreateCoursePage() {
    const router = useRouter()
    const { setPrimaryAction } = useAdminHeaderStore()

    const { data: categoriesData } = useAllCategories()
    const categories = categoriesData?.data ?? []
    const { mutate: createCourse, isPending } = useCreateCourse()

    const [form, setForm] = React.useState<CourseFormValue>({ name: "", categoryId: "", level: "beginner", price: 0, totalDuration: 0, status: false, description: "", notes: "", thumbnail: "" })
    const [dirty, setDirty] = React.useState(false)
    useUnsavedChanges(dirty)

    const handleSubmit = React.useCallback(() => {
        if (isPending) return
        // simple validation before submit
        const errors: string[] = []
        if (!form.name?.trim()) errors.push("Tên khoá học là bắt buộc")
        if (!form.categoryId) errors.push("Danh mục là bắt buộc")
        if (!form.level) errors.push("Cấp độ là bắt buộc")
        if (form.price == null || form.price < 0) errors.push("Giá không hợp lệ")
        if (form.totalDuration == null || form.totalDuration < 0) errors.push("Thời lượng không hợp lệ")
        if (errors.length) {
            notify({
                title: "Thiếu/không hợp lệ",
                description: errors[0],
                variant: "destructive",
            })
            return
        }
        const { status: _omitStatus, ...payload } = form
        createCourse(payload as any, {
            onSuccess: () => { notify({ title: "Đã tạo", variant: "success" }); setDirty(false); router.push(`/instructor/courses`) },
            onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể tạo"), variant: "destructive" })
        })
    }, [isPending, form, createCourse, router])

    React.useEffect(() => {
        setPrimaryAction(null)
        return () => setPrimaryAction(null)
    }, [setPrimaryAction])

    return (
        <div className="relative py-4 px-4 md:px-6">
            <CourseForm
                value={form}
                onChange={(v) => { setForm(v) }}
                categories={categories}
                loading={isPending}
                onDirtyChange={setDirty}
                onSubmit={handleSubmit}
                submitLabel={isPending ? "Đang lưu..." : "Tạo khóa học"}
                title="Tạo khóa học mới"
            />
        </div>
    )
}

