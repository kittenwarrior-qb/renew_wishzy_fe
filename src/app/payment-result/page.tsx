'use client'

import { useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

// Loading component for Suspense fallback
const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Đang xử lý kết quả thanh toán...</p>
      <p className="text-xs text-muted-foreground mt-2">Vui lòng không đóng trang...</p>
    </div>
  </div>
);

// Main component wrapped in Suspense
const PaymentResultContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const status = searchParams.get('status')
    const orderId = searchParams.get('orderId')
    const code = searchParams.get('code')

    console.log('🔔 Payment Result:', { status, orderId, code })

    if (status === 'success' && orderId) {
      toast.success('Thanh toán thành công!')
      router.replace(`/checkout/success?orderId=${orderId}`)
    } else if (status === 'failed') {
      toast.error(`Thanh toán thất bại. Mã lỗi: ${code || 'Unknown'}`, {
        duration: 5000,
      })
      setTimeout(() => {
        router.replace(`/checkout`)
      }, 5000)
    } else if (status === 'invalid') {
      toast.error('Giao dịch không hợp lệ. Vui lòng liên hệ hỗ trợ.', {
        duration: 5000,
      })
      setTimeout(() => {
        router.replace(`/checkout`)
      }, 5000)
    } else {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.', {
        duration: 5000,
      })
      setTimeout(() => {
        router.replace(`/checkout`)
      }, 5000)
    }
  }, [searchParams, router])

  const status = searchParams.get('status')
  const code = searchParams.get('code')
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'failed' ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Giao dịch thất bại</h1>
              <p className="text-muted-foreground mb-4">Thanh toán của bạn không thành công</p>
              {code && (
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  <p className="text-sm font-medium">Mã tra cứu</p>
                  <p className="text-lg font-mono">{orderId || 'N/A'}</p>
                  <p className="text-sm font-medium mt-2">Mã lỗi</p>
                  <p className="text-lg font-mono text-red-600">{code}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                Đang chuyển hướng về trang checkout trong 5 giây...
              </p>
            </div>
          </>
        ) : status === 'invalid' ? (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Giao dịch không hợp lệ</h1>
              <p className="text-muted-foreground">Vui lòng liên hệ hỗ trợ nếu bạn đã thanh toán</p>
              <p className="text-sm text-muted-foreground mt-4">
                Đang chuyển hướng về trang checkout trong 5 giây...
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Đang xử lý kết quả thanh toán...</p>
            <p className="text-xs text-muted-foreground">Vui lòng không đóng trang...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PaymentResultContent />
    </Suspense>
  );
}

// Prevent static prerendering of this page
export const dynamic = 'force-dynamic'
export const dynamicParams = true
