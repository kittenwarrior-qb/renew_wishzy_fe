"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useCourseDetail } from "@/components/shared/course/useCourse"
import { useChapterList, useCreateChapter } from "@/components/shared/chapter/useChapter"
import { AdminCourseChapters } from "@/components/shared/course/AdminCourseChapters"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUnsavedChanges } from "@/components/shared/course/CourseForm"
import { useAppStore } from "@/stores/useAppStore"
import { AdminActionDialog } from "@/components/admin/common/AdminActionDialog"
import AdminCourseInstructor from "@/components/shared/admin/AdminCourseInstructor"
import AdminCourseFeedback from "@/components/shared/admin/AdminCourseFeedback"

export default function CourseDetailPage() {
    const params = useParams<{ locale: string; id: string }>()
    const locale = params?.locale || "vi"
    const courseId = params?.id as string

    const { data: course, isPending: loadingCourse } = useCourseDetail(courseId)
    const { data: chapterRes, isPending: loadingChapters } = useChapterList(courseId)
    const chapters = chapterRes?.items ?? []

    const [openCreate, setOpenCreate] = React.useState(false)
    const [name, setName] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [duration, setDuration] = React.useState<string>("")
    const [errors, setErrors] = React.useState<{ name?: string; duration?: string }>({})
    const { mutate: createChapter, isPending: creating } = useCreateChapter()
    const [dirty, setDirty] = React.useState(false)
    useUnsavedChanges(dirty && openCreate)

    const { theme } = useAppStore()
    const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"
    const [openDiscard, setOpenDiscard] = React.useState(false)

    const validate = () => {
        const next: { name?: string; duration?: string } = {}
        const n = name.trim()
        if (!n) next.name = "Tên chương là bắt buộc"
        else if (n.length > 255) next.name = "Tên tối đa 255 ký tự"
        if (duration !== "") {
            const d = Number(duration)
            if (Number.isNaN(d) || d < 0) next.duration = "Thời lượng phải >= 0"
        }
        setErrors(next)
        return Object.keys(next).length === 0
    }

    const onCreate = () => {
        if (!validate()) return
        createChapter({ courseId, name: name.trim(), description: description.trim() || undefined, duration: duration ? Number(duration) : undefined }, {
            onSuccess: () => { setOpenCreate(false); setName(""); setDescription(""); setDuration(""); setDirty(false) }
        })
    }

    return (
        <div className="p-4 md:p-6 space-y-6 relative">
            {(loadingCourse || loadingChapters) && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                        <img src={logoSrc} alt="Wishzy" className="h-10 w-auto opacity-90" />
                        <div aria-label="loading" className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span>Đang tải dữ liệu...</span>
                    </div>
                </div>
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={`/${locale}/admin/courses`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md px-2 py-1 hover:bg-accent">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <h1 className="text-xl font-semibold">{course?.name ?? "Chi tiết khoá học"}</h1>
                </div>
                <Button size="sm" className="h-9" onClick={() => setOpenCreate(true)}>Thêm chương</Button>
            </div>

            <div className="space-y-2">
                {course?.description ? (
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                ) : null}
            </div>

            <div>
                <h2 className="text-base font-semibold mb-2">Nội dung khoá học</h2>
                {loadingChapters ? (
                    <div className="text-sm text-muted-foreground">Đang tải chương...</div>
                ) : (
                    <AdminCourseChapters chapters={chapters as any} courseId={courseId} locale={locale} />
                )}
            </div>

            <div className="space-y-4 pt-6">
                <div className="border-t pt-4">
                    <h2 className="text-base font-semibold mb-3">Thông tin giảng viên</h2>
                    <AdminCourseInstructor instructor={(course as any)?.creator} />
                </div>
                <div className="border-t pt-4">
                    <h2 className="text-base font-semibold mb-3">Đánh giá & phản hồi</h2>
                    <AdminCourseFeedback courseId={courseId} />
                </div>
            </div>

            <Dialog open={openCreate} onOpenChange={(o) => {
                if (!o && dirty) {
                    setOpenDiscard(true)
                    return
                }
                setOpenCreate(o)
                if (!o) { setErrors({}); setName(""); setDescription(""); setDuration(""); setDirty(false) }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm chương</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên chương<span className="text-destructive">*</span></Label>
                            <Input id="name" value={name} onChange={(e) => { setName(e.target.value); setDirty(true); if (errors.name) setErrors({ ...errors, name: undefined }) }} placeholder="Ví dụ: Chương 1: Giới thiệu" />
                            {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea id="description" value={description} onChange={(e) => { setDescription(e.target.value); setDirty(true) }} placeholder="Mô tả ngắn cho chương" rows={4} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Thời lượng (phút)</Label>
                            <Input id="duration" type="number" min={0} value={duration} onChange={(e) => { setDuration(e.target.value); setDirty(true); if (errors.duration) setErrors({ ...errors, duration: undefined }) }} placeholder="Ví dụ: 60" />
                            {errors.duration ? <p className="text-sm text-destructive">{errors.duration}</p> : null}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => {
                            if (dirty) {
                                setOpenDiscard(true)
                            } else {
                                setOpenCreate(false)
                                setDirty(false)
                            }
                        }}>Huỷ</Button>
                        <Button onClick={onCreate} disabled={creating}>{creating ? "Đang tạo..." : "Tạo"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AdminActionDialog
                open={openDiscard}
                onOpenChange={setOpenDiscard}
                title="Bỏ thay đổi?"
                description={<span>Các thay đổi trong form tạo chương sẽ bị mất. Bạn có chắc muốn đóng?</span>}
                confirmText="Đóng"
                confirmVariant="default"
                loading={false}
                position="top"
                onConfirm={() => {
                    setOpenCreate(false)
                    setDirty(false)
                    setErrors({})
                    setName("")
                    setDescription("")
                    setDuration("")
                    setOpenDiscard(false)
                }}
            />
        </div>
    )
}
