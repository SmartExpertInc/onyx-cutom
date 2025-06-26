/**
 * Shared network utilities for product creation flows
 * Provides robust error handling, retry logic, and timeout management
 */

export interface RetryOptions {
  retries?: number;
  timeoutMs?: number;
  retryDelay?: number;
}

/**
 * Enhanced fetch with retry logic, timeout handling, and comprehensive error management
 */
export async function fetchWithRetry(
  input: RequestInfo,
  init: RequestInit,
  options: RetryOptions = {}
): Promise<Response> {
  const { retries = 3, timeoutMs = 240000, retryDelay = 1000 } = options;
  
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= retries) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const requestInit = {
        ...init,
        signal: init.signal || controller.signal,
      };

      const res = await fetch(input, requestInit);
      clearTimeout(timeoutId);
      
      // Success or non-retryable error
      if (res.ok || attempt >= retries) {
        return res;
      }
      
      // Retry on server errors (5xx) and specific client errors
      if (res.status >= 500 || res.status === 408 || res.status === 429) {
        lastError = new Error(`Request failed with status ${res.status}`);
        attempt++;
        if (attempt <= retries) {
          // Exponential backoff with base delay
          await new Promise(resolve => 
            setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
          );
          continue;
        }
      }
      
      return res;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on abort (user cancelled)
      if (error.name === 'AbortError') {
        throw error;
      }
      
      // Retry on network errors, timeout errors, etc.
      if (attempt < retries && isRetryableError(error)) {
        attempt++;
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
        );
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError || new Error('Request failed after retries');
}

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: any): boolean {
  return (
    error.name === 'TypeError' || // Network error
    error.name === 'TimeoutError' ||
    error.message?.includes('fetch') ||
    error.message?.includes('network') ||
    error.message?.includes('timeout') ||
    error.message?.includes('Failed to fetch')
  );
}

/**
 * Safely navigate with fallback to window.location
 */
export async function safeNavigate(
  router: any,
  targetUrl: string,
  fallbackDelay = 100
): Promise<void> {
  try {
    await router.push(targetUrl);
    // Give navigation time to start
    await new Promise(resolve => setTimeout(resolve, fallbackDelay));
  } catch (navError: any) {
    console.error('Navigation failed, attempting fallback:', navError);
    // Fallback: use window.location
    window.location.href = targetUrl;
  }
}

/**
 * Create a timeout safeguard that resets state if operation takes too long
 */
export function createTimeoutSafeguard(
  timeoutMs: number,
  onTimeout: () => void,
  message?: string
): number {
  return window.setTimeout(() => {
    console.warn(message || 'Operation timeout reached, resetting state');
    onTimeout();
  }, timeoutMs);
}

/**
 * Standard error message formatting for finalization errors
 */
export function formatFinalizationError(error: any, productType = 'product'): string {
  if (error.name === 'AbortError') {
    return 'Request was cancelled';
  }
  
  if (error.message?.includes('timeout')) {
    return `Request timed out. The ${productType} may have been created successfully. Please check your projects list.`;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return `Failed to finalize ${productType}`;
}

/**
 * Generic finalization handler with comprehensive error handling
 */
export async function handleFinalization<T>(
  finalizeRequest: () => Promise<T>,
  onSuccess: (data: T) => Promise<void> | void,
  onError: (message: string) => void,
  setIsGenerating: (loading: boolean) => void,
  timeoutMs = 300000 // 5 minutes
): Promise<void> {
  // Create cleanup function to ensure state is reset
  const cleanup = () => {
    setIsGenerating(false);
  };
  
  // Set up timeout safeguard
  const timeoutId = createTimeoutSafeguard(
    timeoutMs,
    () => {
      cleanup();
      onError('Finalization took too long. The product may have been created successfully. Please check your projects list.');
    },
    'Finalization timeout reached'
  );
  
  try {
    const data = await finalizeRequest();
    
    // Clear timeout since we completed successfully
    clearTimeout(timeoutId);
    
    await onSuccess(data);
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('Finalization error:', error);
    
    const errorMessage = formatFinalizationError(error);
    onError(errorMessage);
  } finally {
    // Always cleanup, even if navigation succeeds
    cleanup();
    clearTimeout(timeoutId);
  }
} 