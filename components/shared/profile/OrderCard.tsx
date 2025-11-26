'use client';

import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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

interface OrderCardProps {
    order: Order;
}

const statusLabels: Record<string, string> = {
    pending: 'Đang chờ',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
};

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
};

const paymentMethodLabels: Record<string, string> = {
    vnpay: 'VNPay',
    momo: 'MoMo',
    zalopay: 'ZaloPay',
    free: 'Miễn phí',
};

export const OrderCard = ({ order }: OrderCardProps) => {
    return (
        <div className="bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-200">
            {/* Order Header */}
            <div className="p-4 sm:p-6 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Left side - Order info */}
                    <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs sm:text-sm text-muted-foreground">Mã đơn:</span>
                            <span className="font-mono text-xs sm:text-sm font-medium">
                                #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                            <span>
                                {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </span>
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                            <span className="font-medium">Thanh toán:</span>{' '}
                            {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
                        </div>
                    </div>

                    {/* Right side - Status and price */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2">
                        <span 
                            className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                                statusColors[order.status] || 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}
                        >
                            {statusLabels[order.status] || order.status}
                        </span>
                        <div className="text-base sm:text-lg font-bold text-primary whitespace-nowrap">
                            {Number(order.totalPrice).toLocaleString('vi-VN')} ₫
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Details */}
            <div className="p-4 sm:p-6">
                <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-3">
                    Khóa học ({order.orderDetails.length})
                </div>
                <div className="space-y-3">
                    {order.orderDetails.map((detail: OrderDetail) => (
                        <div 
                            key={detail.id} 
                            className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <img 
                                src={detail.course.thumbnail} 
                                alt={detail.course.title}
                                className="w-16 h-12 sm:w-20 sm:h-14 object-cover rounded shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-xs sm:text-sm line-clamp-2 text-foreground">
                                    {detail.course.title}
                                </h4>
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
                                {Number(detail.price).toLocaleString('vi-VN')} ₫
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
