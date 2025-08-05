// useTheme Hook
// Custom hook for managing slide deck theme state and updates

import { useState, useCallback, useEffect } from 'react';
import { ComponentBasedSlideDeck } from '@/types/slideTemplates';
import { DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import { isValidThemeId } from '@/constants/themeConstants';
import { 
  saveThemePreference, 
  loadThemePreference, 
  getThemeWithFallback 
} from '@/utils/themePersistence';

interface UseThemeOptions {
  /** Initial theme ID */
  initialTheme?: string;
  /** Callback when theme changes */
  onThemeChange?: (newTheme: string, updatedDeck?: ComponentBasedSlideDeck) => void;
  /** Current slide deck data */
  slideDeck?: ComponentBasedSlideDeck;
  /** Project ID for local storage key */
  projectId?: string;
  /** Whether to enable local storage persistence */
  enablePersistence?: boolean;
}

interface UseThemeReturn {
  /** Current theme ID */
  currentTheme: string;
  /** Current theme object */
  themeData: ReturnType<typeof getSlideTheme>;
  /** Change theme function */
  changeTheme: (newThemeId: string) => void;
  /** Whether theme is currently being changed */
  isChangingTheme: boolean;
}

export function useTheme({
  initialTheme,
  onThemeChange,
  slideDeck,
  projectId,
  enablePersistence = true
}: UseThemeOptions): UseThemeReturn {
  // Determine initial theme using the utility function
  const resolveInitialTheme = () => {
    return getThemeWithFallback(initialTheme, slideDeck?.theme, enablePersistence ? projectId : undefined);
  };

  const [currentTheme, setCurrentTheme] = useState<string>(resolveInitialTheme);
  const [isChangingTheme, setIsChangingTheme] = useState<boolean>(false);

  // Get current theme data
  const themeData = getSlideTheme(currentTheme);

  // Effect to handle theme persistence on mount and when slide deck changes
  useEffect(() => {
    if (slideDeck?.theme && isValidThemeId(slideDeck.theme)) {
      // If slide deck has a theme, use it and save to local storage
      if (slideDeck.theme !== currentTheme) {
        setCurrentTheme(slideDeck.theme);
        if (enablePersistence) {
          saveThemePreference(slideDeck.theme, projectId);
        }
      }
    }
  }, [slideDeck?.theme, currentTheme, enablePersistence, projectId]);

  // Change theme function
  const changeTheme = useCallback((newThemeId: string) => {
    if (!isValidThemeId(newThemeId)) {
      console.warn(`Invalid theme ID: ${newThemeId}. Using default theme.`);
      newThemeId = DEFAULT_SLIDE_THEME;
    }

    if (newThemeId === currentTheme) {
      return; // No change needed
    }

    setIsChangingTheme(true);

    try {
      // Update local state
      setCurrentTheme(newThemeId);

      // Save to local storage for persistence
      if (enablePersistence) {
        saveThemePreference(newThemeId, projectId);
      }

      // Create updated deck if slide deck is provided
      let updatedDeck: ComponentBasedSlideDeck | undefined;
      if (slideDeck) {
        updatedDeck = {
          ...slideDeck,
          theme: newThemeId
        };
      }

      // Call onChange callback
      onThemeChange?.(newThemeId, updatedDeck);

      console.log(`✅ Theme changed to: ${newThemeId}`, {
        previousTheme: currentTheme,
        newTheme: newThemeId,
        themeData: getSlideTheme(newThemeId),
        updatedDeck: updatedDeck ? 'Created' : 'Not provided',
        persisted: enablePersistence ? 'Yes' : 'No'
      });

    } catch (error) {
      console.error('❌ Error changing theme:', error);
      // Revert to previous theme on error
      setCurrentTheme(currentTheme);
    } finally {
      setIsChangingTheme(false);
    }
  }, [currentTheme, onThemeChange, slideDeck, enablePersistence, projectId]);

  return {
    currentTheme,
    themeData,
    changeTheme,
    isChangingTheme
  };
}