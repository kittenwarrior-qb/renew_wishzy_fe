"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAllCategories } from "@/components/shared/category/useCategory";
import {
  useCourseDetail,
  useUpdateCourse,
} from "@/components/shared/course/useCourse";
import {
  CourseForm,
  type CourseFormValue,
  useUnsavedChanges,
} from "@/components/shared/course/CourseForm";
import { notify } from "@/components/shared/admin/Notifications";
import { useAdminHeaderStore } from "@/src/stores/useAdminHeaderStore";

export default function EditCoursePage() {
  const params = useParams<{ locale: string; id: string }>();
  const locale = params?.locale || "vi";
  const id = params?.id as string;
  const router = useRouter();
  const { setPrimaryAction } = useAdminHeaderStore();

  const { data: categoriesData } = useAllCategories();
  const categories = categoriesData?.data ?? [];
  const { data, isPending } = useCourseDetail(id);
  const { mutate: updateCourse, isPending: updating } = useUpdateCourse();

  const [form, setForm] = React.useState<CourseFormValue>({
    name: "",
    categoryId: "",
    level: "beginner",
    price: 0,
    totalDuration: 0,
    status: false,
    description: "",
    notes: "",
    thumbnail: "",
  });
  const [dirty, setDirty] = React.useState(false);
  useUnsavedChanges(dirty);

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
      });
      setDirty(false);
    }
  }, [data]);

  const handleSubmit = React.useCallback(() => {
    if (isPending || updating) return;
    const errors: string[] = [];
    if (!form.name?.trim()) errors.push("Tên khoá học là bắt buộc");
    if (!form.categoryId) errors.push("Danh mục là bắt buộc");
    if (!form.level) errors.push("Cấp độ là bắt buộc");
    if (form.price == null || form.price < 0) errors.push("Giá không hợp lệ");
    if (form.totalDuration == null || form.totalDuration < 0)
      errors.push("Thời lượng không hợp lệ");
    if (errors.length) {
      notify({
        title: "Thiếu/không hợp lệ",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }
    updateCourse(
      { id, ...(form as any) },
      {
        onSuccess: () => {
          notify({ title: "Đã cập nhật", variant: "success" });
          setDirty(false);
          router.push(`/${locale}/admin/courses`);
        },
        onError: (e: any) =>
          notify({
            title: "Lỗi",
            description: String(e?.message || "Không thể cập nhật"),
            variant: "destructive",
          }),
      }
    );
  }, [isPending, updating, updateCourse, form, id, router, locale]);

  React.useEffect(() => {
    setPrimaryAction(null);
    return () => setPrimaryAction(null);
  }, [setPrimaryAction]);

  return (
    <div className="relative py-4 px-4 md:px-6 max-w-7xl mx-auto">
      <CourseForm
        value={form}
        onChange={(v) => {
          setForm(v);
          setDirty(true);
        }}
        categories={categories}
        loading={isPending || updating}
        onDirtyChange={setDirty}
        onSubmit={handleSubmit}
        submitLabel={updating ? "Đang lưu..." : "Lưu thay đổi"}
        title="Chỉnh sửa khoá học"
        description="Cập nhật thông tin khoá học"
      />
    </div>
  );
}
