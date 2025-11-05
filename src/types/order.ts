export type PaymentMethod = 'vnpay' | 'momo' | 'zalopay';

export type CreateOrderDetailDto = {
  courseId: string;
  price: number;
};

export type CreateOrderDto = {
  voucherId?: string;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  orderItems: CreateOrderDetailDto[];
};

export type CreateOrderResponse = {
  message: string;
  paymentUrl: string;
};

export type VNPayVerifyResult = {
  isSuccess: boolean;
  vnp_ResponseCode: string;
  vnp_TransactionStatus?: string;
  message?: string;
};
