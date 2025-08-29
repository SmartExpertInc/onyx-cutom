import React from 'react';
import useFeatureFlags from '../hooks/useFeatureFlags';

interface FeatureFlagWrapperProps {
  featureName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showWhenDisabled?: boolean;
}

const FeatureFlagWrapper: React.FC<FeatureFlagWrapperProps> = ({
  featureName,
  children,
  fallback = null,
  showWhenDisabled = false,
}) => {
  const { isFeatureEnabled, loading } = useFeatureFlags();

  // Show loading state if feature flags are still loading
  if (loading) {
    return null; // Or return a loading spinner if preferred
  }

  const isEnabled = isFeatureEnabled(featureName);

  // If showWhenDisabled is true, show children when feature is disabled
  if (showWhenDisabled) {
    return isEnabled ? <>{fallback}</> : <>{children}</>;
  }

  // Default behavior: show children when feature is enabled
  return isEnabled ? <>{children}</> : <>{fallback}</>;
};

export default FeatureFlagWrapper; 