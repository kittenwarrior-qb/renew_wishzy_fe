"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useAllCategories } from "@/components/shared/category/useCategory"
import { useCourseDetail, useUpdateCourse } from "@/components/shared/course/useCourse"
import { CourseForm, type CourseFormValue, useUnsavedChanges } from "@/components/shared/course/CourseForm"
import { notify } from "@/components/shared/admin/Notifications"
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore"
import { SaleManagementSection } from "../../components"
import type { SaleInfo } from "@/types/sale"

export default function EditCoursePage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const router = useRouter()
  const { setPrimaryAction } = useAdminHeaderStore()

  const { data: categoriesData } = useAllCategories()
  const categories = categoriesData?.data ?? []
  const { data, isPending, isError } = useCourseDetail(id)
  const { mutate: updateCourse, isPending: updating } = useUpdateCourse()

  const [form, setForm] = React.useState<CourseFormValue>({ name: "", categoryId: "", level: "beginner", price: 0, totalDuration: 0, status: false, description: "", notes: "", thumbnail: "" })
  const [saleInfo, setSaleInfo] = React.useState<SaleInfo | null | undefined>((data as any)?.saleInfo)
  const [dirty, setDirty] = React.useState(false)
  useUnsavedChanges(dirty)

  React.useEffect(() => {
    if (data && (data as any).id) {
      // Xử lý categoryId - có thể là string, number, hoặc object với id
      let categoryIdValue = ""
      if ((data as any).categoryId) {
        if (typeof (data as any).categoryId === 'object' && (data as any).categoryId.id) {
          categoryIdValue = String((data as any).categoryId.id)
        } else {
          categoryIdValue = String((data as any).categoryId)
        }
      } else if ((data as any).category?.id) {
        categoryIdValue = String((data as any).category.id)
      }

      const formData: CourseFormValue = {
        name: String((data as any).name || "").trim(),
        categoryId: categoryIdValue,
        level: ((data as any).level || "beginner") as 'beginner' | 'intermediate' | 'advanced',
        price: Number((data as any).price || 0),
        totalDuration: Number((data as any).totalDuration || 0),
        status: Boolean((data as any).status),
        description: String((data as any).description || ""),
        notes: String((data as any).notes || ""),
        thumbnail: String((data as any).thumbnail || ""),
      }

      // Luôn update form với dữ liệu mới
      setForm(formData)
      setSaleInfo((data as any).saleInfo || null)
      setDirty(false)
    }
  }, [data])

  const handleSubmit = React.useCallback(() => {
    if (isPending || updating) return
    const errors: string[] = []
    if (!form.name?.trim()) errors.push("Tên khoá học là bắt buộc")
    if (!form.categoryId) errors.push("Danh mục là bắt buộc")
    if (!form.level) errors.push("Cấp độ là bắt buộc")
    if (form.price == null || form.price < 0) errors.push("Giá không hợp lệ")
    if (form.totalDuration == null || form.totalDuration < 0) errors.push("Thời lượng không hợp lệ")
    if (errors.length) {
      notify({ title: "Thiếu/không hợp lệ", description: errors[0], variant: "destructive" })
      return
    }
    // Loại bỏ các field không có trong UpdateCourseDto của backend
    // Backend UpdateCourseDto chỉ có: name, price, level, totalDuration, categoryId, description, notes, thumbnail
    // Không có: status (status được update qua endpoint riêng /courses/:id/status)
    const { status, ...updateData } = form
    
    // Làm sạch dữ liệu: loại bỏ các field undefined hoặc rỗng không cần thiết
    const cleanData: Record<string, any> = {
      name: updateData.name?.trim(),
      categoryId: updateData.categoryId,
      level: updateData.level,
      price: updateData.price,
      totalDuration: updateData.totalDuration,
    }
    
    // Chỉ thêm các field optional nếu có giá trị
    if (updateData.description) cleanData.description = updateData.description.trim()
    if (updateData.notes) cleanData.notes = updateData.notes.trim()
    if (updateData.thumbnail) cleanData.thumbnail = updateData.thumbnail.trim()
    
    updateCourse({ id, ...cleanData }, {
      onSuccess: () => {
        notify({ title: "Đã cập nhật", variant: "success" })
        setDirty(false)
        router.push(`/instructor/courses`)
      },
      onError: (e: any) =>
        notify({ title: "Lỗi", description: String(e?.message || "Không thể cập nhật"), variant: "destructive" }),
    })
  }, [isPending, updating, updateCourse, form, id, router])

  React.useEffect(() => {
    setPrimaryAction({
      label: updating ? "Đang lưu..." : "Lưu thay đổi",
      variant: "default",
      disabled: updating,
      onClick: handleSubmit,
    })

    return () => setPrimaryAction(null)
  }, [setPrimaryAction, updating, handleSubmit])

  const handleSaveSale = React.useCallback((newSaleInfo: SaleInfo | null) => {
    // TODO: Gọi API PATCH /courses/:id/sale khi backend sẵn sàng
    // Hiện tại chỉ update local state với mock data
    setSaleInfo(newSaleInfo)
    setDirty(true)
    notify({
      title: "Đã lưu sale",
      description: "Sale đã được cập nhật (mock data)",
      variant: "success",
    })
  }, [])

  return (
    <div className="relative py-4 px-4 md:px-6 space-y-6">
      {!isPending && data && (data as any).id ? (
        <>
          <CourseForm
            key={`course-form-${id}-${(data as any).id}`}
            value={form}
            onChange={(v) => { setForm(v); setDirty(true) }}
            categories={categories}
            loading={updating}
            onDirtyChange={setDirty}
            onSubmit={handleSubmit}
          />
          
          <div className="border-t pt-6">
            <SaleManagementSection
              price={form.price}
              saleInfo={saleInfo}
              onSave={handleSaveSale}
              loading={updating}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-sm text-muted-foreground">Đang tải dữ liệu...</div>
        </div>
      )}
    </div>
  )
}

