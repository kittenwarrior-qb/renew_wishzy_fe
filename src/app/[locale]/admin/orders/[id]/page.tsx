"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { LoadingOverlay } from "@/components/shared/common/LoadingOverlay"
import { useOrderDetail } from "@/components/shared/order/useOrder"
import { BackButton } from "@/components/shared/common/BackButton"
import type { OrderDetailResponse, OrderDetailItem } from "@/types/order-detail.types"

export default function Page() {
    const params = useParams<{ locale: string; id: string }>()
    const locale = params?.locale || "vi"
    const id = params?.id as string
    const router = useRouter()

    const { data: order, isPending, isFetching, isError } = useOrderDetail(id)

    const user = order?.user
    const details: OrderDetailItem[] = order?.orderDetails ?? []
    const voucher = order?.voucher as unknown as { code?: string; id?: string } | null

    return (
        <div className="relative">
            <LoadingOverlay show={isPending || isFetching} />

            <div className="mb-4 flex items-center gap-2">
                <div className="inline-flex gap-2">
                    <BackButton fallbackHref={`/${locale}/admin/orders`} />
                </div>
                <h1 className="text-lg font-semibold">Đơn hàng #{id}</h1>
            </div>

            {isError ? (
                <div className="py-10 text-center text-destructive">Lỗi tải chi tiết đơn hàng</div>
            ) : !order ? null : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="rounded-lg border">
                            <div className="p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Khách hàng</div>
                                        <div className="font-medium">{user?.fullName || user?.email || order?.userId}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Tổng tiền</div>
                                        <div className="font-semibold">{Number(order?.totalPrice ?? 0).toLocaleString()} VNĐ</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <div className="text-muted-foreground">Trạng thái</div>
                                        <div className="capitalize">{order?.status}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Thanh toán</div>
                                        <div className="uppercase">{order?.paymentMethod}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Ngày tạo</div>
                                        <div>{order?.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Cập nhật</div>
                                        <div>{order?.updatedAt ? new Date(order.updatedAt).toLocaleString() : ''}</div>
                                    </div>
                                    {voucher ? (
                                        <div className="col-span-2">
                                            <div className="text-muted-foreground">Voucher</div>
                                            <div className="font-medium">{voucher.code || voucher.id}</div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border overflow-hidden">
                            <div className="p-4 border-b font-medium">Sản phẩm</div>
                            <div className="divide-y">
                                {details.length === 0 ? (
                                    <div className="p-4 text-sm text-muted-foreground">Không có sản phẩm</div>
                                ) : details.map((d) => (
                                    <div key={d.id} className="p-4 flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{d.course?.name || d.courseId}</div>
                                            <div className="text-xs text-muted-foreground">Mã chi tiết: {d.id}</div>
                                        </div>
                                        <div className="font-medium">{Number(d.price).toLocaleString()} VNĐ</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-lg border">
                            <div className="p-4 space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <div className="text-muted-foreground">Tổng tiền</div>
                                    <div className="font-semibold">{Number(order?.totalPrice ?? 0).toLocaleString()} VNĐ</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-muted-foreground">Trạng thái</div>
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${order?.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : order?.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'}`}>
                                        {order?.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-muted-foreground">Thanh toán</div>
                                    <div className="uppercase">{order?.paymentMethod}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
