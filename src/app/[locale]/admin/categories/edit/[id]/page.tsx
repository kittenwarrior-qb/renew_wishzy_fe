"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useCategoryDetail, useUpdateCategory, useParentCategories } from "@/components/shared/category/useCategory"
import type { UpdateCategoryRequest } from "@/types/category"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryForm } from "@/components/shared/category/CategoryForm"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges"

export default function CategoryEditPage() {
    const router = useRouter()
    const params = useParams<{ locale: string; id: string }>()
    const locale = params?.locale || "vi"
    const id = params?.id as string

    const { data: category, isPending: loading, isError } = useCategoryDetail(id)
    const { mutate: updateCategory, isPending: saving } = useUpdateCategory()
    const { data: parentList } = useParentCategories()

    const [form, setForm] = React.useState<UpdateCategoryRequest>({ id: "", name: "", notes: "", parentId: "" })
    const [openConfirm, setOpenConfirm] = React.useState(false)
    const [isDirty, setIsDirty] = React.useState(false)
    useUnsavedChanges(isDirty)

    // Unsaved-changes modal is handled globally in AdminLayout. No native beforeunload.

    React.useEffect(() => {
        if (category) {
            setForm({
                id,
                name: category.name || "",
                notes: category.notes || "",
                parentId: category.parentId || "",
            })
        }
    }, [category, id])

    const onFormChange = (next: { name: string; notes?: string; parentId?: string }) => {
        setForm(prev => ({ ...prev, ...next }))
        setIsDirty(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name) return
        setOpenConfirm(true)
    }

    const confirmUpdate = () => {
        updateCategory(form, {
            onSuccess: () => {
                setIsDirty(false)
                router.push(`/${locale}/admin/categories`)
            },
        })
    }

    // Internal navigations are handled via custom modal through useUnsavedChanges.

    if (loading) return <div className="p-4 md:p-6 text-sm text-muted-foreground">Đang tải...</div>
    if (isError) return <div className="p-4 md:p-6 text-sm text-destructive">Không tải được dữ liệu</div>

    return (
        <div className="p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                    <Link
                        href={`/${locale}/admin/categories`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm text-muted-foreground hover:bg-accent"
                        aria-label="Trở lại"
                    >
                        <span aria-hidden>←</span>
                    </Link>
                    <Button type="submit" className="cursor-pointer" disabled={saving}>{saving ? "Đang lưu..." : "Cập nhật"}</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin danh mục</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <CategoryForm
                                    value={{ name: form.name ?? "", notes: form.notes ?? "", parentId: form.parentId ?? "" }}
                                    onChange={onFormChange}
                                    parents={(parentList?.data ?? []) as any}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
            <ConfirmDialog
                open={openConfirm}
                onOpenChange={setOpenConfirm}
                title="Xác nhận lưu thay đổi"
                description={
                    <span>
                        Bạn có chắc muốn lưu thay đổi cho danh mục "<b>{form.name}</b>"?
                    </span>
                }
                confirmText="Xác nhận"
                loading={saving}
                onConfirm={confirmUpdate}
            />
        </div>
    )
}
