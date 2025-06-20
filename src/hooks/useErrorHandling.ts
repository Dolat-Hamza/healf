import { useState, useCallback } from 'react';
import { createErrorState, ErrorState, getErrorMessage, getErrorSuggestions, isRetryableError } from '../lib/error-handling';

export function useErrorHandling() {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorType: 'unknown',
    retryable: false
  });

  const handleError = useCallback((error: Error) => {
    const newErrorState = createErrorState(error);
    setErrorState(newErrorState);
    
    console.error('Error handled:', {
      message: error.message,
      type: newErrorState.errorType,
      retryable: newErrorState.retryable
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorType: 'unknown',
      retryable: false
    });
  }, []);

  const retry = useCallback((retryFunction: () => void | Promise<void>) => {
    if (!errorState.retryable) {
      console.warn('Attempted to retry non-retryable error');
      return;
    }
    
    clearError();
    
    try {
      const result = retryFunction();
      if (result instanceof Promise) {
        result.catch(handleError);
      }
    } catch (error) {
      handleError(error as Error);
    }
  }, [errorState.retryable, clearError, handleError]);

  const getErrorInfo = useCallback(() => {
    if (!errorState.error) return null;
    
    return {
      message: getErrorMessage(errorState.error),
      suggestions: getErrorSuggestions(errorState.error),
      retryable: isRetryableError(errorState.error)
    };
  }, [errorState.error]);

  return {
    errorState,
    handleError,
    clearError,
    retry,
    getErrorInfo,
    hasError: errorState.hasError,
    isRetryable: errorState.retryable
  };
}

export function useAsyncError() {
  const { handleError } = useErrorHandling();
  
  const executeAsync = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ): Promise<T | null> => {
    try {
      const result = await asyncFunction();
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown async error');
      handleError(errorObj);
      onError?.(errorObj);
      return null;
    }
  }, [handleError]);

  return { executeAsync };
}
