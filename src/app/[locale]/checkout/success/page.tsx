'use client'

import { useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { CheckCircle2, Clock, CreditCard, Package } from "lucide-react"
import { OrderDetailResponse } from "@/src/types/order-detail.types"
import { useAppStore } from "@/src/stores/useAppStore"
import { useQueryHook } from "@/src/hooks/useQueryHook"
import { orderService } from "@/src/services/order"
import { CourseItemType } from "@/src/types/course/course-item.types"
import { formatPrice } from "@/lib/utils"
import { formatDuration } from "@/lib/format-duration"
import { useQueryClient } from "@tanstack/react-query"
import { enrollmentService } from "@/src/services/enrollment"

// Loading component for Suspense fallback
const LoadingState = () => (
  <div className="max-w-[1300px] mx-auto px-4 py-10">
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Đang tải thông tin đơn hàng...</p>
      </div>
    </div>
  </div>
);

// Main component wrapped in Suspense
const CheckoutSuccessContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearOrderList, removeFromCart } = useAppStore()
  const queryClient = useQueryClient()
  
  const orderId = searchParams.get('orderId') ?? ''
  
  const { data: orderDetails, isLoading } = useQueryHook<OrderDetailResponse>(
    ['order-detail', orderId],
    () => orderService.getOrderById(orderId),
    {
      enabled: !!orderId,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 0, // Always fetch fresh data
      cacheTime: 0, // Don't cache
    }
  )

  useEffect(() => {
    if (orderDetails?.status === 'completed') {
      console.log('=== ORDER COMPLETED - CLEARING CART ===', orderDetails)
      
      clearOrderList();
      
      orderDetails.orderDetails.forEach((item) => {
        removeFromCart(item.course as unknown as CourseItemType);
      });

      // CRITICAL: Clear localStorage enrollment cache
      enrollmentService.clearCache();
      console.log('=== ENROLLMENT CACHE CLEARED ===')

      // Invalidate enrollments cache để fetch lại danh sách khóa học đã mua
      // Sử dụng refetchType: 'all' để đảm bảo refetch ngay lập tức
      queryClient.invalidateQueries({ 
        queryKey: ['my-enrollments'],
        refetchType: 'all'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['my-learning'],
        refetchType: 'all'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['enrollments'],
        refetchType: 'all'
      });
      
      // Also invalidate course enrollment status
      orderDetails.orderDetails.forEach((item) => {
        queryClient.invalidateQueries({ 
          queryKey: ['course-enrollment', item.course.id],
          refetchType: 'all'
        });
      });
      
      console.log('=== CACHE INVALIDATED ===')
    }
  }, [orderDetails, clearOrderList, removeFromCart, queryClient])

  if (isLoading) {
    return (
      <div className="max-w-[1300px] mx-auto px-4 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="max-w-[1300px] mx-auto px-4 py-10">
        <Card className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <Package className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-muted-foreground mb-6">
            Đơn hàng không tồn tại hoặc đã bị xóa.
          </p>
          <Button onClick={() => router.push('/')}>
            Về trang chủ
          </Button>
        </Card>
      </div>
    )
  }

  const order = orderDetails
  const isCompleted = order?.status === 'completed'

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      vnpay: 'VNPay',
      zalopay: 'ZaloPay',
      momo: 'MoMo',
      banking: 'Chuyển khoản ngân hàng',
    }
    return methods[method] || method
  }

  return (
    <div className="max-w-[1300px] mx-auto py-8 px-4">
      <Card className="mb-6 overflow-hidden">
        <div className={`p-8 text-center ${isCompleted ? 'bg-green-50 dark:bg-green-950/20' : 'bg-yellow-50 dark:bg-yellow-950/20'}`}>
          <div className={`${isCompleted ? 'text-green-500' : 'text-yellow-500'} mb-4`}>
            {isCompleted ? (
              <CheckCircle2 className="w-20 h-20 mx-auto" />
            ) : (
              <Clock className="w-20 h-20 mx-auto" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-3">
            {isCompleted ? 'Thanh toán thành công!' : 'Đơn hàng đang xử lý'}
          </h1>
          <p className="text-lg mb-2">
            {isCompleted 
              ? `Cảm ơn bạn ${order.user.fullName} đã tin tưởng và mua hàng tại Wishzy!` 
              : 'Đơn hàng của bạn đang được xử lý.'}
          </p>
          <p className="text-muted-foreground">
            {isCompleted 
              ? 'Đơn hàng của bạn đã được xác nhận. Bạn có thể bắt đầu học ngay bây giờ!' 
              : 'Vui lòng chờ trong giây lát.'}
          </p>
        </div>
      </Card>

      {/* Info Notice */}
      {isCompleted && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-500 mt-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  📧 Kiểm tra email của bạn
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Chúng tôi đã gửi hóa đơn và thông tin khóa học đến <strong>{order.user.email}</strong>. 
                  Các khóa học đã được tự động thêm vào tài khoản của bạn.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Info */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Thông tin đơn hàng</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Mã đơn hàng:</span>
                  <span className="font-mono text-sm">{order.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Thời gian:</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <span className={`font-semibold ${
                    order.status === 'completed' ? 'text-green-600' : 
                    order.status === 'pending' ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {order.status === 'completed' ? 'Hoàn thành' :
                     order.status === 'pending' ? 'Đang xử lý' :
                     order.status === 'failed' ? 'Thất bại' : 'Đã hủy'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Phương thức thanh toán:
                  </span>
                  <span className="font-semibold">{getPaymentMethodLabel(order.paymentMethod)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Courses List */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Khóa học đã mua ({order.orderDetails.length})
              </h2>
              <div className="space-y-4">
                {order.orderDetails.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="relative w-32 h-20 shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={item.course.thumbnail || '/images/course-placeholder.jpg'}
                        alt={item.course.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold line-clamp-2 mb-2">
                        {item.course.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="capitalize">{item.course.level}</span>
                        <span>•</span>
                        <span>{formatDuration(item.course.totalDuration, 'long')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Thông tin người mua</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
                    <Image
                      src={order.user.avatar || '/images/default-avatar.png'}
                      alt={order.user.fullName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{order.user.fullName}</p>
                    <p className="text-sm text-muted-foreground truncate">{order.user.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số lượng khóa học:</span>
                  <span className="font-semibold">{order.orderDetails.length}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="font-bold text-lg">Tổng cộng:</span>
                  <span className="font-bold text-lg text-primary">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            {isCompleted && order.orderDetails.length > 0 && (
              <Button 
                className="w-full" 
                onClick={async () => {
                  // CRITICAL: Clear enrollment cache before navigation
                  enrollmentService.clearCache();
                  
                  // Đảm bảo invalidate queries hoàn tất trước khi navigate
                  await Promise.all([
                    queryClient.invalidateQueries({ 
                      queryKey: ['my-enrollments'],
                      refetchType: 'all'
                    }),
                    queryClient.invalidateQueries({ 
                      queryKey: ['my-learning'],
                      refetchType: 'all'
                    }),
                    queryClient.invalidateQueries({ 
                      queryKey: ['enrollments'],
                      refetchType: 'all'
                    })
                  ]);
                  
                  // Thêm delay để đảm bảo cache được clear hoàn toàn
                  await new Promise(resolve => setTimeout(resolve, 200));
                  
                  router.push(`/learning/${order.orderDetails[0].course.id}`);
                }}
              >
                🎓 Bắt đầu học ngay
              </Button>
            )}
            <Button 
              variant={isCompleted ? "outline" : "default"}
              className="w-full" 
              onClick={() => router.push('/search')}
            >
              Khám phá thêm khóa học
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/')}
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

// Prevent static prerendering of this page
export const dynamic = 'force-dynamic'
export const dynamicParams = true
