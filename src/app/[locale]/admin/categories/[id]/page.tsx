"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CategoryTree } from "@/components/shared/category/CategoryTree"
import { ChevronLeft } from "lucide-react"

export default function CategoryDetailPage() {
    const params = useParams<{ locale: string; id: string }>()
    const locale = params?.locale || "vi"
    const id = params?.id as string

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold">Chi tiết danh mục</h1>
                    <p className="text-sm text-muted-foreground">Cấu trúc cây danh mục và các danh mục con</p>
                </div>
                <Link href={`/${locale}/admin/categories`} className="inline-flex">
                    <Button variant="outline" className="gap-2 cursor-pointer">
                        <ChevronLeft className="h-4 w-4" />
                        Quay lại danh sách
                    </Button>
                </Link>
            </div>

            <Card>
                <CardContent className="p-4">
                    <CategoryTree id={id} />
                </CardContent>
            </Card>
        </div>
    )
}
