import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price to Vietnamese currency format
 * @param price - The price to format (number or string)
 * @returns Formatted price string with ₫ symbol
 * @example formatPrice(1000000) // "₫1.000.000"
 * @example formatPrice("1000000") // "₫1.000.000"
 */
export function formatPrice(price: number | string): string {
  return `₫${Number(price).toLocaleString('vi-VN')}`
}
