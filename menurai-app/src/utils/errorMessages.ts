/**
 * User-friendly error messages
 * Converts technical errors into actionable, user-friendly messages
 */

export interface ErrorContext {
  operation?: string;
  retryable?: boolean;
  action?: string;
}

/**
 * Get user-friendly error message from error object
 */
export const getErrorMessage = (
  error: any,
  context?: ErrorContext
): { title: string; message: string; action?: string } => {
  const operation = context?.operation || 'operation';
  const defaultMessage = `Something went wrong during ${operation}. Please try again.`;

  // Handle Firebase errors
  if (error?.code) {
    switch (error.code) {
      case 'auth/network-request-failed':
        return {
          title: 'Connection Error',
          message: 'Unable to connect to the server. Please check your internet connection and try again.',
          action: 'Retry',
        };
      case 'auth/too-many-requests':
        return {
          title: 'Too Many Attempts',
          message: 'Too many failed attempts. Please wait a few minutes before trying again.',
        };
      case 'auth/user-not-found':
        return {
          title: 'Account Not Found',
          message: 'No account found with this email. Please check your email address.',
        };
      case 'auth/wrong-password':
        return {
          title: 'Incorrect Password',
          message: 'The password you entered is incorrect. Please try again.',
        };
      case 'auth/email-already-in-use':
        return {
          title: 'Email Already Registered',
          message: 'An account with this email already exists. Please sign in instead.',
        };
      case 'auth/weak-password':
        return {
          title: 'Weak Password',
          message: 'Password is too weak. Please choose a stronger password.',
        };
      case 'functions/unavailable':
        return {
          title: 'Service Unavailable',
          message: 'The service is temporarily unavailable. Please try again in a few moments.',
          action: 'Retry',
        };
      case 'functions/deadline-exceeded':
        return {
          title: 'Request Timeout',
          message: 'The request took too long to complete. Please try again.',
          action: 'Retry',
        };
      case 'functions/resource-exhausted':
        return {
          title: 'Service Busy',
          message: 'The service is currently busy. Please try again in a moment.',
          action: 'Retry',
        };
      case 'functions/invalid-argument':
        return {
          title: 'Invalid Input',
          message: error.message || 'Please check your input and try again.',
        };
      case 'functions/not-found':
        return {
          title: 'Not Found',
          message: 'The requested resource was not found. Please try again.',
          action: 'Retry',
        };
      case 'functions/permission-denied':
        return {
          title: 'Permission Denied',
          message: 'You do not have permission to perform this action.',
        };
      case 'functions/unauthenticated':
        return {
          title: 'Authentication Required',
          message: 'Please sign in to continue.',
        };
      case 'storage/unauthorized':
        return {
          title: 'Upload Denied',
          message: 'You do not have permission to upload files.',
        };
      case 'storage/canceled':
        return {
          title: 'Upload Canceled',
          message: 'The upload was canceled.',
        };
      case 'storage/unknown':
        return {
          title: 'Upload Error',
          message: 'An unknown error occurred during upload. Please try again.',
          action: 'Retry',
        };
    }
  }

  // Handle network errors
  if (error?.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        action: 'Retry',
      };
    }

    if (message.includes('timeout')) {
      return {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        action: 'Retry',
      };
    }

    if (message.includes('permission') || message.includes('unauthorized')) {
      return {
        title: 'Permission Denied',
        message: 'You do not have permission to perform this action.',
      };
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      title: 'Error',
      message: error,
      action: context?.retryable ? 'Retry' : undefined,
    };
  }

  // Default error message
  return {
    title: 'Error',
    message: error?.message || defaultMessage,
    action: context?.retryable ? 'Retry' : context?.action,
  };
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: any): boolean => {
  if (error?.code) {
    const retryableCodes = [
      'auth/network-request-failed',
      'functions/unavailable',
      'functions/deadline-exceeded',
      'functions/resource-exhausted',
      'storage/unknown',
    ];
    return retryableCodes.includes(error.code);
  }

  if (error?.message) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout')
    );
  }

  return false;
};
