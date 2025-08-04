// useTheme Hook
// Custom hook for managing slide deck theme state and updates

import { useState, useCallback } from 'react';
import { ComponentBasedSlideDeck } from '@/types/slideTemplates';
import { DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import { isValidThemeId } from '@/constants/themeConstants';

interface UseThemeOptions {
  /** Initial theme ID */
  initialTheme?: string;
  /** Callback when theme changes */
  onThemeChange?: (newTheme: string, updatedDeck?: ComponentBasedSlideDeck) => void;
  /** Current slide deck data */
  slideDeck?: ComponentBasedSlideDeck;
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
  slideDeck
}: UseThemeOptions): UseThemeReturn {
  // Determine initial theme from props, deck, or default
  const resolveInitialTheme = () => {
    if (initialTheme && isValidThemeId(initialTheme)) {
      return initialTheme;
    }
    if (slideDeck?.theme && isValidThemeId(slideDeck.theme)) {
      return slideDeck.theme;
    }
    return DEFAULT_SLIDE_THEME;
  };

  const [currentTheme, setCurrentTheme] = useState<string>(resolveInitialTheme);
  const [isChangingTheme, setIsChangingTheme] = useState<boolean>(false);

  // Get current theme data
  const themeData = getSlideTheme(currentTheme);

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
        updatedDeck: updatedDeck ? 'Created' : 'Not provided'
      });

    } catch (error) {
      console.error('❌ Error changing theme:', error);
      // Revert to previous theme on error
      setCurrentTheme(currentTheme);
    } finally {
      setIsChangingTheme(false);
    }
  }, [currentTheme, onThemeChange, slideDeck]);

  return {
    currentTheme,
    themeData,
    changeTheme,
    isChangingTheme
  };
}