"use client";

// custom_extensions/frontend/src/components/AvatarDisplayManager.tsx

import React, { useState, useEffect, createContext, useContext } from 'react';
import { SelectedAvatar, ElaiAvatar, ElaiAvatarVariant } from '@/types/elaiTypes';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

// Local storage key for avatar persistence
const AVATAR_STORAGE_KEY = 'selected_avatar_data';

interface AvatarDisplayContextType {
  defaultAvatar: SelectedAvatar | null;
  isLoading: boolean;
  error: string | null;
  refreshAvatars: () => Promise<void>;
  updateSelectedAvatar: (avatar: ElaiAvatar, variant?: ElaiAvatarVariant) => void;
  clearSelectedAvatar: () => void;
}

const AvatarDisplayContext = createContext<AvatarDisplayContextType>({
  defaultAvatar: null,
  isLoading: false,
  error: null,
  refreshAvatars: async () => {},
  updateSelectedAvatar: () => {},
  clearSelectedAvatar: () => {},
});

export const useAvatarDisplay = () => useContext(AvatarDisplayContext);

interface AvatarDisplayManagerProps {
  children: React.ReactNode;
}

export const AvatarDisplayManager: React.FC<AvatarDisplayManagerProps> = ({ children }) => {
  const [defaultAvatar, setDefaultAvatar] = useState<SelectedAvatar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allAvatars, setAllAvatars] = useState<ElaiAvatar[]>([]);

  // Load saved avatar from localStorage
  const loadSavedAvatar = (): SelectedAvatar | null => {
    try {
      const savedData = localStorage.getItem(AVATAR_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        console.log('🎭 [AVATAR_MANAGER] Loaded saved avatar from localStorage:', parsed);
        return parsed;
      }
    } catch (err) {
      console.warn('🎭 [AVATAR_MANAGER] Failed to load saved avatar from localStorage:', err);
    }
    return null;
  };

  // Save avatar to localStorage
  const saveAvatarToStorage = (avatar: SelectedAvatar) => {
    try {
      localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatar));
      console.log('🎭 [AVATAR_MANAGER] Saved avatar to localStorage:', avatar);
    } catch (err) {
      console.warn('🎭 [AVATAR_MANAGER] Failed to save avatar to localStorage:', err);
    }
  };

  // Clear saved avatar from localStorage
  const clearSavedAvatar = () => {
    try {
      localStorage.removeItem(AVATAR_STORAGE_KEY);
      console.log('🎭 [AVATAR_MANAGER] Cleared saved avatar from localStorage');
    } catch (err) {
      console.warn('🎭 [AVATAR_MANAGER] Failed to clear saved avatar from localStorage:', err);
    }
  };

  // Update the selected avatar (called by AvatarSelector)
  const updateSelectedAvatar = (avatar: ElaiAvatar, variant?: ElaiAvatarVariant) => {
    const selectedVariant = variant || avatar.variants[0] || {
      code: avatar.code,
      name: 'Default',
      thumbnail: avatar.canvas,
      duration: 60
    };

    const newSelectedAvatar: SelectedAvatar = {
      avatar,
      selectedVariant
    };

    setDefaultAvatar(newSelectedAvatar);
    saveAvatarToStorage(newSelectedAvatar);
    
    console.log('🎭 [AVATAR_MANAGER] Updated selected avatar:', {
      avatar: avatar.name,
      variant: selectedVariant.name,
      code: selectedVariant.code
    });
  };

  // Clear the selected avatar
  const clearSelectedAvatar = () => {
    setDefaultAvatar(null);
    clearSavedAvatar();
    console.log('🎭 [AVATAR_MANAGER] Cleared selected avatar');
  };

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
      setAllAvatars(avatars);
      console.log('🎭 [AVATAR_MANAGER] Found avatars:', avatars.length);

      if (avatars.length === 0) {
        throw new Error('No avatars available');
      }

      // Try to load saved avatar first
      const savedAvatar = loadSavedAvatar();
      if (savedAvatar) {
        // Verify the saved avatar still exists in the fetched list
        const avatarExists = avatars.find((av: ElaiAvatar) => av.id === savedAvatar.avatar.id);
        if (avatarExists) {
          // Verify the variant still exists
          const variantExists = avatarExists.variants.find((v: ElaiAvatarVariant) => v.id === savedAvatar.selectedVariant.id);
          if (variantExists) {
            setDefaultAvatar(savedAvatar);
            console.log('🎭 [AVATAR_MANAGER] Restored saved avatar:', savedAvatar.avatar.name);
            return;
          } else {
            console.log('🎭 [AVATAR_MANAGER] Saved variant not found, using first available variant');
            const firstVariant = avatarExists.variants[0] || {
              code: avatarExists.code,
              name: 'Default',
              thumbnail: avatarExists.canvas,
              duration: 60
            };
            const updatedAvatar: SelectedAvatar = {
              avatar: avatarExists,
              selectedVariant: firstVariant
            };
            setDefaultAvatar(updatedAvatar);
            saveAvatarToStorage(updatedAvatar);
            return;
          }
        } else {
          console.log('🎭 [AVATAR_MANAGER] Saved avatar not found in fetched list, using first available');
        }
      }

      // Fallback to first avatar if no saved avatar or saved avatar not found
      const firstAvatar = avatars[0];
      console.log('🎭 [AVATAR_MANAGER] Selected first avatar as default:', firstAvatar.name);

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
      saveAvatarToStorage(selectedAvatar);
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
    updateSelectedAvatar,
    clearSelectedAvatar,
  };

  return (
    <AvatarDisplayContext.Provider value={contextValue}>
      {children}
    </AvatarDisplayContext.Provider>
  );
};
