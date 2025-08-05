// Theme Constants
// Shared theme options and mappings for consistent usage across the application

import { SLIDE_THEMES } from '@/types/slideThemes';
import { ThemeSvgs } from '@/components/theme/ThemeSvgs';

// Theme option interface
export interface ThemeOption {
  id: string;
  label: string;
}

// Available theme options - matches the pattern used in creation flows
export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'dark-purple', label: 'Dark Purple' },
  { id: 'light-modern', label: 'Light Modern' },
  { id: 'corporate-blue', label: 'Corporate Blue' },
  { id: 'chudo-theme', label: 'Chudo Theme' },
  { id: 'chudo-2', label: 'Chudo 2' },
  { id: 'forta', label: 'Forta' },
  { id: 'forta-2', label: 'Forta 2' },
];

// Map slide theme IDs to their SVG components
export const THEME_SVG_MAP = {
  'dark-purple': ThemeSvgs.wine,     // Using wine SVG for dark-purple theme
  'light-modern': ThemeSvgs.cherry,  // Using cherry SVG for light-modern theme  
  'corporate-blue': ThemeSvgs.vanilla, // Using vanilla SVG for corporate-blue theme
  'chudo-theme': ThemeSvgs.chudo,    // Using chudo SVG for chudo-theme
  'chudo-2': ThemeSvgs.chudo2,       // Using chudo2 SVG for chudo-2 theme
  'forta': ThemeSvgs.forta,          // Using forta SVG for forta theme
  'forta-2': ThemeSvgs.forta,        // Using same forta SVG for forta-2 theme
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