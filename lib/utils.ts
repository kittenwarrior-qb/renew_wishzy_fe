import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string): string {
  const numPrice = Number(price);
  if (numPrice === 0) {
    return 'Miễn phí';
  }
  return `₫${numPrice.toLocaleString('vi-VN')}`;
}
