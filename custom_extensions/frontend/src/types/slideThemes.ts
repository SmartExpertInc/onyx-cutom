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
      backgroundColor: 'linear-gradient(90deg, #002D91 0%, #000C5B 100%)',
      titleColor: '#ffffff',
      subtitleColor: '#d9e1ff',
      contentColor: '#d9e1ff',
      accentColor: '#f35657'
    },
    fonts: {
      titleFont: 'Lora, serif',
      contentFont: 'Lora, serif',
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
    backgroundColor: '#ffffff',
    titleColor: '#ed6c00',
    subtitleColor: '#3a3a3a',
    contentColor: '#3a3a3a',
    accentColor: '#d01510',
    borderColor: '#d01510'
  },
  fonts: {
    titleFont: 'Mont Bold, sans-serif',
    contentFont: 'Mont Regular, sans-serif',
    titleSize: '40px',
    contentSize: '16px'
  }
  },

  'chudo-2': {
    id: 'chudo-2',
    name: 'Chudo 2',
    colors: {
      backgroundColor: '#e8e9e3',
      titleColor: '#ed6c00',
      subtitleColor: '#3a3a3a',
      contentColor: '#3a3a3a',
      accentColor: '#d01510',
      borderColor: '#d01510'
    },
    fonts: {
      titleFont: 'Mont Bold, sans-serif',
      contentFont: 'Mont Regular, sans-serif',
      titleSize: '40px',
      contentSize: '16px'
    }
  },
  'forta': {
    id: 'forta',
    name: 'Forta',
    colors: {
      backgroundColor: '#ffffff',
      titleColor: '#00664f',
      subtitleColor: '#414349',
      contentColor: '#414349',
      accentColor: '#ee7623',
      borderColor: '#ee7623'
    },
    fonts: {
      titleFont: 'Montserrat, sans-serif',
      contentFont: 'Montserrat, sans-serif',
      titleSize: '40px',
      contentSize: '16px'
    }
  },
  'forta-2': {
    id: 'forta-2',
    name: 'Forta 2',
    colors: {
      backgroundColor: '#e1d3c4',      
      titleColor: '#00664f',         
      subtitleColor: '#414349',              
      contentColor: '#414349',               
      accentColor: '#ee7623',        
      borderColor: '#ee7623'        
    },
    fonts: {
      titleFont: 'Montserrat, sans-serif',
      contentFont: 'Montserrat, sans-serif',
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