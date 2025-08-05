// useCreationTheme Hook
// Custom hook for managing theme state in creation contexts (like lesson presentation)
// Handles template-specific theme persistence and resets when templates change

import { useState, useCallback, useEffect } from 'react';
import { DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import { isValidThemeId } from '@/constants/themeConstants';
import { 
  saveCreationThemePreference, 
  loadCreationThemePreference,
  clearCreationThemePreference,
  getCreationThemeWithFallback 
} from '@/utils/themePersistence';

interface UseCreationThemeOptions {
  /** Template type identifier (e.g., 'lesson-presentation', 'quiz', etc.) */
  templateType?: string;
  /** Default theme for this template type */
  templateDefaultTheme?: string;
  /** Initial theme ID (overrides all other sources) */
  initialTheme?: string;
  /** Callback when theme changes */
  onThemeChange?: (newTheme: string) => void;
  /** Whether to enable local storage persistence */
  enablePersistence?: boolean;
}

interface UseCreationThemeReturn {
  /** Current theme ID */
  currentTheme: string;
  /** Current theme object */
  themeData: ReturnType<typeof getSlideTheme>;
  /** Change theme function */
  changeTheme: (newThemeId: string) => void;
  /** Reset theme to template default */
  resetTheme: () => void;
  /** Whether theme is currently being changed */
  isChangingTheme: boolean;
}

export function useCreationTheme({
  templateType,
  templateDefaultTheme,
  initialTheme,
  onThemeChange,
  enablePersistence = true
}: UseCreationThemeOptions): UseCreationThemeReturn {
  
  // Determine initial theme using creation-specific fallback
  const resolveInitialTheme = () => {
    return getCreationThemeWithFallback(
      initialTheme, 
      enablePersistence ? templateType : undefined, 
      templateDefaultTheme
    );
  };

  const [currentTheme, setCurrentTheme] = useState<string>(resolveInitialTheme);
  const [isChangingTheme, setIsChangingTheme] = useState<boolean>(false);

  // Get current theme data
  const themeData = getSlideTheme(currentTheme);

  // Effect to handle template type changes - reset theme when template changes
  useEffect(() => {
    const newTheme = getCreationThemeWithFallback(
      undefined, // Don't use initial theme on template change
      enablePersistence ? templateType : undefined,
      templateDefaultTheme
    );
    
    if (newTheme !== currentTheme) {
      console.log(`🔄 Template changed, resetting theme from '${currentTheme}' to '${newTheme}'`);
      setCurrentTheme(newTheme);
      onThemeChange?.(newTheme);
    }
  }, [templateType, templateDefaultTheme, enablePersistence]); // Don't include currentTheme to avoid loops

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

      // Save to local storage for persistence (template-specific)
      if (enablePersistence) {
        saveCreationThemePreference(newThemeId, templateType);
      }

      // Call onChange callback
      onThemeChange?.(newThemeId);

      console.log(`✅ Creation theme changed to: ${newThemeId}`, {
        templateType,
        previousTheme: currentTheme,
        newTheme: newThemeId,
        themeData: getSlideTheme(newThemeId),
        persisted: enablePersistence ? 'Yes' : 'No'
      });

    } catch (error) {
      console.error('❌ Error changing creation theme:', error);
      // Revert to previous theme on error
      setCurrentTheme(currentTheme);
    } finally {
      setIsChangingTheme(false);
    }
  }, [currentTheme, onThemeChange, templateType, enablePersistence]);

  // Reset theme to template default
  const resetTheme = useCallback(() => {
    const defaultTheme = templateDefaultTheme || DEFAULT_SLIDE_THEME;
    
    // Clear saved preference for this template
    if (enablePersistence) {
      clearCreationThemePreference(templateType);
    }
    
    changeTheme(defaultTheme);
    console.log(`🔄 Theme reset to default: ${defaultTheme}`);
  }, [templateDefaultTheme, templateType, enablePersistence, changeTheme]);

  return {
    currentTheme,
    themeData,
    changeTheme,
    resetTheme,
    isChangingTheme
  };
}