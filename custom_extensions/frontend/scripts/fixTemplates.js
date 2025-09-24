#!/usr/bin/env node

/**
 * Скрипт для исправления некорректных обновлений в шаблонах слайдов
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '../src/components/templates');

// Функция для исправления некорректных стилей
function fixTemplateStyles(content) {
  // Исправляем некорректные slideStyles
  content = content.replace(
    /const\s+slideStyles:\s*React\.CSSProperties\s*=\s*\{\s*\.\.\.getStandardSlideStyles\(currentTheme\),\s*slideStyles:\s*React\.CSSProperties\s*=\s*\{[^}]*\}\s*\};/gs,
    'const slideStyles: React.CSSProperties = {\n    ...getStandardSlideStyles(currentTheme)\n  };'
  );
  
  // Исправляем некорректные titleStyles
  content = content.replace(
    /const\s+titleStyles:\s*React\.CSSProperties\s*=\s*\{\s*\.\.\.getStandardTitleStyles\(currentTheme\),\s*titleStyles:\s*React\.CSSProperties\s*=\s*\{[^}]*\}\s*\};/gs,
    'const titleStyles: React.CSSProperties = {\n    ...getStandardTitleStyles(currentTheme)\n  };'
  );
  
  // Исправляем некорректные subtitleStyles
  content = content.replace(
    /const\s+subtitleStyles:\s*React\.CSSProperties\s*=\s*\{\s*\.\.\.getStandardSubtitleStyles\(currentTheme\),\s*subtitleStyles:\s*React\.CSSProperties\s*=\s*\{[^}]*\}\s*\};/gs,
    'const subtitleStyles: React.CSSProperties = {\n    ...getStandardSubtitleStyles(currentTheme)\n  };'
  );
  
  return content;
}

// Функция для обновления одного шаблона
function fixTemplate(templateName) {
  const filePath = path.join(TEMPLATES_DIR, templateName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Файл ${templateName} не найден`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Исправляем некорректные стили
    content = fixTemplateStyles(content);
    
    // Сохраняем исправленный файл
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`✅ Исправлен ${templateName}`);
    return true;
  } catch (error) {
    console.log(`❌ Ошибка при исправлении ${templateName}:`, error.message);
    return false;
  }
}

// Список всех шаблонов для исправления
const TEMPLATES_TO_FIX = [
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

// Основная функция
function main() {
  console.log('🔧 Начинаем исправление шаблонов слайдов...\n');
  
  let successCount = 0;
  let totalCount = TEMPLATES_TO_FIX.length;
  
  TEMPLATES_TO_FIX.forEach(templateName => {
    if (fixTemplate(templateName)) {
      successCount++;
    }
  });
  
  console.log(`\n📊 Результаты исправления:`);
  console.log(`✅ Успешно исправлено: ${successCount}`);
  console.log(`❌ Ошибок: ${totalCount - successCount}`);
  console.log(`📈 Процент успеха: ${Math.round((successCount / totalCount) * 100)}%`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 Все шаблоны успешно исправлены!');
  } else {
    console.log('\n⚠️  Некоторые шаблоны не удалось исправить. Проверьте ошибки выше.');
  }
}

// Запускаем скрипт
if (require.main === module) {
  main();
}

module.exports = { fixTemplate, fixTemplateStyles };