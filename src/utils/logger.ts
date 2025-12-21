/**
 * Logger Utility
 * Replaces console.log with environment-aware logging
 * Only logs errors and warnings in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) {
      return true; // Log everything in development
    }
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.debug(prefix, message, ...args);
        break;
      case 'info':
        console.info(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        // In production, you might want to send errors to error tracking service
        if (!this.isDevelopment) {
          // TODO: Send to error tracking service (Sentry, etc.)
        }
        break;
    }
  }

  debug(message: string, ...args: any[]): void {
    this.formatMessage('debug', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.formatMessage('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.formatMessage('warn', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.formatMessage('error', message, ...args);
  }

  // Convenience method for API responses
  apiResponse(endpoint: string, data: any): void {
    if (this.isDevelopment) {
      this.debug(`API Response [${endpoint}]:`, data);
    }
  }

  // Convenience method for API errors
  apiError(endpoint: string, error: any): void {
    this.error(`API Error [${endpoint}]:`, error);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };

