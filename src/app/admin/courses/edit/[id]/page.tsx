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
  const params = useParams<{ id: string }>();
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
    console.log("Course data received:", data);
    if (data) {
      const courseData = (data as any).data || data;
      console.log("Extracted course data:", courseData);

      if (courseData && courseData.id) {
        setForm({
          name: courseData.name || "",
          categoryId: courseData.categoryId || "",
          level: courseData.level || "beginner",
          price: Number(courseData.price || 0),
          totalDuration: Number(courseData.totalDuration || 0),
          status: Boolean(courseData.status),
          description: courseData.description || "",
          notes: courseData.notes || "",
          thumbnail: courseData.thumbnail || "",
        });
        setDirty(false);
      }
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
          router.push(`/admin/courses`);
        },
        onError: (e: any) =>
          notify({
            title: "Lỗi",
            description: String(e?.message || "Không thể cập nhật"),
            variant: "destructive",
          }),
      }
    );
  }, [isPending, updating, updateCourse, form, id, router]);

  React.useEffect(() => {
    setPrimaryAction(null);
    return () => setPrimaryAction(null);
  }, [setPrimaryAction]);

  return (
    <div className="relative py-4 px-4 md:px-6 max-w-7xl mx-auto">
      <button
        onClick={() => router.push(`/admin/courses`)}
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Trở về
      </button>
      {isPending ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4"></div>
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <CourseForm
          key={id}
          value={form}
          onChange={(v) => {
            setForm(v);
            setDirty(true);
          }}
          categories={categories}
          loading={updating}
          onDirtyChange={setDirty}
          onSubmit={handleSubmit}
          submitLabel={updating ? "Đang lưu..." : "Lưu thay đổi"}
          title="Chỉnh sửa khoá học"
          description="Cập nhật thông tin khoá học"
        />
      )}
    </div>
  );
}
