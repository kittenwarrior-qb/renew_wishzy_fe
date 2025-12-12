"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useCourseDetail } from "@/components/shared/course/useCourse";
import {
  useChapterList,
  useCreateChapter,
} from "@/components/shared/chapter/useChapter";
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay";
import { AdminCourseChapters } from "@/components/shared/course/AdminCourseChapters";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUnsavedChanges } from "@/components/shared/course/CourseForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminCourseInstructor from "@/components/shared/admin/AdminCourseInstructor";
import AdminCourseFeedback from "@/components/shared/admin/AdminCourseFeedback";

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const courseId = params?.id as string;

  const {
    data: course,
    isPending: loadingCourse,
    isFetching: fetchingCourse,
  } = useCourseDetail(courseId);
  const {
    data: chapterRes,
    isPending: loadingChapters,
    isFetching: fetchingChapters,
  } = useChapterList(courseId);
  const chapters = chapterRes?.items ?? [];

  const [openCreate, setOpenCreate] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [orderIndex, setOrderIndex] = React.useState<number | undefined>(
    undefined
  );
  const [errors, setErrors] = React.useState<{ name?: string }>({});
  const { mutate: createChapter, isPending: creating } = useCreateChapter();
  const [dirty, setDirty] = React.useState(false);
  useUnsavedChanges(dirty && openCreate);

  const validate = () => {
    const next: { name?: string } = {};
    const n = name.trim();
    if (!n) next.name = "Tên chương là bắt buộc";
    else if (n.length > 255) next.name = "Tên tối đa 255 ký tự";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onCreate = () => {
    if (!validate()) return;
    createChapter(
      {
        courseId,
        name: name.trim(),
        description: description.trim() || undefined,
        orderIndex: orderIndex ?? chapters.length,
      },
      {
        onSuccess: () => {
          setOpenCreate(false);
          setName("");
          setDescription("");
          setOrderIndex(undefined);
          setDirty(false);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <LoadingOverlay
        show={
          loadingCourse || loadingChapters || fetchingCourse || fetchingChapters
        }
      />

      {/* Header Section */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40 shadow-sm">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Link
                href={`/admin/courses`}
                className="inline-flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-accent/80 transition-all duration-200 hover:shadow-sm shrink-0"
                title="Quay lại"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-xl md:text-2xl font-bold truncate">
                {course?.name ?? "Chi tiết khoá học"}
              </h1>
            </div>
            <Button
              size="sm"
              className="h-9 px-4 gap-2 shadow-sm hover:shadow-md transition-all duration-200 shrink-0"
              onClick={() => setOpenCreate(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Thêm chương</span>
              <span className="sm:hidden">Thêm</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-6 space-y-6">
        {/* Course Content Section */}
        <div className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Nội dung khoá học</h2>
                <p className="text-sm text-muted-foreground">
                  {chapters.length} chương
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {loadingChapters ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                  <p className="text-sm text-muted-foreground">
                    Đang tải chương...
                  </p>
                </div>
              </div>
            ) : chapters.length > 0 ? (
              <AdminCourseChapters
                chapters={chapters as any}
                courseId={courseId}
                locale={locale}
              />
            ) : (
              <div className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground mb-1">
                      Chưa có chương nào
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Bấm nút "Thêm chương" ở trên để bắt đầu tạo nội dung
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instructor Info */}
          <div className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent px-6 py-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold">Thông tin giảng viên</h2>
              </div>
            </div>
            <div className="p-6">
              <AdminCourseInstructor instructor={(course as any)?.creator} />
            </div>
          </div>

          {/* Feedback Section */}
          <div className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-6 py-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold">Đánh giá & phản hồi</h2>
              </div>
            </div>
            <div className="p-6">
              <AdminCourseFeedback courseId={courseId} />
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={openCreate}
        onOpenChange={(o) => {
          setOpenCreate(o);
          if (!o) {
            setErrors({});
            setName("");
            setDescription("");
            setOrderIndex(undefined);
            setDirty(false);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm chương mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên chương<span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setDirty(true);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="Ví dụ: Chương 1: Giới thiệu"
              />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setDirty(true);
                }}
                placeholder="Mô tả ngắn cho chương"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Vị trí</Label>
              <Select
                value={orderIndex?.toString()}
                onValueChange={(value) => {
                  setOrderIndex(parseInt(value));
                  setDirty(true);
                }}
              >
                <SelectTrigger id="position" className="w-full">
                  <SelectValue placeholder="Thêm vào cuối danh sách" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Thêm vào đầu danh sách</span>
                    </div>
                  </SelectItem>
                  {chapters.length > 0 &&
                    chapters.map((chapter: any, index: number) => (
                      <SelectItem
                        key={chapter.id}
                        value={(index + 1).toString()}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                          <span className="text-muted-foreground text-xs">
                            Sau
                          </span>
                          <span className="font-medium">
                            {index + 1}. {chapter.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {chapters.length > 0
                  ? "Chọn vị trí để chèn chương mới vào danh sách"
                  : "Chương này sẽ là chương đầu tiên trong khoá học"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Thời lượng chương sẽ tự động tính từ tổng thời lượng các bài học
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setOpenCreate(false);
                setDirty(false);
              }}
            >
              Huỷ
            </Button>
            <Button onClick={onCreate} disabled={creating}>
              {creating ? "Đang tạo..." : "Tạo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
