"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon, Play, Trash2, Pencil, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format-duration";
import { ChapterType } from "@/src/types/chapter/chapter.types";
import { Button } from "@/components/ui/button";
import {
  useDeleteChapter,
  useUpdateChapter,
} from "@/components/shared/chapter/useChapter";
import { LectureFormModal } from "@/components/shared/lecture/LectureFormModal";
import {
  useCreateLecture,
  useDeleteLecture,
  useUpdateLecture,
  useGetLecture,
} from "@/components/shared/lecture/useLecture";
import { notify } from "@/components/shared/admin/Notifications";
import Link from "next/link";
import { AdminActionDialog } from "@/components/admin/common/AdminActionDialog";
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

function Trigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-center gap-2 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200" />
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AdminCourseChapters({
  chapters,
  courseId,
}: {
  chapters: ChapterType[];
  courseId: string;
}) {
  const { mutate: deleteChapter, isPending: deleting } = useDeleteChapter();
  const { mutate: updateChapter, isPending: updating } = useUpdateChapter();
  const { mutate: createLecture, isPending: creatingLecture } =
    useCreateLecture();
  const { mutate: updateLecture, isPending: updatingLecture } =
    useUpdateLecture();
  const { mutate: deleteLecture, isPending: deletingLecture } =
    useDeleteLecture();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [openDeleteId, setOpenDeleteId] = React.useState<string | null>(null);
  const [openEditId, setOpenEditId] = React.useState<string | null>(null);
  const [openLecture, setOpenLecture] = React.useState(false);
  const [lectureChapterId, setLectureChapterId] = React.useState<string | null>(
    null
  );
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [errors, setErrors] = React.useState<{ name?: string }>({});
  const [dirtyEdit, setDirtyEdit] = React.useState(false);
  const [openEditDiscard, setOpenEditDiscard] = React.useState(false);
  useUnsavedChanges(dirtyEdit && !!openEditId);

  // lecture edit/delete states
  const [openLectureEdit, setOpenLectureEdit] = React.useState(false);
  const [editingLectureId, setEditingLectureId] = React.useState<string | null>(
    null
  );
  const { data: editingLecture, isLoading: loadingLecture } = useGetLecture(
    editingLectureId || undefined
  );
  const [openDeleteLectureId, setOpenDeleteLectureId] = React.useState<
    string | null
  >(null);
  const [previewLecture, setPreviewLecture] = React.useState<{
    name: string;
    fileUrl?: string;
    duration?: number;
  } | null>(null);

  const onDelete = (id: string) => {
    setDeletingId(id);
    deleteChapter(
      { id, courseId },
      {
        onSuccess: () => {
          setDeletingId(null);
          notify({ title: "Đã xoá chương", variant: "success" });
        },
        onError: (e: any) => {
          setDeletingId(null);
          notify({
            title: "Lỗi",
            description: String(e?.message || "Không thể xoá chương"),
            variant: "destructive",
          });
        },
      }
    );
  };

  const openEdit = (ch: ChapterType) => {
    setOpenEditId(ch.id);
    setName(ch.name || "");
    setDescription(ch.description || "");
    setErrors({});
    setDirtyEdit(false);
  };

  const validate = () => {
    const next: { name?: string } = {};
    const n = (name || "").trim();
    if (!n) next.name = "Tên chương là bắt buộc";
    else if (n.length > 255) next.name = "Tên tối đa 255 ký tự";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onUpdate = () => {
    if (!openEditId) return;
    if (!validate()) return;
    const payload: {
      id: string;
      courseId: string;
      name?: string;
      description?: string;
    } = {
      id: openEditId,
      courseId,
      name: name.trim(),
    };
    if (description.trim()) payload.description = description.trim();
    updateChapter(payload as any, {
      onSuccess: () => {
        notify({ title: "Đã cập nhật chương", variant: "success" });
        setOpenEditId(null);
        setDirtyEdit(false);
      },
      onError: (e: any) =>
        notify({
          title: "Lỗi",
          description: String(e?.message || "Không thể cập nhật chương"),
          variant: "destructive",
        }),
    });
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full space-y-4"
      defaultValue="item-1"
    >
      {chapters?.map((chapter, idx) => (
        <AccordionItem
          className="overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-background to-muted/20 shadow-sm hover:shadow-md transition-all duration-200"
          value={chapter.id}
          key={chapter.id}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-muted/30 to-transparent border-b border-border/40">
            <Trigger className="flex items-center justify-between cursor-pointer gap-3 flex-1">
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                    <span className="text-sm font-bold">{idx + 1}</span>
                  </div>
                  <span className="font-semibold text-base">
                    {chapter.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">
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
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span className="font-medium">
                      {chapter.lecture?.length || 0} bài học
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">
                      {formatDuration(
                        chapter.lecture?.reduce(
                          (t, l) => t + (l?.duration || 0),
                          0
                        ) || 0,
                        "long"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </Trigger>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-2 cursor-pointer rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                title="Sửa chương"
                onClick={() => openEdit(chapter)}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="p-2 cursor-pointer rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                title="Xoá chương"
                disabled={deleting && deletingId === chapter.id}
                onClick={() => setOpenDeleteId(chapter.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <AccordionContent className="px-4 pb-4 pt-3">
            <div className="flex items-center justify-start mb-3">
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
                onClick={() => {
                  setLectureChapterId(chapter.id);
                  setOpenLecture(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Thêm bài học
              </Button>
            </div>
            {chapter.lecture && chapter.lecture.length > 0 ? (
              <div className="space-y-2">
                {chapter.lecture.map((lecture, lectureIdx) => (
                  <div
                    key={lecture.id}
                    className="group flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background hover:border-primary/30 hover:bg-accent/50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-primary flex-shrink-0">
                        <Play className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium truncate">
                          {lecture.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {formatDuration(lecture.duration, "long")}
                      </span>
                      <button
                        type="button"
                        className="p-1.5 cursor-pointer rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring opacity-0 group-hover:opacity-100"
                        title="Sửa bài học"
                        onClick={() => {
                          setEditingLectureId(lecture.id);
                          setOpenLectureEdit(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 cursor-pointer rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 opacity-0 group-hover:opacity-100"
                        title="Xoá bài học"
                        onClick={() => setOpenDeleteLectureId(lecture.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center rounded-lg border-2 border-dashed border-border/50 bg-muted/20">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Play className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Chưa có bài học
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bấm "Thêm bài học" để bắt đầu
                  </p>
                </div>
              </div>
            )}
          </AccordionContent>

          <AdminActionDialog
            open={openDeleteId === chapter.id}
            onOpenChange={(o) => setOpenDeleteId(o ? chapter.id : null)}
            title="Xác nhận xoá"
            description={
              <span>
                Bạn có chắc muốn xoá chương "<b>{chapter.name}</b>"?
              </span>
            }
            confirmText={
              deleting && deletingId === chapter.id ? "Đang xoá..." : "Xoá"
            }
            confirmVariant="destructive"
            loading={deleting && deletingId === chapter.id}
            position="top"
            onConfirm={() => onDelete(chapter.id)}
          />
        </AccordionItem>
      ))}
      <Dialog
        open={!!openEditId}
        onOpenChange={(o) => {
          if (!o && dirtyEdit) {
            setOpenEditDiscard(true);
            return;
          }
          if (!o) {
            setOpenEditId(null);
            setErrors({});
            setDirtyEdit(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa chương</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Tên chương<span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setDirtyEdit(true);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="Ví dụ: Chương 1: Giới thiệu"
              />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setDirtyEdit(true);
                }}
                placeholder="Mô tả ngắn cho chương"
                rows={4}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Thời lượng chương sẽ tự động tính từ tổng thời lượng các bài học
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                if (dirtyEdit) {
                  setOpenEditDiscard(true);
                } else {
                  setOpenEditId(null);
                  setDirtyEdit(false);
                }
              }}
            >
              Huỷ
            </Button>
            <Button onClick={onUpdate} disabled={updating}>
              {updating ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AdminActionDialog
        open={openEditDiscard}
        onOpenChange={setOpenEditDiscard}
        title="Bỏ thay đổi?"
        description={
          <span>
            Các thay đổi trong form sửa chương sẽ bị mất. Bạn có chắc muốn đóng?
          </span>
        }
        confirmText="Đóng"
        confirmVariant="default"
        loading={false}
        position="top"
        onConfirm={() => {
          setOpenEditId(null);
          setDirtyEdit(false);
          setErrors({});
          setOpenEditDiscard(false);
        }}
      />
      <LectureFormModal
        open={openLectureEdit}
        onOpenChange={(o) => {
          if (!o) {
            setOpenLectureEdit(false);
            setEditingLectureId(null);
          } else setOpenLectureEdit(true);
        }}
        loading={updatingLecture || loadingLecture}
        title="Sửa bài học"
        lectures={
          editingLecture
            ? chapters
                .flatMap((ch) => ch.lecture || [])
                .filter((l) => l.id !== editingLecture.id)
                .map((l) => ({
                  id: l.id,
                  name: l.name,
                  orderIndex: l.orderIndex,
                }))
            : []
        }
        defaultValue={
          editingLecture
            ? {
                name: editingLecture.name,
                description: editingLecture.description || "",
                fileUrl: editingLecture.fileUrl || "",
                duration: String(editingLecture.duration || ""),
                isPreview: !!editingLecture.isPreview,
                orderIndex: String(editingLecture.orderIndex || ""),
                thumbnailUrl: (editingLecture as any).thumbnailUrl || "",
              }
            : undefined
        }
        onSubmit={(payload) => {
          if (!editingLecture) return;
          updateLecture(
            { id: editingLecture.id, courseId, ...payload },
            {
              onSuccess: () => {
                setOpenLectureEdit(false);
                setEditingLectureId(null);
              },
            }
          );
        }}
      />
      <AdminActionDialog
        open={!!openDeleteLectureId}
        onOpenChange={(o) =>
          setOpenDeleteLectureId(o ? (openDeleteLectureId as string) : null)
        }
        title="Xác nhận xoá"
        description={<span>Bạn có chắc muốn xoá bài học này?</span>}
        confirmText={deletingLecture ? "Đang xoá..." : "Xoá"}
        confirmVariant="destructive"
        loading={deletingLecture}
        position="top"
        onConfirm={() => {
          if (!openDeleteLectureId) return;
          deleteLecture(
            { id: openDeleteLectureId, courseId },
            {
              onSuccess: () => setOpenDeleteLectureId(null),
            }
          );
        }}
      />
      <Dialog
        open={!!previewLecture}
        onOpenChange={(o) => {
          if (!o) setPreviewLecture(null);
        }}
      >
        <DialogContent className="sm:max-w-lg sm:left-auto sm:right-0 h-screen sm:top-0 sm:translate-x-0 sm:translate-y-0">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle className="text-base font-semibold truncate">
              Xem trước: {previewLecture?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
            {previewLecture?.fileUrl ? (
              <video
                src={previewLecture.fileUrl}
                controls
                className="w-full h-full rounded-md bg-black"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                Không có video
              </div>
            )}
          </div>
          <DialogFooter className="px-4 py-3 border-t flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => setPreviewLecture(null)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <LectureFormModal
        open={openLecture}
        onOpenChange={(o) => {
          setOpenLecture(o);
          if (!o) setLectureChapterId(null);
        }}
        loading={creatingLecture}
        lectures={
          lectureChapterId
            ? (
                chapters.find((ch) => ch.id === lectureChapterId)?.lecture || []
              ).map((l) => ({
                id: l.id,
                name: l.name,
                orderIndex: l.orderIndex,
              }))
            : []
        }
        onSubmit={(payload) => {
          if (!lectureChapterId) return;
          createLecture(
            { ...payload, chapterId: lectureChapterId, courseId },
            {
              onSuccess: () => {
                setOpenLecture(false);
                setLectureChapterId(null);
              },
            }
          );
        }}
      />
    </Accordion>
  );
}
