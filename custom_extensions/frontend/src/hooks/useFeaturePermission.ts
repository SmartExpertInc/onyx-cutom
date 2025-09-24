import { useState, useEffect } from 'react';

interface FeaturePermissionResult {
  isEnabled: boolean;
  loading: boolean;
  error: string | null;
}

export const useFeaturePermission = (featureName: string): FeaturePermissionResult => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  useEffect(() => {
    const checkFeaturePermission = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${CUSTOM_BACKEND_URL}/features/check/${featureName}`, {
          credentials: 'same-origin',
        });

        if (!response.ok) {
          throw new Error(`Failed to check feature permission: ${response.status}`);
        }

        const data = await response.json();
        setIsEnabled(data.is_enabled || false);
      } catch (err) {
        console.error('Error checking feature permission:', err);
        setError(err instanceof Error ? err.message : 'Failed to check feature permission');
        setIsEnabled(false);
      } finally {
        setLoading(false);
      }
    };

    if (featureName) {
      checkFeaturePermission();
    }
  }, [featureName]);

  return { isEnabled, loading, error };
};

export default useFeaturePermission; 