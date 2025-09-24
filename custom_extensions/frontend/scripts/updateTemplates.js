#!/usr/bin/env node

/**
 * Скрипт для автоматического обновления всех шаблонов слайдов
 * Обеспечивает единообразие стилей между фронтендом и PDF
 */

const fs = require('fs');
const path = require('path');

// Список всех шаблонов для обновления
const TEMPLATES_TO_UPDATE = [
  'PyramidTemplate.tsx',
  'TableDarkTemplate.tsx',
  'TableLightTemplate.tsx',
  'SixIdeasListTemplate.tsx',
  'PieChartInfographicsTemplate.tsx',
  'OrgChartTemplate.tsx',
  'MarketShareTemplate.tsx',
  'MetricsAnalyticsTemplate.tsx',
  'HeroTitleSlideTemplate.tsx',
  'ContraindicationsIndicationsTemplate.tsx',
  'EventListTemplate.tsx',
  'ChartTemplate.tsx',
  'ChallengesSolutionsTemplate.tsx',
  'BarChartSlideTemplate.tsx',
  'BigImageLeftTemplate.tsx',
  'AvatarWithButtonsSlideTemplate.tsx',
  'BarChartInfographicsTemplate.tsx',
  'AvatarStepsSlideTemplate.tsx',
  'AvatarCrmSlideTemplate.tsx',
  'AvatarServiceSlideTemplate.tsx',
  'AvatarChecklistSlideTemplate.tsx',
  'ComparisonSlideTemplate.tsx',
  'CourseOverviewSlideTemplate.tsx',
  'BenefitsListSlideTemplate.tsx',
  'TwoColumnSlideTemplate.tsx',
  'WorkLifeBalanceSlideTemplate.tsx',
  'SoftSkillsAssessmentSlideTemplate.tsx',
  'ThankYouSlideTemplate.tsx',
  'DataAnalysisSlideTemplate.tsx',
  'HybridWorkBestPracticesSlideTemplate.tsx',
  'PsychologicalSafetySlideTemplate.tsx',
  'LearningTopicsSlideTemplate.tsx',
  'ImpactStatementsSlideTemplate.tsx',
  'PhishingDefinitionSlideTemplate.tsx',
  'BenefitsTagsSlideTemplate.tsx',
  'CriticalThinkingSlideTemplate.tsx'
];

const TEMPLATES_DIR = path.join(__dirname, '../src/components/templates');

// Функция для добавления импорта стандартных стилей
function addStandardImport(content) {
  const importLine = "import { getStandardSlideStyles, getStandardTitleStyles, getStandardSubtitleStyles, getStandardContentStyles } from '@/styles/slideStandards';";
  
  // Проверяем, есть ли уже этот импорт
  if (content.includes('@/styles/slideStandards')) {
    return content;
  }
  
  // Находим последний импорт
  const importRegex = /^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm;
  const imports = content.match(importRegex);
  
  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertIndex = lastImportIndex + lastImport.length;
    
    return content.slice(0, insertIndex) + '\n' + importLine + content.slice(insertIndex);
  }
  
  // Если нет импортов, добавляем в начало
  return importLine + '\n' + content;
}

// Функция для обновления slideStyles
function updateSlideStyles(content) {
  const slideStylesRegex = /const\s+slideStyles:\s*React\.CSSProperties\s*=\s*\{[^}]*\};/gs;
  
  return content.replace(slideStylesRegex, (match) => {
    // Извлекаем существующие свойства
    const props = match.match(/(\w+):\s*([^,}]+)/g);
    const customProps = {};
    
    if (props) {
      props.forEach(prop => {
        const [key, value] = prop.split(':').map(s => s.trim());
        // Сохраняем только специфичные свойства
        if (!['width', 'height', 'minHeight', 'background', 'display', 'flexDirection', 'justifyContent', 'alignItems', 'padding', 'position', 'fontFamily'].includes(key)) {
          customProps[key] = value;
        }
      });
    }
    
    // Создаем новый slideStyles
    let newSlideStyles = `const slideStyles: React.CSSProperties = {
    ...getStandardSlideStyles(currentTheme)`;
    
    if (Object.keys(customProps).length > 0) {
      newSlideStyles += ',\n    ' + Object.entries(customProps).map(([key, value]) => `${key}: ${value}`).join(',\n    ');
    }
    
    newSlideStyles += '\n  };';
    
    return newSlideStyles;
  });
}

// Функция для обновления titleStyles
function updateTitleStyles(content) {
  const titleStylesRegex = /const\s+titleStyles:\s*React\.CSSProperties\s*=\s*\{[^}]*\};/gs;
  
  return content.replace(titleStylesRegex, (match) => {
    // Извлекаем существующие свойства
    const props = match.match(/(\w+):\s*([^,}]+)/g);
    const customProps = {};
    
    if (props) {
      props.forEach(prop => {
        const [key, value] = prop.split(':').map(s => s.trim());
        // Сохраняем только специфичные свойства
        if (!['fontSize', 'fontFamily', 'color', 'textAlign', 'marginBottom', 'lineHeight', 'maxWidth', 'wordWrap', 'fontWeight'].includes(key)) {
          customProps[key] = value;
        }
      });
    }
    
    // Создаем новый titleStyles
    let newTitleStyles = `const titleStyles: React.CSSProperties = {
    ...getStandardTitleStyles(currentTheme)`;
    
    if (Object.keys(customProps).length > 0) {
      newTitleStyles += ',\n    ' + Object.entries(customProps).map(([key, value]) => `${key}: ${value}`).join(',\n    ');
    }
    
    newTitleStyles += '\n  };';
    
    return newTitleStyles;
  });
}

// Функция для обновления subtitleStyles
function updateSubtitleStyles(content) {
  const subtitleStylesRegex = /const\s+subtitleStyles:\s*React\.CSSProperties\s*=\s*\{[^}]*\};/gs;
  
  return content.replace(subtitleStylesRegex, (match) => {
    // Извлекаем существующие свойства
    const props = match.match(/(\w+):\s*([^,}]+)/g);
    const customProps = {};
    
    if (props) {
      props.forEach(prop => {
        const [key, value] = prop.split(':').map(s => s.trim());
        // Сохраняем только специфичные свойства
        if (!['fontSize', 'fontFamily', 'color', 'textAlign', 'marginBottom', 'lineHeight', 'maxWidth', 'wordWrap', 'opacity'].includes(key)) {
          customProps[key] = value;
        }
      });
    }
    
    // Создаем новый subtitleStyles
    let newSubtitleStyles = `const subtitleStyles: React.CSSProperties = {
    ...getStandardSubtitleStyles(currentTheme)`;
    
    if (Object.keys(customProps).length > 0) {
      newSubtitleStyles += ',\n    ' + Object.entries(customProps).map(([key, value]) => `${key}: ${value}`).join(',\n    ');
    }
    
    newSubtitleStyles += '\n  };';
    
    return newSubtitleStyles;
  });
}

// Основная функция обновления
function updateTemplate(templateName) {
  const filePath = path.join(TEMPLATES_DIR, templateName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Файл ${templateName} не найден`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Добавляем импорт стандартных стилей
    content = addStandardImport(content);
    
    // Обновляем стили
    content = updateSlideStyles(content);
    content = updateTitleStyles(content);
    content = updateSubtitleStyles(content);
    
    // Сохраняем обновленный файл
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`✅ Обновлен ${templateName}`);
    return true;
  } catch (error) {
    console.log(`❌ Ошибка при обновлении ${templateName}:`, error.message);
    return false;
  }
}

// Запуск скрипта
function main() {
  console.log('🚀 Начинаем обновление шаблонов слайдов...\n');
  
  let successCount = 0;
  let totalCount = TEMPLATES_TO_UPDATE.length;
  
  TEMPLATES_TO_UPDATE.forEach(templateName => {
    if (updateTemplate(templateName)) {
      successCount++;
    }
  });
  
  console.log(`\n📊 Результаты обновления:`);
  console.log(`✅ Успешно обновлено: ${successCount}`);
  console.log(`❌ Ошибок: ${totalCount - successCount}`);
  console.log(`📈 Процент успеха: ${Math.round((successCount / totalCount) * 100)}%`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 Все шаблоны успешно обновлены!');
  } else {
    console.log('\n⚠️  Некоторые шаблоны не удалось обновить. Проверьте ошибки выше.');
  }
}

// Запускаем скрипт
if (require.main === module) {
  main();
}

module.exports = { updateTemplate, addStandardImport, updateSlideStyles, updateTitleStyles, updateSubtitleStyles };