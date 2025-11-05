import type { CreateOrderDto, CreateOrderResponse } from '@/types/order';
import { useApiPost } from '@/hooks/useApi';

export const useCreateOrder = () => {
  return useApiPost<CreateOrderResponse, CreateOrderDto>('orders');
};
