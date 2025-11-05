import type { Course } from '@/types/course';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = {
  course: Course;
  addedAt: Date;
};

type CartState = {
  items: CartItem[];
  addItem: (course: Course) => void;
  removeItem: (courseId: string) => void;
  clearCart: () => void;
  isInCart: (courseId: string) => boolean;
  getTotalPrice: () => number;
  getItemCount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (course: Course) => {
        set((state) => {
          // Kiểm tra xem khóa học đã có trong giỏ hàng chưa
          const existingItem = state.items.find(item => item.course.id === course.id);
          if (existingItem) {
            return state; // Không thêm trùng lặp
          }
          return {
            items: [...state.items, { course, addedAt: new Date() }],
          };
        });
      },
      removeItem: (courseId: string) => {
        set(state => ({
          items: state.items.filter(item => item.course.id !== courseId),
        }));
      },
      clearCart: () => {
        set({ items: [] });
      },
      isInCart: (courseId: string) => {
        return get().items.some(item => item.course.id === courseId);
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          // 处理价格可能是字符串或数字的情况
          const priceNum = typeof item.course.price === 'string' ? Number.parseFloat(item.course.price) : item.course.price;
          const basePrice = Number.isFinite(priceNum) && priceNum > 0 ? priceNum : 0;

          if (!item.course.saleInfo) {
            return total + basePrice;
          }

          const { saleType, value } = item.course.saleInfo;
          if (!Number.isFinite(value) || !value) {
            return total + basePrice;
          }

          const saleValue = Number(value);
          const finalPrice = saleType === 'percent'
            ? basePrice * (1 - saleValue / 100)
            : Math.max(0, basePrice - saleValue);

          return total + finalPrice;
        }, 0);
      },
      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'cart-storage',
    },
  ),
);
