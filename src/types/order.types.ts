export interface OrderItem {
  courseId: string;
  price: number;
}

export interface CreateOrderRequest {
  voucherId?: string;
  totalPrice: number;
  paymentMethod: 'vnpay' | 'zalopay' | 'momo' | 'banking';
  orderItems: OrderItem[];
}

export interface CreateOrderResponse {
  success: boolean;
  data: {
    paymentUrl?: string;
    orderId?: string;
    order?: {
      id: string;
      userId: string;
      totalPrice: number;
      status: OrderStatus;
      paymentMethod: PaymentMethod;
      createdAt: string;
      updatedAt: string;
    };
  };
  message: string;
  url: string;
}

export type OrderListRow = {
  id: string
  user?: { fullName?: string; email?: string } | null
  userId?: string
  totalPrice?: number | string
  status?: OrderStatus
  paymentMethod?: PaymentMethod
  createdAt?: string
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  VNPAY = 'vnpay',
  ZALOPAY = 'zalopay',
  MOMO = 'momo',
  BANKING = 'banking'
}
