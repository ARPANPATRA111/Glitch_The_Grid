/**
 * Centralized API response types for consistent error handling
 * and type-safe responses across all server actions
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

/**
 * Paginated response for list endpoints
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Error response with detailed information
 */
export interface ErrorResponse {
  success: false;
  error: string;
  errorCode: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Common error codes used across the application
 */
export const ErrorCodes = {
  // Authentication errors
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Business logic errors
  INELIGIBLE: 'INELIGIBLE',
  RATE_LIMITED: 'RATE_LIMITED',
  PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Helper to create success response
 */
export function successResponse<T>(data?: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Helper to create error response
 */
export function errorResponse(
  error: string, 
  errorCode: ErrorCode = ErrorCodes.INTERNAL_ERROR
): ApiResponse<never> {
  return {
    success: false,
    error,
    errorCode,
  };
}

/**
 * Helper to create paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  totalItems: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse<T>(response: ApiResponse<T>): response is ApiResponse<never> & { success: false } {
  return !response.success;
}

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } {
  return response.success && response.data !== undefined;
}
