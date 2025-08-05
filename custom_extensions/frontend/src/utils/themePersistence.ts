// Theme Persistence Utilities
// Helper functions for managing theme preferences across sessions

import { isValidThemeId } from '@/constants/themeConstants';
import { DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

// Storage key constants
const THEME_STORAGE_PREFIX = 'theme-preference';
const GLOBAL_THEME_KEY = `${THEME_STORAGE_PREFIX}-global`;
const CREATION_THEME_KEY = `${THEME_STORAGE_PREFIX}-creation`;

// Generate storage key for a specific project
export const getThemeStorageKey = (projectId?: string): string => {
  return projectId ? `${THEME_STORAGE_PREFIX}-${projectId}` : GLOBAL_THEME_KEY;
};

// Generate storage key for creation context (template-specific)
export const getCreationThemeStorageKey = (templateType?: string): string => {
  return templateType ? `${CREATION_THEME_KEY}-${templateType}` : CREATION_THEME_KEY;
};

// Save theme preference to local storage
export const saveThemePreference = (themeId: string, projectId?: string): boolean => {
  try {
    if (!isValidThemeId(themeId)) {
      console.warn(`Invalid theme ID: ${themeId}`);
      return false;
    }

    const storageKey = getThemeStorageKey(projectId);
    localStorage.setItem(storageKey, themeId);
    
    console.log(`💾 Theme preference saved: ${themeId} (key: ${storageKey})`);
    return true;
  } catch (error) {
    console.error('Failed to save theme preference:', error);
    return false;
  }
};

// Load theme preference from local storage
export const loadThemePreference = (projectId?: string): string | null => {
  try {
    const storageKey = getThemeStorageKey(projectId);
    const savedTheme = localStorage.getItem(storageKey);
    
    if (savedTheme && isValidThemeId(savedTheme)) {
      console.log(`📂 Theme preference loaded: ${savedTheme} (key: ${storageKey})`);
      return savedTheme;
    }
  } catch (error) {
    console.error('Failed to load theme preference:', error);
  }
  return null;
};

// Save theme preference for creation context (template-specific)
export const saveCreationThemePreference = (themeId: string, templateType?: string): boolean => {
  try {
    if (!isValidThemeId(themeId)) {
      console.warn(`Invalid theme ID: ${themeId}`);
      return false;
    }

    const storageKey = getCreationThemeStorageKey(templateType);
    localStorage.setItem(storageKey, themeId);
    
    console.log(`💾 Creation theme preference saved: ${themeId} (key: ${storageKey})`);
    return true;
  } catch (error) {
    console.error('Failed to save creation theme preference:', error);
    return false;
  }
};

// Load theme preference for creation context (template-specific)
export const loadCreationThemePreference = (templateType?: string): string | null => {
  try {
    const storageKey = getCreationThemeStorageKey(templateType);
    const savedTheme = localStorage.getItem(storageKey);
    
    if (savedTheme && isValidThemeId(savedTheme)) {
      console.log(`📂 Creation theme preference loaded: ${savedTheme} (key: ${storageKey})`);
      return savedTheme;
    }
  } catch (error) {
    console.error('Failed to load creation theme preference:', error);
  }
  return null;
};

// Clear theme preference for a specific project
export const clearThemePreference = (projectId?: string): boolean => {
  try {
    const storageKey = getThemeStorageKey(projectId);
    localStorage.removeItem(storageKey);
    
    console.log(`🗑️ Theme preference cleared (key: ${storageKey})`);
    return true;
  } catch (error) {
    console.error('Failed to clear theme preference:', error);
    return false;
  }
};

// Clear theme preference for creation context
export const clearCreationThemePreference = (templateType?: string): boolean => {
  try {
    const storageKey = getCreationThemeStorageKey(templateType);
    localStorage.removeItem(storageKey);
    
    console.log(`🗑️ Creation theme preference cleared (key: ${storageKey})`);
    return true;
  } catch (error) {
    console.error('Failed to clear creation theme preference:', error);
    return false;
  }
};

// Get all saved theme preferences
export const getAllThemePreferences = (): Record<string, string> => {
  const preferences: Record<string, string> = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(THEME_STORAGE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value && isValidThemeId(value)) {
          preferences[key] = value;
        }
      }
    }
  } catch (error) {
    console.error('Failed to get all theme preferences:', error);
  }
  
  return preferences;
};

// Migrate theme preferences (useful for updates)
export const migrateThemePreferences = (oldPrefix: string, newPrefix: string): void => {
  try {
    const keysToMigrate: string[] = [];
    
    // Find all keys with old prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(oldPrefix)) {
        keysToMigrate.push(key);
      }
    }
    
    // Migrate each key
    keysToMigrate.forEach(oldKey => {
      const value = localStorage.getItem(oldKey);
      if (value && isValidThemeId(value)) {
        const newKey = oldKey.replace(oldPrefix, newPrefix);
        localStorage.setItem(newKey, value);
        localStorage.removeItem(oldKey);
        console.log(`🔄 Migrated theme preference: ${oldKey} → ${newKey}`);
      }
    });
  } catch (error) {
    console.error('Failed to migrate theme preferences:', error);
  }
};

// Validate and sanitize theme ID
export const validateThemeId = (themeId: string): string => {
  if (isValidThemeId(themeId)) {
    return themeId;
  }
  console.warn(`Invalid theme ID: ${themeId}. Using default theme.`);
  return DEFAULT_SLIDE_THEME;
};

// Get theme preference with fallback chain
export const getThemeWithFallback = (
  explicitTheme?: string,
  slideDeckTheme?: string,
  projectId?: string
): string => {
  // Priority order: explicit > user's manual selection (local storage) > slide deck > default
  if (explicitTheme && isValidThemeId(explicitTheme)) {
    return explicitTheme;
  }
  
  // User's manual selection takes precedence over slide deck theme
  const savedTheme = loadThemePreference(projectId);
  if (savedTheme) {
    return savedTheme;
  }
  
  // Fall back to slide deck theme if no user preference
  if (slideDeckTheme && isValidThemeId(slideDeckTheme)) {
    return slideDeckTheme;
  }
  
  return DEFAULT_SLIDE_THEME;
};

// Get theme preference with fallback chain for creation contexts
export const getCreationThemeWithFallback = (
  explicitTheme?: string,
  templateType?: string,
  templateDefaultTheme?: string
): string => {
  // Priority order: explicit > template-specific saved > template default > global default
  if (explicitTheme && isValidThemeId(explicitTheme)) {
    return explicitTheme;
  }
  
  const savedCreationTheme = loadCreationThemePreference(templateType);
  if (savedCreationTheme) {
    return savedCreationTheme;
  }
  
  if (templateDefaultTheme && isValidThemeId(templateDefaultTheme)) {
    return templateDefaultTheme;
  }
  
  return DEFAULT_SLIDE_THEME;
}; 