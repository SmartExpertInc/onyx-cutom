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
      marketShareGradient: 'linear-gradient(to bottom, #0F58F9 0%, #1023A1 100%)'  // Новый градиент для MarketShare
    },
    fonts: {
      titleFont: 'Lora, serif',
      contentFont: 'Lora, serif',
      titleSize: '45px',
      contentSize: '18px'
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