import { useState, useEffect, useRef } from 'react';

interface FeaturePermissionResult {
  isEnabled: boolean;
  loading: boolean;
  error: string | null;
}

// Singleton cache for feature permissions
const featureCache = new Map<string, { isEnabled: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const pendingRequests = new Map<string, Promise<boolean>>();

const checkFeaturePermissionAPI = async (featureName: string, signal?: AbortSignal): Promise<boolean> => {
  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
  
  // Check cache first
  const cached = featureCache.get(featureName);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.isEnabled;
  }

  // Check if there's already a pending request
  const existingRequest = pendingRequests.get(featureName);
  if (existingRequest) {
    return existingRequest;
  }

  // Create new request
  const requestPromise = (async () => {
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/features/check/${featureName}`, {
        credentials: 'same-origin',
        signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to check feature permission: ${response.status}`);
      }

      const data = await response.json();
      const isEnabled = data.is_enabled || false;
      
      // Cache the result
      featureCache.set(featureName, { isEnabled, timestamp: Date.now() });
      
      return isEnabled;
    } finally {
      // Remove from pending requests
      pendingRequests.delete(featureName);
    }
  })();

  pendingRequests.set(featureName, requestPromise);
  return requestPromise;
};

export const useFeaturePermission = (featureName: string): FeaturePermissionResult => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!featureName) return;

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    const checkPermission = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await checkFeaturePermissionAPI(featureName, currentController.signal);
        
        if (!currentController.signal.aborted) {
          setIsEnabled(result);
        }
      } catch (err) {
        if (!currentController.signal.aborted) {
          console.error('Error checking feature permission:', err);
          setError(err instanceof Error ? err.message : 'Failed to check feature permission');
          setIsEnabled(false);
        }
      } finally {
        if (!currentController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    checkPermission();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [featureName]);

  return { isEnabled, loading, error };
};

// Export function to pre-cache multiple features at once
export const preloadFeaturePermissions = async (features: string[]): Promise<Record<string, boolean>> => {
  const results: Record<string, boolean> = {};
  
  try {
    const promises = features.map(async (feature) => {
      try {
        const result = await checkFeaturePermissionAPI(feature);
        results[feature] = result;
        return result;
      } catch (error) {
        console.error(`Failed to preload feature ${feature}:`, error);
        results[feature] = false;
        return false;
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error preloading feature permissions:', error);
  }

  return results;
};

export default useFeaturePermission; 