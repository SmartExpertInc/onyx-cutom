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
    rightSectionBackgroundColor?: string;
    eventListGradient?: string;
    tableHeaderColor?: string;
    tableFirstColumnColor?: string;
    tableBackgroundColor?: string;
    tableDataCellColor?: string;
    tableBorderColor?: string;
    tableTextColor?: string;
    tableHeaderTextColor?: string;
    tableCheckmarkColor?: string;
    tableCrossColor?: string;
    tableDeleteButtonColor?: string;
    tableDeleteButtonTextColor?: string;
    marketShareGradient?: string;
    pyramidBackgroundColor?: string;
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
  // V1 (Legacy) Themes - Used by old presentations
  'dark-purple-v1': {
    id: 'dark-purple-v1',
    name: 'Dark Purple (V1)',
    colors: {
      backgroundColor: '#110c35',
      titleColor: '#ffffff',
      subtitleColor: '#d9e1ff',
      contentColor: '#d9e1ff',
      accentColor: '#f35657',
      borderColor: '#e5e7eb'
    },
    fonts: {
      titleFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      contentFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      titleSize: '45px',
      contentSize: '18px'
    }
  },

  // V2 (Current) Themes - Used by new presentations
  'dark-purple': {
    id: 'dark-purple',
    name: 'Dark Purple',
    colors: {
      backgroundColor: 'linear-gradient(to bottom, #002D91 0%, #000C5B 100%)',
      titleColor: '#ffffff',        // Белый для заголовков на темном фоне
      subtitleColor: '#ffffff',     // Белый для описаний на темном фоне  
      contentColor: '#09090B',      // Темно-серый для обычного текста на белом фоне
      accentColor: '#f35657',       // Красный акцент
      borderColor: '#e5e7eb',       // Светло-серая граница
      rightSectionBackgroundColor: '#ffffff',  // Белый для правого блока в EventList
      eventListGradient: 'linear-gradient(#0F58F9 0%, #1023A1 100%)',  // Новый градиент для EventList
      tableHeaderColor: '#0F58F9',  // Новый синий цвет для заголовков таблицы
      tableFirstColumnColor: '#F2F8FE',  // Светло-голубой для первой колонки
      tableBackgroundColor: '#ffffff',  // Белый фон для таблицы
      tableDataCellColor: '#ffffff',  // Белый фон для ячеек данных
      tableBorderColor: '#E0E0E0',  // Светло-серая граница для таблицы
      tableTextColor: '#000000',  // Черный текст в таблице
      tableHeaderTextColor: '#ffffff',  // Белый текст в заголовках
      tableCheckmarkColor: '#0F58F9',  // Синий цвет для галочек
      tableCrossColor: '#94a3b8',  // Серый цвет для крестиков
      tableDeleteButtonColor: '#FFB6C1',  // Розовый фон для кнопки удаления
      tableDeleteButtonTextColor: '#FF0000',  // Красный текст для кнопки удаления
      marketShareGradient: 'linear-gradient(to bottom, #0F58F9 0%, #1023A1 100%)',  // Новый градиент для MarketShare
      pyramidBackgroundColor: '#ffffff'  // Белый фон для Pyramid
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
      titleFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      contentFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
      titleFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      contentFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
    titleFont: 'Lora Variable, Lora, serif',
    contentFont: 'Lora Variable, Lora, serif',
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
      titleFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      contentFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
      titleFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      contentFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
      titleFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      contentFont: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      titleSize: '40px',
      contentSize: '16px'
    }
  }
};

// Default theme
export const DEFAULT_SLIDE_THEME = 'dark-purple';

// Map theme names to their v1 versions for legacy decks
const THEME_V1_MAP: Record<string, string> = {
  'dark-purple': 'dark-purple-v1',
  // Add other theme mappings as needed
};

// Helper function to get theme with version awareness
export function getSlideTheme(themeId?: string, deckTemplateVersion?: string): SlideTheme {
  const effectiveThemeId = themeId || DEFAULT_SLIDE_THEME;
  
  // For legacy decks (no version or < v2), use v1 theme if available
  if (!deckTemplateVersion || deckTemplateVersion < 'v2') {
    const v1ThemeId = THEME_V1_MAP[effectiveThemeId];
    if (v1ThemeId && SLIDE_THEMES[v1ThemeId]) {
      return SLIDE_THEMES[v1ThemeId];
    }
  }
  
  return SLIDE_THEMES[effectiveThemeId] || SLIDE_THEMES[DEFAULT_SLIDE_THEME];
}

// Helper function to get theme colors for a specific slide
export function getThemeColors(themeId?: string, deckTemplateVersion?: string) {
  return getSlideTheme(themeId, deckTemplateVersion).colors;
}

// Helper function to get theme fonts for a specific slide
export function getThemeFonts(themeId?: string, deckTemplateVersion?: string) {
  return getSlideTheme(themeId, deckTemplateVersion).fonts;
} 