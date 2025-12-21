/**
 * Performance Utilities
 * Helpers for performance monitoring and optimization
 */

import { logger } from './logger';

/**
 * Measure execution time of a function
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T,
  logThreshold: number = 1000 // Log if execution time > threshold (ms)
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;

  if (duration > logThreshold) {
    logger.warn(`Performance Warning [${name}]: ${duration.toFixed(2)}ms`);
  } else if (process.env.NODE_ENV === 'development') {
    logger.debug(`Performance [${name}]: ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Measure async function execution time
 */
export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>,
  logThreshold: number = 1000
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  if (duration > logThreshold) {
    logger.warn(`Performance Warning [${name}]: ${duration.toFixed(2)}ms`);
  } else if (process.env.NODE_ENV === 'development') {
    logger.debug(`Performance [${name}]: ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

