export interface OrderDetailResponse {
  id: string;
  voucherId: string | null;
  userId: string;
  totalPrice: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: 'vnpay' | 'zalopay' | 'momo' | 'banking';
  createdAt: string;
  updatedAt: string;
  voucher: any | null;
  user: {
    passwordModified: boolean;
    id: string;
    email: string;
    fullName: string;
    avatar: string;
  };
  orderDetails: OrderDetailItem[];
}

export interface OrderDetailItem {
  id: string;
  orderId: string;
  courseId: string;
  price: string;
  createdAt: string;
  updatedAt: string;
  course: {
    id: string;
    name: string;
    description: string;
    notes: string;
    thumbnail: string;
    price: string;
    saleInfo: {
      value: number;
      saleType: string;
      saleEndDate: string;
      saleStartDate: string;
    } | null;
    rating: number;
    status: boolean;
    averageRating: string;
    numberOfStudents: number;
    level: string;
    totalDuration: number;
    categoryId: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}
