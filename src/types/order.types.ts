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
    paymentUrl: string;
    orderId?: string;
  };
  message: string;
  url: string;
}
