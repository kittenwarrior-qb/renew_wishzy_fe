"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useCategoryDetail, useDeleteCategory } from "@/components/shared/category/useCategory"
import { Button } from "@/components/ui/button"

export default function CategoryDeletePage() {
  const router = useRouter()
  const params = useParams<{ locale: string; id: string }>()
  const locale = params?.locale || "vi"
  const id = params?.id as string

  const { data: category, isPending: loading, isError } = useCategoryDetail(id)
  const { mutate: deleteCategory, isPending: deleting } = useDeleteCategory()

  const handleCancel = () => {
    router.push(`/${locale}/admin/categories`)
  }

  const handleConfirm = () => {
    if (!id) return
    deleteCategory(
      { id },
      {
        onSuccess: () => {
          router.push(`/${locale}/admin/categories`)
        },
      }
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/${locale}/admin/categories`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm text-muted-foreground hover:bg-accent"
          aria-label="Trở lại"
        >
          <span aria-hidden>←</span>
        </Link>
        <Button variant="destructive" type="button" onClick={handleConfirm} disabled={deleting} className="cursor-pointer">
          {deleting ? "Đang xoá..." : "Xoá"}
        </Button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Đang tải...</div>
      ) : isError ? (
        <div className="py-10 text-center text-sm text-destructive">Không tải được thông tin danh mục</div>
      ) : (
        <div className="space-y-4 rounded-md border p-4">
          <p>
            Bạn có chắc chắn muốn xoá danh mục
            <span className="font-medium"> {category?.name} </span>
            không?
          </p>
          <div className="text-sm text-muted-foreground">
            Hành động này sẽ xoá mềm. Bạn có thể khôi phục từ trang quản trị backend.
          </div>
          {/* Hành động chính đã chuyển lên header để đồng bộ UI */}
        </div>
      )}
    </div>
  )
}
