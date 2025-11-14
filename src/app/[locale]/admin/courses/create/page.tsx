"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useParentCategories } from "@/components/shared/category/useCategory"
import { useCreateCourse } from "@/components/shared/course/useCourse"
import { CourseForm, type CourseFormValue, useUnsavedChanges } from "@/components/shared/course/CourseForm"
import { notify } from "@/components/shared/admin/Notifications"

export default function CreateCoursePage() {
    const params = useParams<{ locale: string }>()
    const locale = params?.locale || "vi"
    const router = useRouter()

    const { data: parentsData } = useParentCategories()
    const categories = (parentsData?.data ?? []) as Array<{ id: string; name: string }>
    const { mutate: createCourse, isPending } = useCreateCourse()

    const [form, setForm] = React.useState<CourseFormValue>({ name: "", categoryId: "", level: "beginner", price: 0, totalDuration: 0, status: false, description: "", notes: "", thumbnail: "" })
    const [dirty, setDirty] = React.useState(false)
    useUnsavedChanges(dirty)

    return (
        <CourseForm
            value={form}
            onChange={(v) => { setForm(v) }}
            categories={categories}
            loading={isPending}
            onDirtyChange={setDirty}
            onSubmit={() => {
                const { status: _omitStatus, ...payload } = form
                createCourse(payload as any, {
                    onSuccess: () => { notify({ title: "Đã tạo", variant: "success" }); setDirty(false); router.push(`/${locale}/admin/courses`) },
                    onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể tạo"), variant: "destructive" })
                })
            }}
        />
    )
}
