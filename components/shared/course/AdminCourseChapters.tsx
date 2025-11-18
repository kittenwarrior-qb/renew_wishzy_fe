"use client"

import * as React from "react"
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon, Play, Trash2, Pencil, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChapterType } from "@/src/types/chapter/chapter.types"
import { Button } from "@/components/ui/button"
import { useDeleteChapter, useUpdateChapter } from "@/components/shared/chapter/useChapter"
import { LectureFormModal } from "@/components/shared/lecture/LectureFormModal"
import { useCreateLecture, useDeleteLecture, useUpdateLecture } from "@/components/shared/lecture/useLecture"
import { notify } from "@/components/shared/admin/Notifications"
import Link from "next/link"
import { AdminActionDialog } from "@/components/admin/common/AdminActionDialog"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUnsavedChanges } from "@/components/shared/course/CourseForm"

function Trigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
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
    )
}

export function AdminCourseChapters({ chapters, courseId, locale }: { chapters: ChapterType[]; courseId: string; locale: string }) {
    const { mutate: deleteChapter, isPending: deleting } = useDeleteChapter()
    const { mutate: updateChapter, isPending: updating } = useUpdateChapter()
    const { mutate: createLecture, isPending: creatingLecture } = useCreateLecture()
    const { mutate: updateLecture, isPending: updatingLecture } = useUpdateLecture()
    const { mutate: deleteLecture, isPending: deletingLecture } = useDeleteLecture()
    const [deletingId, setDeletingId] = React.useState<string | null>(null)
    const [openDeleteId, setOpenDeleteId] = React.useState<string | null>(null)
    const [openEditId, setOpenEditId] = React.useState<string | null>(null)
    const [openLecture, setOpenLecture] = React.useState(false)
    const [lectureChapterId, setLectureChapterId] = React.useState<string | null>(null)
    const [name, setName] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [duration, setDuration] = React.useState<string>("")
    const [errors, setErrors] = React.useState<{ name?: string; duration?: string }>({})
    const [dirtyEdit, setDirtyEdit] = React.useState(false)
    const [openEditDiscard, setOpenEditDiscard] = React.useState(false)
    useUnsavedChanges(dirtyEdit && !!openEditId)

    // lecture edit/delete states
    const [openLectureEdit, setOpenLectureEdit] = React.useState(false)
    const [editingLecture, setEditingLecture] = React.useState<{ id: string; name: string; description?: string; fileUrl?: string; duration: number; isPreview?: boolean; orderIndex: number } | null>(null)
    const [openDeleteLectureId, setOpenDeleteLectureId] = React.useState<string | null>(null)
    const [previewLecture, setPreviewLecture] = React.useState<{ name: string; fileUrl?: string; duration?: number } | null>(null)

    const onDelete = (id: string) => {
        setDeletingId(id)
        deleteChapter(
            { id, courseId },
            {
                onSuccess: () => {
                    setDeletingId(null)
                    notify({ title: "Đã xoá chương", variant: "success" })
                },
                onError: (e: any) => {
                    setDeletingId(null)
                    notify({ title: "Lỗi", description: String(e?.message || "Không thể xoá chương"), variant: "destructive" })
                },
            }
        )
    }

    const openEdit = (ch: ChapterType) => {
        setOpenEditId(ch.id)
        setName(ch.name || "")
        setDescription(ch.description || "")
        setDuration(ch.duration != null ? String(ch.duration) : "")
        setErrors({})
        setDirtyEdit(false)
    }

    const validate = () => {
        const next: { name?: string; duration?: string } = {}
        const n = (name || "").trim()
        if (!n) next.name = "Tên chương là bắt buộc"
        else if (n.length > 255) next.name = "Tên tối đa 255 ký tự"
        if (duration !== "") {
            const d = Number(duration)
            if (Number.isNaN(d) || d < 0) next.duration = "Thời lượng phải >= 0"
        }
        setErrors(next)
        return Object.keys(next).length === 0
    }

    const onUpdate = () => {
        if (!openEditId) return
        if (!validate()) return
        const payload: { id: string; courseId: string; name?: string; description?: string; duration?: number } = {
            id: openEditId,
            courseId,
            name: name.trim(),
        }
        if (description.trim()) payload.description = description.trim()
        if (duration !== "") {
            const d = Number(duration)
            if (!Number.isNaN(d)) payload.duration = d
        }
        updateChapter(payload as any, {
            onSuccess: () => {
                notify({ title: "Đã cập nhật chương", variant: "success" })
                setOpenEditId(null)
                setDirtyEdit(false)
            },
            onError: (e: any) => notify({ title: "Lỗi", description: String(e?.message || "Không thể cập nhật chương"), variant: "destructive" })
        })
    }

    return (
        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            {chapters?.map((chapter) => (
                <AccordionItem className="py-2 px-3 rounded-md border mb-3" value={chapter.id} key={chapter.id}>
                    <div className="flex items-center justify-between gap-3">
                        <Trigger className="flex items-center justify-between cursor-pointer gap-2">
                            <div className="flex items-center justify-between w-full">
                                <span>{chapter.name}</span>
                                <span className="flex gap-2 text-muted-foreground">
                                    <span>{chapter.lecture?.length} bài học</span>•
                                    <span>{chapter.lecture?.reduce((t, l) => t + (l?.duration || 0), 0)} phút</span>
                                </span>
                            </div>
                        </Trigger>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                className="p-2 cursor-pointer rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                title="Sửa chương"
                                onClick={() => openEdit(chapter)}
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                className="p-2 cursor-pointer rounded-md text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                                title="Xoá chương"
                                disabled={deleting && deletingId === chapter.id}
                                onClick={() => setOpenDeleteId(chapter.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <AccordionContent className="flex flex-col gap-2">
                        <div className="flex items-center justify-start mb-2">
                            <Button size="sm" variant="outline" className="h-8 gap-1 cursor-pointer" onClick={() => { setLectureChapterId(chapter.id); setOpenLecture(true) }}>
                                <Plus className="h-4 w-4" />Thêm bài học
                            </Button>
                        </div>
                        {chapter.lecture && chapter.lecture.length > 0 ? (
                            chapter.lecture.map((lecture) => (
                                <div key={lecture.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                    <div className="flex items-center gap-3">
                                        <Play className="w-4 h-4 text-muted-foreground" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{lecture.name}</span>
                                            {lecture.isPreview && lecture.fileUrl && (
                                                <button
                                                    className="text-xs cursor-pointer text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors w-fit"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setPreviewLecture({ name: lecture.name, fileUrl: lecture.fileUrl, duration: Number(lecture.duration || 0) })
                                                    }}
                                                >
                                                    Xem trước
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">{lecture.duration} phút</span>
                                        <button
                                            type="button"
                                            className="p-1.5 cursor-pointer rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            title="Sửa bài học"
                                            onClick={() => {
                                                setEditingLecture({
                                                    id: lecture.id,
                                                    name: lecture.name,
                                                    description: (lecture as any).description,
                                                    fileUrl: lecture.fileUrl,
                                                    duration: Number(lecture.duration || 0),
                                                    isPreview: !!lecture.isPreview,
                                                    orderIndex: Number(lecture.orderIndex || 0),
                                                })
                                                setOpenLectureEdit(true)
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            className="p-1.5 cursor-pointer rounded-md text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                                            title="Xoá bài học"
                                            onClick={() => setOpenDeleteLectureId(lecture.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-4 text-center text-sm text-muted-foreground">Chưa có bài học</div>
                        )}
                    </AccordionContent>

                    <AdminActionDialog
                        open={openDeleteId === chapter.id}
                        onOpenChange={(o) => setOpenDeleteId(o ? chapter.id : null)}
                        title="Xác nhận xoá"
                        description={<span>Bạn có chắc muốn xoá chương "<b>{chapter.name}</b>"?</span>}
                        confirmText={deleting && deletingId === chapter.id ? "Đang xoá..." : "Xoá"}
                        confirmVariant="destructive"
                        loading={deleting && deletingId === chapter.id}
                        position="top"
                        onConfirm={() => onDelete(chapter.id)}
                    />
                </AccordionItem>
            ))}
            <Dialog open={!!openEditId} onOpenChange={(o) => {
                if (!o && dirtyEdit) {
                    setOpenEditDiscard(true)
                    return
                }
                if (!o) { setOpenEditId(null); setErrors({}); setDirtyEdit(false) }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sửa chương</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Tên chương<span className="text-destructive">*</span></Label>
                            <Input id="edit-name" value={name} onChange={(e) => { setName(e.target.value); setDirtyEdit(true); if (errors.name) setErrors({ ...errors, name: undefined }) }} placeholder="Ví dụ: Chương 1: Giới thiệu" />
                            {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Mô tả</Label>
                            <Textarea id="edit-description" value={description} onChange={(e) => { setDescription(e.target.value); setDirtyEdit(true) }} placeholder="Mô tả ngắn cho chương" rows={4} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-duration">Thời lượng (phút)</Label>
                            <Input id="edit-duration" type="number" min={0} value={duration} onChange={(e) => { setDuration(e.target.value); setDirtyEdit(true); if (errors.duration) setErrors({ ...errors, duration: undefined }) }} placeholder="Ví dụ: 60" />
                            {errors.duration ? <p className="text-sm text-destructive">{errors.duration}</p> : null}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => { if (dirtyEdit) { setOpenEditDiscard(true) } else { setOpenEditId(null); setDirtyEdit(false) } }}>Huỷ</Button>
                        <Button onClick={onUpdate} disabled={updating}>{updating ? "Đang lưu..." : "Lưu"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AdminActionDialog
                open={openEditDiscard}
                onOpenChange={setOpenEditDiscard}
                title="Bỏ thay đổi?"
                description={<span>Các thay đổi trong form sửa chương sẽ bị mất. Bạn có chắc muốn đóng?</span>}
                confirmText="Đóng"
                confirmVariant="default"
                loading={false}
                position="top"
                onConfirm={() => {
                    setOpenEditId(null)
                    setDirtyEdit(false)
                    setErrors({})
                    setOpenEditDiscard(false)
                }}
            />
            <LectureFormModal
                open={openLectureEdit}
                onOpenChange={(o) => { if (!o) { setOpenLectureEdit(false); setEditingLecture(null) } else setOpenLectureEdit(true) }}
                loading={updatingLecture}
                title="Sửa bài học"
                defaultValue={editingLecture ? {
                    name: editingLecture.name,
                    description: editingLecture.description || "",
                    fileUrl: editingLecture.fileUrl || "",
                    duration: String(editingLecture.duration || ""),
                    isPreview: !!editingLecture.isPreview,
                    orderIndex: String(editingLecture.orderIndex || ""),
                } : undefined}
                onSubmit={(payload) => {
                    if (!editingLecture) return
                    updateLecture({ id: editingLecture.id, courseId, ...payload }, {
                        onSuccess: () => { setOpenLectureEdit(false); setEditingLecture(null) }
                    })
                }}
            />
            <AdminActionDialog
                open={!!openDeleteLectureId}
                onOpenChange={(o) => setOpenDeleteLectureId(o ? (openDeleteLectureId as string) : null)}
                title="Xác nhận xoá"
                description={<span>Bạn có chắc muốn xoá bài học này?</span>}
                confirmText={deletingLecture ? "Đang xoá..." : "Xoá"}
                confirmVariant="destructive"
                loading={deletingLecture}
                position="top"
                onConfirm={() => {
                    if (!openDeleteLectureId) return
                    deleteLecture({ id: openDeleteLectureId, courseId }, {
                        onSuccess: () => setOpenDeleteLectureId(null)
                    })
                }}
            />
            <Dialog open={!!previewLecture} onOpenChange={(o) => { if (!o) setPreviewLecture(null) }}>
                <DialogContent className="sm:max-w-lg sm:left-auto sm:right-0 h-screen sm:top-0 sm:translate-x-0 sm:translate-y-0">
                    <DialogHeader className="px-4 py-3 border-b">
                        <DialogTitle className="text-base font-semibold truncate">Xem trước: {previewLecture?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
                        {previewLecture?.fileUrl ? (
                            <video
                                src={previewLecture.fileUrl}
                                controls
                                className="w-full h-full rounded-md bg-black"
                            />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Không có video</div>
                        )}
                    </div>
                    <DialogFooter className="px-4 py-3 border-t flex justify-end">
                        <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setPreviewLecture(null)}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <LectureFormModal
                open={openLecture}
                onOpenChange={(o) => { setOpenLecture(o); if (!o) setLectureChapterId(null) }}
                loading={creatingLecture}
                onSubmit={(payload) => {
                    if (!lectureChapterId) return
                    createLecture({ ...payload, chapterId: lectureChapterId, courseId }, {
                        onSuccess: () => { setOpenLecture(false); setLectureChapterId(null) }
                    })
                }}
            />
        </Accordion>
    )
}
