// Стандартизированные стили для слайдов
// Обеспечивает единообразие между фронтендом и PDF

export interface SlideStandards {
  // Стандартные размеры слайдов
  slideDimensions: {
    width: string;
    height: string;
    minHeight: string;
  };
  
  // Стандартные отступы
  spacing: {
    slidePadding: string;
    sectionGap: string;
    elementGap: string;
    smallGap: string;
  };
  
  // Стандартные размеры шрифтов
  typography: {
    titleSize: string;
    subtitleSize: string;
    contentSize: string;
    smallSize: string;
    lineHeight: {
      title: number;
      content: number;
      tight: number;
    };
  };
  
  // Стандартные цвета (будут переопределены темой)
  colors: {
    background: string;
    title: string;
    subtitle: string;
    content: string;
    accent: string;
  };
}

export const SLIDE_STANDARDS: SlideStandards = {
  slideDimensions: {
    width: '100%',
    height: '600px', // Стандартная высота для всех слайдов
    minHeight: '600px'
  },
  
  spacing: {
    slidePadding: '60px 40px', // Стандартные отступы слайда
    sectionGap: '40px', // Отступ между секциями
    elementGap: '24px', // Отступ между элементами
    smallGap: '16px' // Малый отступ
  },
  
  typography: {
    titleSize: '3rem', // 48px - стандартный размер заголовка
    subtitleSize: '1.4rem', // 22.4px - стандартный размер подзаголовка
    contentSize: '1.1rem', // 17.6px - стандартный размер контента
    smallSize: '1rem', // 16px - малый размер
    lineHeight: {
      title: 1.2,
      content: 1.5,
      tight: 1.1
    }
  },
  
  colors: {
    background: '#ffffff',
    title: '#000000',
    subtitle: '#333333',
    content: '#000000',
    accent: '#3b82f6'
  }
};

// Функция для получения стандартных стилей слайда
export function getStandardSlideStyles(theme?: any): React.CSSProperties {
  return {
    width: SLIDE_STANDARDS.slideDimensions.width,
    height: SLIDE_STANDARDS.slideDimensions.height,
    minHeight: SLIDE_STANDARDS.slideDimensions.minHeight,
    background: theme?.colors?.backgroundColor || SLIDE_STANDARDS.colors.background,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: SLIDE_STANDARDS.spacing.slidePadding,
    position: 'relative',
    fontFamily: theme?.fonts?.contentFont || 'Arial, sans-serif',
    boxSizing: 'border-box'
  };
}

// Функция для получения стандартных стилей заголовка
export function getStandardTitleStyles(theme?: any): React.CSSProperties {
  return {
    fontSize: SLIDE_STANDARDS.typography.titleSize,
    fontFamily: theme?.fonts?.titleFont || 'Arial, sans-serif',
    color: theme?.colors?.titleColor || SLIDE_STANDARDS.colors.title,
    textAlign: 'center',
    marginBottom: SLIDE_STANDARDS.spacing.elementGap,
    lineHeight: SLIDE_STANDARDS.typography.lineHeight.title,
    maxWidth: '900px',
    wordWrap: 'break-word',
    fontWeight: 'bold'
  };
}

// Функция для получения стандартных стилей подзаголовка
export function getStandardSubtitleStyles(theme?: any): React.CSSProperties {
  return {
    fontSize: SLIDE_STANDARDS.typography.subtitleSize,
    fontFamily: theme?.fonts?.contentFont || 'Arial, sans-serif',
    color: theme?.colors?.subtitleColor || SLIDE_STANDARDS.colors.subtitle,
    textAlign: 'center',
    marginBottom: SLIDE_STANDARDS.spacing.sectionGap,
    lineHeight: SLIDE_STANDARDS.typography.lineHeight.content,
    maxWidth: '700px',
    wordWrap: 'break-word',
    opacity: 0.9
  };
}

// Функция для получения стандартных стилей контента
export function getStandardContentStyles(theme?: any): React.CSSProperties {
  return {
    fontSize: SLIDE_STANDARDS.typography.contentSize,
    fontFamily: theme?.fonts?.contentFont || 'Arial, sans-serif',
    color: theme?.colors?.contentColor || SLIDE_STANDARDS.colors.content,
    lineHeight: SLIDE_STANDARDS.typography.lineHeight.content,
    wordWrap: 'break-word'
  };
}