import { AxiosError } from 'axios';

interface ApiErrorResponse {
  success: boolean;
  error?: {
    message?: string;
    details?: Record<string, string[]>;
  };
  message?: string;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;

    // Try to get detailed error message from API response
    if (data?.error?.message) {
      return data.error.message;
    }
    if (data?.message) {
      return data.message;
    }

    // Handle specific HTTP status codes
    switch (error.response?.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'The requested item was not found.';
      case 409:
        return 'A conflict occurred. The item may already exist.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        break;
    }

    // Network errors
    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

export function getValidationErrors(error: unknown): Record<string, string> | null {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.error?.details) {
      const errors: Record<string, string> = {};
      for (const [field, messages] of Object.entries(data.error.details)) {
        errors[field] = messages[0] || 'Invalid value';
      }
      return errors;
    }
  }
  return null;
}
