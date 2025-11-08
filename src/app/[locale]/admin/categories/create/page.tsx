"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useCreateCategory, useParentCategories } from "@/components/shared/category/useCategory"
import type { CreateCategoryRequest } from "@/types/category"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryForm } from "@/components/shared/category/CategoryForm"
import { ConfirmDialog } from "@/components/shared/admin/ConfirmDialog"
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges"

export default function CategoryCreatePage() {
    const router = useRouter()
    const params = useParams<{ locale: string }>()
    const locale = params?.locale || "vi"

    const { mutate: createCategory, isPending } = useCreateCategory()
    const { data: parentList } = useParentCategories()

    const [form, setForm] = React.useState<CreateCategoryRequest>({
        name: "",
        notes: "",
        parentId: "",
    })
    const [openConfirm, setOpenConfirm] = React.useState(false)
    const [isDirty, setIsDirty] = React.useState(false)
    useUnsavedChanges(isDirty)
    // Modal rời trang được xử lý toàn cục trong AdminLayout.

    const onFormChange = (next: { name: string; notes?: string; parentId?: string }) => {
        setForm(prev => ({ ...prev, ...next }))
        setIsDirty(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name) return
        setOpenConfirm(true)
    }

    const confirmCreate = () => {
        const payload: CreateCategoryRequest = {
            name: form.name.trim(),
            notes: form.notes?.trim() || undefined,
            parentId: form.parentId ? form.parentId : undefined,
        }
        createCategory(payload as any, {
            onSuccess: () => {
                setIsDirty(false)
                router.push(`/${locale}/admin/categories`)
            },
        })
    }

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
                    <Button type="submit" className="cursor-pointer" disabled={isPending}>{isPending ? "Đang tạo..." : "Tạo"}</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin danh mục</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <CategoryForm
                                    value={{ name: form.name, notes: form.notes, parentId: form.parentId || undefined }}
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
                title="Xác nhận tạo danh mục"
                description={
                    <span>
                        Bạn có chắc muốn tạo danh mục "<b>{form.name}</b>"?
                    </span>
                }
                confirmText="Xác nhận"
                loading={isPending}
                onConfirm={confirmCreate}
            />

        </div>
    )
}
