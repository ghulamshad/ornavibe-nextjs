/**
 * Enterprise-grade error handling utility
 * Provides consistent error message extraction and formatting across the application
 */

export interface ApiError {
  response?: {
    data?: any;
    status?: number;
  };
  message?: string;
}

export interface ExtractedError {
  message: string;
  fieldErrors?: Record<string, string>;
  statusCode?: number;
}

/**
 * Extracts user-friendly error messages from API error responses
 * Handles various error response formats:
 * - DRF ValidationError format: { field: ['error1', 'error2'] }
 * - Custom format: { error: true, message: '...', errors: {...} }
 * - Simple format: { detail: '...' }
 * - Array format: ['error1', 'error2']
 */
export function extractErrorMessage(error: ApiError | any): ExtractedError {
  const defaultMessage = 'An unexpected error occurred. Please try again.';
  
  if (!error) {
    return { message: defaultMessage };
  }

  const responseData = error?.response?.data;
  const statusCode = error?.response?.status;

  // If no response data, use error message or default
  if (!responseData) {
    return {
      message: error?.message || defaultMessage,
      statusCode,
    };
  }

  // Handle custom error format: { error: true, message: '...', errors: {...} }
  if (responseData.error === true || responseData.error === 'true') {
    // Extract main message
    let mainMessage = responseData.message || responseData.detail || defaultMessage;
    
    // Extract field-specific errors
    const fieldErrors: Record<string, string> = {};
    const errors = responseData.errors || responseData;
    
    // Ignore these keys as they're not field errors
    const ignoredKeys = ['error', 'status', 'message', 'detail', 'non_field_errors'];
    
    if (typeof errors === 'object' && errors !== null && !Array.isArray(errors)) {
      Object.keys(errors).forEach(key => {
        if (!ignoredKeys.includes(key)) {
          const value = errors[key];
          if (value !== null && value !== undefined && value !== true && value !== false) {
            if (Array.isArray(value)) {
              if (value.length > 0) {
                // Extract string messages from ErrorDetail objects or strings
                const messages = value.map((v: any) => {
                  if (typeof v === 'string') return v;
                  if (v?.message) return v.message;
                  if (v?.toString) return v.toString();
                  return String(v);
                }).filter(Boolean);
                if (messages.length > 0) {
                  fieldErrors[key] = messages.join(', ');
                }
              }
            } else if (typeof value === 'object') {
              fieldErrors[key] = JSON.stringify(value);
            } else if (typeof value === 'string' && value.trim()) {
              fieldErrors[key] = value;
            } else if (typeof value !== 'boolean') {
              fieldErrors[key] = String(value);
            }
          }
        }
      });
    }
    
    // If we have field errors but no main message, create a summary
    if (Object.keys(fieldErrors).length > 0 && (!mainMessage || mainMessage === defaultMessage)) {
      const fieldNames = Object.keys(fieldErrors).join(', ');
      mainMessage = `Please fix the following errors: ${fieldNames}`;
    }
    
    // Handle non-field errors
    if (errors.non_field_errors) {
      const nonFieldErrors = Array.isArray(errors.non_field_errors)
        ? errors.non_field_errors.join(', ')
        : String(errors.non_field_errors);
      if (nonFieldErrors) {
        mainMessage = nonFieldErrors;
      }
    }
    
    return {
      message: mainMessage,
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      statusCode,
    };
  }

  // Handle Laravel 422 validation: { message: '...', errors: { field: ['msg'] } }
  if (typeof responseData === 'object' && !Array.isArray(responseData) && responseData.errors != null) {
    const errors = responseData.errors;
    const fieldErrors: Record<string, string> = {};
    if (typeof errors === 'object' && errors !== null && !Array.isArray(errors)) {
      Object.keys(errors).forEach((key) => {
        const val = (errors as Record<string, unknown>)[key];
        if (Array.isArray(val) && val.length > 0) {
          fieldErrors[key] = val.map((v: any) => (typeof v === 'string' ? v : String(v?.message ?? v))).join(', ');
        } else if (typeof val === 'string' && val.trim()) {
          fieldErrors[key] = val;
        }
      });
    }
    return {
      message: (responseData.message as string) || 'Validation failed. Please check your input.',
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      statusCode,
    };
  }

  // Handle DRF ValidationError format: { field: ['error1', 'error2'] }
  if (typeof responseData === 'object' && !Array.isArray(responseData)) {
    const fieldErrors: Record<string, string> = {};
    let mainMessage = responseData.detail || responseData.message || defaultMessage;

    Object.keys(responseData).forEach(key => {
      if (key !== 'detail' && key !== 'message' && key !== 'non_field_errors' && key !== 'errors') {
        const value = responseData[key];
        if (Array.isArray(value) && value.length > 0) {
          fieldErrors[key] = value.map((v: any) =>
            typeof v === 'string' ? v : (v?.message || String(v))
          ).join(', ');
        } else if (typeof value === 'string' && value.trim()) {
          fieldErrors[key] = value;
        }
      }
    });
    
    // Handle non_field_errors
    if (responseData.non_field_errors) {
      const nonFieldErrors = Array.isArray(responseData.non_field_errors)
        ? responseData.non_field_errors.join(', ')
        : String(responseData.non_field_errors);
      if (nonFieldErrors) {
        mainMessage = nonFieldErrors;
      }
    }
    
    // If we have field errors, update main message
    if (Object.keys(fieldErrors).length > 0) {
      if (mainMessage === defaultMessage || mainMessage === responseData.detail) {
        const fieldNames = Object.keys(fieldErrors).join(', ');
        mainMessage = `Please fix the following: ${fieldNames}`;
      }
    }
    
    return {
      message: mainMessage,
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      statusCode,
    };
  }

  // Handle array format: ['error1', 'error2']
  if (Array.isArray(responseData)) {
    return {
      message: responseData.map((v: any) => 
        typeof v === 'string' ? v : (v?.message || String(v))
      ).join(', '),
      statusCode,
    };
  }

  // Handle string format
  if (typeof responseData === 'string') {
    return {
      message: responseData,
      statusCode,
    };
  }

  // Fallback
  return {
    message: responseData.detail || responseData.message || error?.message || defaultMessage,
    statusCode,
  };
}

/**
 * Formats field name for display (e.g., 'first_name' -> 'First Name')
 */
export function formatFieldName(fieldName: string): string {
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
