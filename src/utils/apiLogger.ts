/**
 * Professional API Logger
 * Logs API calls in a structured, readable format for debugging and code review
 */

type LogLevel = 'info' | 'success' | 'error' | 'warn';

interface ApiLogOptions {
  endpoint: string;
  method?: string;
  params?: any;
  response?: any;
  error?: any;
  duration?: number;
  level?: LogLevel;
}

class ApiLogger {
  private isDevelopment: boolean;
  private enabled: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.enabled = true; // Always enabled for instructor pages
  }

  /**
   * Log API request
   */
  logRequest(endpoint: string, method: string = 'GET', params?: any): void {
    if (!this.enabled) return;

    const timestamp = new Date().toLocaleTimeString('vi-VN');
    const methodColor = this.getMethodColor(method);

    console.group(
      `%c📡 API Request [${timestamp}]`,
      'color: #3b82f6; font-weight: bold; font-size: 11px;'
    );
    console.log(`%c${method}`, `color: ${methodColor}; font-weight: bold;`, endpoint);
    if (params) {
      console.log('%cParams:', 'color: #6b7280; font-weight: bold;', params);
    }
    console.groupEnd();
  }

  /**
   * Log API response
   */
  logResponse(endpoint: string, response: any, duration?: number): void {
    if (!this.enabled) return;

    const timestamp = new Date().toLocaleTimeString('vi-VN');
    const durationText = duration ? ` (${duration}ms)` : '';

    console.group(
      `%c✅ API Response [${timestamp}]${durationText}`,
      'color: #10b981; font-weight: bold; font-size: 11px;'
    );
    console.log(`%c${endpoint}`, 'color: #3b82f6; font-weight: bold;');
    
    // Log response structure
    if (response?.data) {
      console.log('%cData:', 'color: #6b7280; font-weight: bold;', response.data);
    } else {
      console.log('%cResponse:', 'color: #6b7280; font-weight: bold;', response);
    }

    // Log pagination if exists
    if (response?.data?.pagination || response?.pagination) {
      const pagination = response?.data?.pagination || response?.pagination;
      console.log(
        '%c📄 Pagination:',
        'color: #8b5cf6; font-weight: bold;',
        `Page ${pagination.page || pagination.currentPage}/${pagination.totalPages || pagination.totalPage}, Total: ${pagination.total || pagination.totalItems}`
      );
    }

    // Log statistics if exists
    if (response?.data?.statistics || response?.statistics) {
      const stats = response?.data?.statistics || response?.statistics;
      console.log('%c📊 Statistics:', 'color: #f59e0b; font-weight: bold;', stats);
    }

    console.groupEnd();
  }

  /**
   * Log API error
   */
  logError(endpoint: string, error: any, method: string = 'GET'): void {
    if (!this.enabled) return;

    const timestamp = new Date().toLocaleTimeString('vi-VN');
    const methodColor = this.getMethodColor(method);

    console.group(
      `%c❌ API Error [${timestamp}]`,
      'color: #ef4444; font-weight: bold; font-size: 11px;'
    );
    console.log(`%c${method}`, `color: ${methodColor}; font-weight: bold;`, endpoint);
    
    if (error?.response) {
      console.log('%cStatus:', 'color: #ef4444; font-weight: bold;', error.response.status);
      console.log('%cError Data:', 'color: #ef4444; font-weight: bold;', error.response.data);
    } else if (error?.message) {
      console.log('%cError:', 'color: #ef4444; font-weight: bold;', error.message);
    } else {
      console.log('%cError:', 'color: #ef4444; font-weight: bold;', error);
    }

    if (error?.stack && this.isDevelopment) {
      console.log('%cStack:', 'color: #6b7280; font-size: 10px;', error.stack);
    }

    console.groupEnd();
  }

  /**
   * Log API call with full details
   */
  logApiCall(options: ApiLogOptions): void {
    if (!this.enabled) return;

    const {
      endpoint,
      method = 'GET',
      params,
      response,
      error,
      duration,
      level = 'info'
    } = options;

    const timestamp = new Date().toLocaleTimeString('vi-VN');
    const methodColor = this.getMethodColor(method);

    // Determine log style based on level
    let headerStyle = 'color: #3b82f6; font-weight: bold; font-size: 11px;';
    let headerIcon = '📡';
    let headerText = 'API Call';

    if (level === 'success' && response) {
      headerStyle = 'color: #10b981; font-weight: bold; font-size: 11px;';
      headerIcon = '✅';
      headerText = 'API Success';
    } else if (level === 'error' && error) {
      headerStyle = 'color: #ef4444; font-weight: bold; font-size: 11px;';
      headerIcon = '❌';
      headerText = 'API Error';
    } else if (level === 'warn') {
      headerStyle = 'color: #f59e0b; font-weight: bold; font-size: 11px;';
      headerIcon = '⚠️';
      headerText = 'API Warning';
    }

    const durationText = duration ? ` (${duration}ms)` : '';

    console.group(
      `%c${headerIcon} ${headerText} [${timestamp}]${durationText}`,
      headerStyle
    );

    // Endpoint
    console.log(`%c${method}`, `color: ${methodColor}; font-weight: bold;`, endpoint);

    // Params
    if (params) {
      console.log('%c📥 Params:', 'color: #6b7280; font-weight: bold;', params);
    }

    // Response
    if (response) {
      if (response?.data) {
        console.log('%c📦 Data:', 'color: #10b981; font-weight: bold;', response.data);
      } else {
        console.log('%c📦 Response:', 'color: #10b981; font-weight: bold;', response);
      }

      // Pagination
      const pagination = response?.data?.pagination || response?.pagination;
      if (pagination) {
        console.log(
          '%c📄 Pagination:',
          'color: #8b5cf6; font-weight: bold;',
          {
            page: pagination.page || pagination.currentPage,
            limit: pagination.limit || pagination.itemsPerPage,
            total: pagination.total || pagination.totalItems,
            totalPages: pagination.totalPages || pagination.totalPage,
            hasNext: pagination.hasNext,
            hasPrev: pagination.hasPrev,
          }
        );
      }

      // Statistics
      const statistics = response?.data?.statistics || response?.statistics;
      if (statistics) {
        console.log('%c📊 Statistics:', 'color: #f59e0b; font-weight: bold;', statistics);
      }

      // Items count
      const items = response?.data?.items || response?.items || [];
      if (Array.isArray(items) && items.length > 0) {
        console.log(`%c📋 Items: ${items.length}`, 'color: #6366f1; font-weight: bold;');
      }
    }

    // Error
    if (error) {
      if (error?.response) {
        console.log('%c❌ Status:', 'color: #ef4444; font-weight: bold;', error.response.status);
        console.log('%c❌ Error Data:', 'color: #ef4444; font-weight: bold;', error.response.data);
      } else {
        console.log('%c❌ Error:', 'color: #ef4444; font-weight: bold;', error.message || error);
      }
    }

    console.groupEnd();
  }

  /**
   * Get color for HTTP method
   */
  private getMethodColor(method: string): string {
    const colors: Record<string, string> = {
      GET: '#3b82f6',      // Blue
      POST: '#10b981',     // Green
      PUT: '#f59e0b',      // Orange
      PATCH: '#f59e0b',    // Orange
      DELETE: '#ef4444',   // Red
    };
    return colors[method.toUpperCase()] || '#6b7280';
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Export singleton instance
export const apiLogger = new ApiLogger();

// Export for testing
export { ApiLogger };

