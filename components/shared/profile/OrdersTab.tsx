'use client';

import { useQueryHook } from "@/src/hooks/useQueryHook";
import { orderService } from "@/src/services/order";
import { Loader2, FileText } from "lucide-react";
import { OrderCard } from "./OrderCard";

interface OrderDetail {
    id: string;
    courseId: string;
    price: number;
    course: {
        id: string;
        title: string;
        thumbnail: string;
    };
}

interface Order {
    id: string;
    totalPrice: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    orderDetails: OrderDetail[];
}

export const OrdersTab = () => {
    const { data, isLoading } = useQueryHook(
        ['my-orders'],
        () => orderService.getMyOrders(),
        {
            staleTime: 0,
            cacheTime: 0,
        }
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Backend returns { items: [...], pagination: {...}, message: '...' }
    const orders: Order[] = data?.items || [];

    if (orders.length === 0) {
        return (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="text-muted-foreground">
                    <p className="text-lg mb-2">Chưa có đơn hàng nào</p>
                    <p className="text-sm">Các đơn hàng của bạn sẽ hiển thị ở đây</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold">
                    Tất cả đơn hàng ({orders.length})
                </h2>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
                {orders.map((order: Order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        </div>
    );
};
