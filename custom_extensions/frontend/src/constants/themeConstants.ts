// Theme Constants
// Shared theme options and mappings for consistent usage across the application

import { SLIDE_THEMES } from '@/types/slideThemes';
import { ThemeSvgs } from '@/components/theme/ThemeSvgs';

// Theme option interface
export interface ThemeOption {
  id: string;
  label: string;
}

// Base theme options (always available)
const BASE_THEME_OPTIONS: ThemeOption[] = [
  { id: 'dark-purple', label: 'Dark Purple' },
];

// ChudoMarket theme options (feature flag controlled)
const CHUDO_MARKET_THEME_OPTIONS: ThemeOption[] = [
  { id: 'chudo-theme', label: 'Chudo Theme' },
  { id: 'chudo-2', label: 'Chudo 2' },
  { id: 'forta', label: 'Forta' },
  { id: 'forta-2', label: 'Forta 2' },
];

// All available theme options (for backward compatibility)
export const THEME_OPTIONS: ThemeOption[] = [
  ...BASE_THEME_OPTIONS,
  ...CHUDO_MARKET_THEME_OPTIONS,
];

// Function to get filtered theme options based on feature flags
export function getFilteredThemeOptions(hasChudoMarketThemes: boolean = false): ThemeOption[] {
  if (hasChudoMarketThemes) {
    return [...BASE_THEME_OPTIONS, ...CHUDO_MARKET_THEME_OPTIONS];
  }
  return BASE_THEME_OPTIONS;
}

// Map slide theme IDs to their SVG components
export const THEME_SVG_MAP = {
  'dark-purple': ThemeSvgs.wine,
  'chudo-theme': ThemeSvgs.chudo,
  'chudo-2': ThemeSvgs.chudo2,
  'forta': ThemeSvgs.forta,
  'forta-2': ThemeSvgs.forta2,
  default: ThemeSvgs.default
};

// Get theme option by ID
export function getThemeOption(themeId: string): ThemeOption | undefined {
  return THEME_OPTIONS.find(option => option.id === themeId);
}

// Get theme SVG component by ID
export function getThemeSvg(themeId: string) {
  return THEME_SVG_MAP[themeId as keyof typeof THEME_SVG_MAP] || THEME_SVG_MAP.default;
}

// Check if theme ID is valid
export function isValidThemeId(themeId: string): boolean {
  return Object.keys(SLIDE_THEMES).includes(themeId);
}

// Check if theme requires ChudoMarket feature flag
export function isChudoMarketTheme(themeId: string): boolean {
  return CHUDO_MARKET_THEME_OPTIONS.some(option => option.id === themeId);
}

// Validate theme access based on feature flags, return fallback if not accessible
export function validateThemeAccess(themeId: string, hasChudoMarketThemes: boolean = false): string {
  // If theme doesn't exist, return default
  if (!isValidThemeId(themeId)) {
    return 'dark-purple';
  }
  
  // If it's a ChudoMarket theme but user doesn't have access, return default
  if (isChudoMarketTheme(themeId) && !hasChudoMarketThemes) {
    return 'dark-purple';
  }
  
  // Theme is valid and accessible
  return themeId;
}