"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useUserDetail } from "@/components/shared/user/useUser"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/stores/useAppStore"

export default function Page() {
    const params = useParams<{ locale: string; id: string }>()
    const locale = params?.locale || "vi"
    const id = params?.id as string
    const router = useRouter()
    const { theme } = useAppStore()
    const logoSrc = theme === 'dark' ? "/images/white-logo.png" : "/images/black-logo.png"

    // Redirect if ID is invalid
    React.useEffect(() => {
        if (!id || id === 'undefined') {
            router.replace(`/${locale}/admin/users/students`)
        }
    }, [id, locale, router])

    const { data: user, isPending, isError } = useUserDetail(id)

    // Don't render if ID is invalid
    if (!id || id === 'undefined') {
        return null
    }

    return (
        <div className="relative p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-lg font-semibold">Chi tiết học sinh</h1>
                <Link href={`/${locale}/admin/users/students`}>
                    <Button variant="outline">Quay lại</Button>
                </Link>
            </div>

            {isPending ? (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                        <img src={logoSrc} alt="Wishzy" className="h-10 w-auto opacity-90" />
                        <div aria-label="loading" className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span>Đang tải dữ liệu...</span>
                    </div>
                </div>
            ) : null}

            {isError ? (
                <div className="text-destructive">Không tải được dữ liệu</div>
            ) : !isPending && user ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="rounded-lg border p-4 space-y-4">
                        <div className="flex items-center gap-4">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.fullName} className="h-20 w-20 rounded-full object-cover" />
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-muted" />
                            )}
                            <div>
                                <div className="text-lg font-semibold">{user.fullName}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="text-muted-foreground">Số điện thoại</div>
                                <div>{user.phone || '-'}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Giới tính</div>
                                <div className="capitalize">{user.gender || '-'}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Ngày sinh</div>
                                <div>{user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : '-'}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Vai trò</div>
                                <div className="capitalize">{user.role}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Địa chỉ</div>
                                <div>{user.address || '-'}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Trạng thái email</div>
                                <div>{user.verified || user.isEmailVerified ? 'Đã xác minh' : 'Chưa xác minh'}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Ngày tạo</div>
                                <div>{user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : '-'}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Cập nhật</div>
                                <div>{user.updatedAt ? new Date(user.updatedAt).toLocaleString('vi-VN') : '-'}</div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">Ghi chú</div>
                        <div className="mt-2 text-sm">Chỉ xem thông tin học sinh. Không có quyền chỉnh sửa.</div>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border p-8 text-center text-muted-foreground">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19 19l-4-4m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </div>
                    <div className="text-sm">Không tìm thấy học sinh</div>
                </div>
            )}
        </div>
    )
}
