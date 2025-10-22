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
    const theme = getThemeWithFallback(initialTheme, slideDeck?.theme, enablePersistence ? projectId : undefined);
    // Ensure we always return a valid theme
    return theme && theme.trim() !== '' ? theme : DEFAULT_SLIDE_THEME;
  };

  const [currentTheme, setCurrentTheme] = useState<string>(resolveInitialTheme);
  const [isChangingTheme, setIsChangingTheme] = useState<boolean>(false);

  // Get current theme data - ensure we always have a valid theme
  const effectiveCurrentTheme = currentTheme && currentTheme.trim() !== '' ? currentTheme : DEFAULT_SLIDE_THEME;
  const themeData = getSlideTheme(effectiveCurrentTheme);

  // Effect to handle theme updates when slide deck changes (but respect user preferences)
  useEffect(() => {
    // Only update theme if there's no user preference saved
    if (slideDeck?.theme && isValidThemeId(slideDeck.theme)) {
      const savedTheme = enablePersistence ? loadThemePreference(projectId) : null;
      
      // Only apply slide deck theme if user hasn't manually selected a different theme
      if (!savedTheme && slideDeck.theme !== currentTheme) {
        console.log(`📥 Applying slide deck theme: ${slideDeck.theme} (no user preference found)`);
        setCurrentTheme(slideDeck.theme);
      } else if (savedTheme) {
        console.log(`👤 Keeping user's preferred theme: ${savedTheme} (ignoring slide deck theme: ${slideDeck.theme})`);
      }
    }
  }, [slideDeck?.theme, enablePersistence, projectId]); // Removed currentTheme to avoid loops

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
    currentTheme: effectiveCurrentTheme,
    themeData,
    changeTheme,
    isChangingTheme
  };
}