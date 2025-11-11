"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useParentCategories } from "@/components/shared/category/useCategory"
import { useCourseDetail, useUpdateCourse } from "@/components/shared/course/useCourse"
import { CourseForm, type CourseFormValue, useUnsavedChanges } from "@/components/shared/course/CourseForm"
import { notify } from "@/components/shared/admin/Notifications"

export default function EditCoursePage() {
  const params = useParams<{ locale: string; id: string }>()
  const locale = params?.locale || "vi"
  const id = params?.id as string
  const router = useRouter()

  const { data: parentsData } = useParentCategories()
  const categories = (parentsData?.data ?? []) as Array<{ id: string; name: string }>
  const { data, isPending } = useCourseDetail(id)
  const { mutate: updateCourse, isPending: updating } = useUpdateCourse()

  const [form, setForm] = React.useState<CourseFormValue>({ name: "", categoryId: "", level: "beginner", price: 0, totalDuration: 0, status: false, description: "", notes: "", thumbnail: "" })
  const [dirty, setDirty] = React.useState(false)
  useUnsavedChanges(dirty)

  React.useEffect(() => {
    if (data && (data as any).id) {
      setForm({
        name: (data as any).name || "",
        categoryId: (data as any).categoryId || "",
        level: (data as any).level || "beginner",
        price: Number((data as any).price || 0),
        totalDuration: Number((data as any).totalDuration || 0),
        status: Boolean((data as any).status),
        description: (data as any).description || "",
        notes: (data as any).notes || "",
        thumbnail: (data as any).thumbnail || "",
      })
      setDirty(false)
    }
  }, [data])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <CourseForm
        value={form}
        onChange={(v) => { setForm(v); setDirty(true) }}
        categories={categories}
        loading={isPending || updating}
        onDirtyChange={setDirty}
        onSubmit={() => {
          updateCourse({ id, ...(form as any) }, {
            onSuccess: () => { notify({ title: "Đã cập nhật", variant: "success" }); setDirty(false); router.push(`/${locale}/admin/courses`) },
            onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể cập nhật"), variant: "destructive" })
          })
        }}
      />
    </div>
  )
}
