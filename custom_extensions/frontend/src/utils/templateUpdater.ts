// Утилита для массового обновления шаблонов слайдов
// Обеспечивает единообразие стилей между фронтендом и PDF

import { getStandardSlideStyles, getStandardTitleStyles, getStandardSubtitleStyles, getStandardContentStyles } from '@/styles/slideStandards';

export interface TemplateUpdateConfig {
  templateName: string;
  filePath: string;
  slideStylesSelector: string;
  titleStylesSelector?: string;
  subtitleStylesSelector?: string;
  contentStylesSelector?: string;
  customOverrides?: Record<string, any>;
}

// Конфигурация для обновления всех шаблонов
export const TEMPLATE_UPDATE_CONFIGS: TemplateUpdateConfig[] = [
  {
    templateName: 'FourBoxGridTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/FourBoxGridTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'TimelineTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/TimelineTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'PyramidTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/PyramidTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'TableDarkTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/TableDarkTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'TableLightTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/TableLightTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'SixIdeasListTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/SixIdeasListTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'PieChartInfographicsTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/PieChartInfographicsTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'OrgChartTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/OrgChartTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'MarketShareTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/MarketShareTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'MetricsAnalyticsTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/MetricsAnalyticsTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'HeroTitleSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/HeroTitleSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'ContraindicationsIndicationsTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/ContraindicationsIndicationsTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'EventListTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/EventListTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'ChartTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/ChartTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'ChallengesSolutionsTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/ChallengesSolutionsTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'BarChartSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/BarChartSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'BigImageLeftTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/BigImageLeftTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'AvatarWithButtonsSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/AvatarWithButtonsSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'BarChartInfographicsTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/BarChartInfographicsTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'AvatarStepsSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/AvatarStepsSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'AvatarCrmSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/AvatarCrmSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'AvatarServiceSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/AvatarServiceSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'AvatarChecklistSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/AvatarChecklistSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'ComparisonSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/ComparisonSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'CourseOverviewSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/CourseOverviewSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'BenefitsListSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/BenefitsListSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'TwoColumnSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/TwoColumnSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'WorkLifeBalanceSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/WorkLifeBalanceSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'SoftSkillsAssessmentSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/SoftSkillsAssessmentSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'ThankYouSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/ThankYouSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'DataAnalysisSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/DataAnalysisSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'HybridWorkBestPracticesSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/HybridWorkBestPracticesSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'PsychologicalSafetySlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/PsychologicalSafetySlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'LearningTopicsSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/LearningTopicsSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'ImpactStatementsSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/ImpactStatementsSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'PhishingDefinitionSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/PhishingDefinitionSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'BenefitsTagsSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/BenefitsTagsSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  },
  {
    templateName: 'CriticalThinkingSlideTemplate',
    filePath: 'custom_extensions/frontend/src/components/templates/CriticalThinkingSlideTemplate.tsx',
    slideStylesSelector: 'slideStyles',
    titleStylesSelector: 'titleStyles',
    subtitleStylesSelector: 'subtitleStyles'
  }
];

// Функция для получения стандартных стилей с переопределениями
export function getStandardizedStyles(
  styleType: 'slide' | 'title' | 'subtitle' | 'content',
  theme?: any,
  customOverrides?: Record<string, any>
): React.CSSProperties {
  let baseStyles: React.CSSProperties;
  
  switch (styleType) {
    case 'slide':
      baseStyles = getStandardSlideStyles(theme);
      break;
    case 'title':
      baseStyles = getStandardTitleStyles(theme);
      break;
    case 'subtitle':
      baseStyles = getStandardSubtitleStyles(theme);
      break;
    case 'content':
      baseStyles = getStandardContentStyles(theme);
      break;
    default:
      baseStyles = {};
  }
  
  return {
    ...baseStyles,
    ...customOverrides
  };
}

// Функция для проверки, нужно ли обновлять шаблон
export function shouldUpdateTemplate(fileContent: string, templateName: string): boolean {
  // Проверяем, есть ли уже импорт стандартных стилей
  const hasStandardImport = fileContent.includes('@/styles/slideStandards');
  
  // Проверяем, используются ли стандартные стили
  const usesStandardStyles = fileContent.includes('getStandardSlideStyles') || 
                           fileContent.includes('getStandardTitleStyles') ||
                           fileContent.includes('getStandardSubtitleStyles') ||
                           fileContent.includes('getStandardContentStyles');
  
  return !hasStandardImport || !usesStandardStyles;
}

// Функция для генерации кода обновления
export function generateUpdateCode(
  templateName: string,
  config: TemplateUpdateConfig
): string {
  return `
// Обновление для ${templateName}
// Добавить импорт:
import { getStandardSlideStyles, getStandardTitleStyles, getStandardSubtitleStyles, getStandardContentStyles } from '@/styles/slideStandards';

// Заменить ${config.slideStylesSelector}:
const ${config.slideStylesSelector}: React.CSSProperties = {
  ...getStandardSlideStyles(currentTheme),
  ${config.customOverrides ? Object.entries(config.customOverrides).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(',\n  ') : ''}
};

${config.titleStylesSelector ? `
// Заменить ${config.titleStylesSelector}:
const ${config.titleStylesSelector}: React.CSSProperties = {
  ...getStandardTitleStyles(currentTheme),
  // Добавить специфичные переопределения если нужно
};
` : ''}

${config.subtitleStylesSelector ? `
// Заменить ${config.subtitleStylesSelector}:
const ${config.subtitleStylesSelector}: React.CSSProperties = {
  ...getStandardSubtitleStyles(currentTheme),
  // Добавить специфичные переопределения если нужно
};
` : ''}

${config.contentStylesSelector ? `
// Заменить ${config.contentStylesSelector}:
const ${config.contentStylesSelector}: React.CSSProperties = {
  ...getStandardContentStyles(currentTheme),
  // Добавить специфичные переопределения если нужно
};
` : ''}
`;
}