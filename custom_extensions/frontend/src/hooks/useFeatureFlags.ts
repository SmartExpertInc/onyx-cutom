import { useState, useEffect, useCallback } from 'react';

interface UserFeatureFlags {
  feature_flags: Record<string, boolean>;
  user_id: string;
}

interface UseFeatureFlagsReturn {
  featureFlags: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  isFeatureEnabled: (featureName: string) => boolean;
  refresh: () => void;
}

const useFeatureFlags = (): UseFeatureFlagsReturn => {
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  const fetchFeatureFlags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${CUSTOM_BACKEND_URL}/users/me/feature-flags`, {
        credentials: 'same-origin',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, return default flags (all enabled)
          setFeatureFlags({});
          return;
        }
        throw new Error(`Failed to fetch feature flags: ${response.status}`);
      }

      const data: UserFeatureFlags = await response.json();
      setFeatureFlags(data.feature_flags || {});
    } catch (err) {
      console.error('Error fetching feature flags:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch feature flags');
      // On error, default to all features enabled
      setFeatureFlags({});
    } finally {
      setLoading(false);
    }
  }, []);

  const isFeatureEnabled = useCallback((featureName: string): boolean => {
    // If no flag is set for this feature, default to enabled (true)
    return featureFlags[featureName] !== false;
  }, [featureFlags]);

  const refresh = useCallback(() => {
    fetchFeatureFlags();
  }, [fetchFeatureFlags]);

  useEffect(() => {
    fetchFeatureFlags();
  }, [fetchFeatureFlags]);

  return {
    featureFlags,
    loading,
    error,
    isFeatureEnabled,
    refresh,
  };
};

export default useFeatureFlags; 