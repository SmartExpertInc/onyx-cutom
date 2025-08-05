// Slide Theme System
// This file defines all available themes and their color schemes

export interface SlideTheme {
  id: string;
  name: string;
  colors: {
    backgroundColor: string;
    titleColor: string;
    subtitleColor: string;
    contentColor: string;
    accentColor: string;
    borderColor?: string;
  };
  fonts: {
    titleFont: string;
    contentFont: string;
    titleSize: string;
    contentSize: string;
  };
}

// Available slide themes
export const SLIDE_THEMES: Record<string, SlideTheme> = {
  'dark-purple': {
    id: 'dark-purple',
    name: 'Dark Purple',
    colors: {
      backgroundColor: '#110c35',
      titleColor: '#ffffff',
      subtitleColor: '#d9e1ff',
      contentColor: '#d9e1ff',
      accentColor: '#f35657'
    },
    fonts: {
      titleFont: 'Kanit, sans-serif',
      contentFont: 'Martel Sans, sans-serif',
      titleSize: '45px',
      contentSize: '18px'
    }
  },
  
  'light-modern': {
    id: 'light-modern',
    name: 'Light Modern',
    colors: {
      backgroundColor: '#ffffff',
      titleColor: '#1a1a1a',
      subtitleColor: '#6b7280',
      contentColor: '#374151',
      accentColor: '#3b82f6'
    },
    fonts: {
      titleFont: 'Inter, sans-serif',
      contentFont: 'Martel Sans, sans-serif',
      titleSize: '36px',
      contentSize: '16px'
    }
  },
  
  'corporate-blue': {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    colors: {
      backgroundColor: '#1e3a8a',
      titleColor: '#ffffff',
      subtitleColor: '#bfdbfe',
      contentColor: '#e0e7ff',
      accentColor: '#60a5fa'
    },
    fonts: {
      titleFont: 'Roboto, sans-serif',
      contentFont: 'Martel Sans, sans-serif',
      titleSize: '40px',
      contentSize: '16px'
    }
  },
  
  'chudo-theme': {
    id: 'chudo-theme',
    name: 'Chudo Theme',
    colors: {
      backgroundColor: '#3a3a3a',      // темно-сірий фон
      titleColor: '#d01510',           // червоні заголовки
      subtitleColor: '#ed6c00',        // оранжеві підзаголовки
      contentColor: '#ffffff',         // білий текст
      accentColor: '#ed6c00',          // оранжеві акценти (наприклад, кнопки або іконки)
      borderColor: '#d01510'           // опціонально: червоні межі або роздільники
    },
    fonts: {
      titleFont: 'Mont Bold, sans-serif',      // жирний Mont для заголовків
      contentFont: 'Mont Regular, sans-serif', // звичайний Mont для тексту
      titleSize: '40px',
      contentSize: '16px'
    }
  }
};

// Default theme
export const DEFAULT_SLIDE_THEME = 'dark-purple';

// Helper function to get theme
export function getSlideTheme(themeId?: string): SlideTheme {
  return SLIDE_THEMES[themeId || DEFAULT_SLIDE_THEME] || SLIDE_THEMES[DEFAULT_SLIDE_THEME];
}

// Helper function to get theme colors for a specific slide
export function getThemeColors(themeId?: string) {
  return getSlideTheme(themeId).colors;
}

// Helper function to get theme fonts for a specific slide
export function getThemeFonts(themeId?: string) {
  return getSlideTheme(themeId).fonts;
} 