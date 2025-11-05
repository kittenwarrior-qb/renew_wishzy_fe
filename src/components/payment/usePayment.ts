import type { VNPayVerifyResult } from '@/types/order';
import { useApiQuery } from '@/hooks/useApi';

export const useVerifyPayment = (queryParams: URLSearchParams, enabled = true) => {
  const queryObj: Record<string, string> = {};
  queryParams.forEach((value, key) => {
    queryObj[key] = value;
  });

  const { data, error, isLoading, ...rest } = useApiQuery<{
    message: string;
    order?: unknown;
    success?: boolean;
  }>(
    'orders/payment-callback',
    {
      queryParams: queryObj,
      enabled,
      retry: false,
    },
  );

  // 转换响应数据为 VNPayVerifyResult 格式
  const result: VNPayVerifyResult | undefined = data
    ? {
        isSuccess: data.message?.includes('successful') || false,
        vnp_ResponseCode: queryObj.vnp_ResponseCode || '99',
        vnp_TransactionStatus: queryObj.vnp_TransactionStatus,
        message: data.message,
      }
    : error
      ? {
          isSuccess: false,
          vnp_ResponseCode: '99',
          vnp_TransactionStatus: queryObj.vnp_TransactionStatus,
          message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi xác thực',
        }
      : undefined;

  return {
    data: result,
    error,
    isLoading,
    ...rest,
  };
};
