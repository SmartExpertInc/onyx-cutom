// custom_extensions/frontend/src/components/AvatarDisplayManager.tsx

import React, { useState, useEffect, createContext, useContext } from 'react';
import { SelectedAvatar } from '@/types/elaiTypes';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

interface AvatarDisplayContextType {
  defaultAvatar: SelectedAvatar | null;
  isLoading: boolean;
  error: string | null;
  refreshAvatars: () => Promise<void>;
}

const AvatarDisplayContext = createContext<AvatarDisplayContextType>({
  defaultAvatar: null,
  isLoading: false,
  error: null,
  refreshAvatars: async () => {},
});

export const useAvatarDisplay = () => useContext(AvatarDisplayContext);

interface AvatarDisplayManagerProps {
  children: React.ReactNode;
}

export const AvatarDisplayManager: React.FC<AvatarDisplayManagerProps> = ({ children }) => {
  const [defaultAvatar, setDefaultAvatar] = useState<SelectedAvatar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvatars = async () => {
    try {
      console.log('🎭 [AVATAR_MANAGER] Fetching avatars from API...');
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${CUSTOM_BACKEND_URL}/video/avatars`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });

      console.log('🎭 [AVATAR_MANAGER] Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🎭 [AVATAR_MANAGER] Avatar data received:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch avatars');
      }

      const avatars = data.avatars || [];
      console.log('🎭 [AVATAR_MANAGER] Found avatars:', avatars.length);

      if (avatars.length === 0) {
        throw new Error('No avatars available');
      }

      // Select the first avatar as default
      const firstAvatar = avatars[0];
      console.log('🎭 [AVATAR_MANAGER] Selected first avatar:', firstAvatar.name);

      // Create SelectedAvatar object with first variant
      const selectedAvatar: SelectedAvatar = {
        avatar: firstAvatar,
        selectedVariant: firstAvatar.variants[0] || {
          code: firstAvatar.code,
          name: 'Default',
          thumbnail: firstAvatar.canvas,
          duration: 60
        }
      };

      setDefaultAvatar(selectedAvatar);
      console.log('🎭 [AVATAR_MANAGER] Default avatar set successfully');

    } catch (err) {
      console.error('🎭 [AVATAR_MANAGER] Error fetching avatars:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAvatars = async () => {
    await fetchAvatars();
  };

  useEffect(() => {
    fetchAvatars();
  }, []);

  const contextValue: AvatarDisplayContextType = {
    defaultAvatar,
    isLoading,
    error,
    refreshAvatars,
  };

  return (
    <AvatarDisplayContext.Provider value={contextValue}>
      {children}
    </AvatarDisplayContext.Provider>
  );
};
