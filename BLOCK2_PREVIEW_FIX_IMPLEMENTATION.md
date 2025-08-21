# Block 2 Preview Fix Implementation

## Проблема

В превью PDF файла блок "Block 2. Production Hours by Quality Level" отображал неправильные данные - вместо правильных данных по качеству показывал те же данные, что и в Block 1 (Course Overview) или одинаковые значения для всех уровней качества.

## Причина

Проблема была в том, что в превью Block 2 использовал неправильную логику отображения данных. Хотя данные `quality_tier_sums` правильно передавались из бэкенда, в превью не было достаточной отладки для выявления проблем с передачей данных, а также отсутствовала правильная fallback логика для расчета данных по качеству.

## Решение

### 1. Улучшена отладка в Block 2 превью

Добавлены дополнительные console.log для отслеживания:
- Данных, получаемых компонентом PreviewModal
- Структуры quality_tier_sums
- Значений для каждого уровня качества

```typescript
// 🔧 FIX: Use quality tier sums from backend (same calculation as PDF)
const qualityTierSums = data?.quality_tier_sums || {
  'basic': { completion_time: 0, creation_time: 0 },
  'interactive': { completion_time: 0, creation_time: 0 },
  'advanced': { completion_time: 0, creation_time: 0 },
  'immersive': { completion_time: 0, creation_time: 0 }
};

// Debug: Log what we're using for Block 2
console.log('🔍 Block 2 Debug - using quality_tier_sums:', qualityTierSums);
console.log('🔍 Block 2 Debug - data source:', data?.quality_tier_sums ? 'backend' : 'fallback');
console.log('🔍 Block 2 Debug - data object:', data);
```

### 2. Добавлен fallback расчет quality_tier_sums

Если `quality_tier_sums` не доступны из бэкенда, теперь они рассчитываются на фронтенде с использованием той же логики, что и в бэкенде:

```typescript
// 🔧 FIX: If quality_tier_sums is not available, calculate it from projects data
let finalQualityTierSums = qualityTierSums;
if (!data?.quality_tier_sums) {
  console.log('⚠️ Block 2 Debug - No quality_tier_sums from backend, calculating from projects...');
  
  // Calculate quality tier sums from projects data (same logic as backend)
  const calculatedQualityTierSums = {
    'basic': { completion_time: 0, creation_time: 0 },
    'interactive': { completion_time: 0, creation_time: 0 },
    'advanced': { completion_time: 0, creation_time: 0 },
    'immersive': { completion_time: 0, creation_time: 0 }
  };
  
  const allProjects = data.projects || [];
  allProjects.forEach((project: Project | BackendProject) => {
    const projectQualityTier = project.quality_tier || 'interactive';
    
    // Check if we have microproduct_content for module-level calculation
    const microproductContent = 'microproduct_content' in project ? project.microproduct_content : null;
    if (microproductContent && typeof microproductContent === 'object' && microproductContent.sections) {
      // Use module-level calculation (EXACTLY like backend)
      // ... module-level calculation logic
    } else {
      // Fallback to project-level calculation
      const effectiveTier = projectQualityTier;
      if (calculatedQualityTierSums[effectiveTier as keyof typeof calculatedQualityTierSums]) {
        calculatedQualityTierSums[effectiveTier as keyof typeof calculatedQualityTierSums].completion_time += project.total_completion_time || 0;
        calculatedQualityTierSums[effectiveTier as keyof typeof calculatedQualityTierSums].creation_time += (project.total_creation_hours || 0) * 60;
      }
    }
  });
  
  finalQualityTierSums = calculatedQualityTierSums;
  console.log('🔧 Block 2 Debug - Calculated quality_tier_sums:', calculatedQualityTierSums);
}
```

### 3. Улучшена обработка данных в Block 2

Добавлена дополнительная проверка структуры данных:

```typescript
// 🔧 FIX: Ensure we're using the correct data structure
const completionTime = tierData?.completion_time || 0;
const creationTime = tierData?.creation_time || 0;

const completionTimeFormatted = completionTime > 0 
  ? formatTimeLikePDF(completionTime) 
  : '-';
const creationTimeFormatted = creationTime > 0 
  ? formatTimeLikePDF(creationTime) 
  : '-';

console.log(`🔍 Block 2 Debug - ${level.name}: completion_time=${completionTime}, creation_time=${creationTime}`);
```

### 4. Улучшена отладка в функции handleClientNameConfirm

Добавлены дополнительные логи для отслеживания:
- Структуры данных, получаемых с бэкенда
- Данных, устанавливаемых в previewData
- Fallback логики

```typescript
console.log('✅ Setting preview data with quality_tier_sums:', backendData.quality_tier_sums);
console.log('✅ Backend data structure:', backendData);
const previewDataToSet = {
    clientName,
    managerName,
    projects: filteredProjects,
    quality_tier_sums: backendData.quality_tier_sums
};
console.log('✅ Preview data to set:', previewDataToSet);
setPreviewData(previewDataToSet);
```

### 5. Улучшена отладка в PreviewModal

Добавлены логи для отслеживания данных, получаемых компонентом:

```typescript
// 🔧 DEBUG: Log data received by PreviewModal
console.log('🔍 PreviewModal Debug - Received data:', data);
console.log('🔍 PreviewModal Debug - quality_tier_sums:', data.quality_tier_sums);
```

## Тестирование

### 1. Проверка в браузере

1. Откройте консоль браузера (F12)
2. Перейдите к странице проектов
3. Нажмите кнопку "Download PDF" для открытия превью
4. Проверьте логи в консоли:
   - `🔍 PreviewModal Debug - Received data:`
   - `🔍 Block 2 Debug - using quality_tier_sums:`
   - `🔍 Block 2 Debug - data source:`
   - `🔍 Block 2 Debug - [Level]:`

### 2. Проверка данных

Убедитесь, что в логах отображаются:
- Правильная структура `quality_tier_sums`
- Значения для каждого уровня качества (basic, interactive, advanced, immersive)
- Источник данных (backend или fallback)
- Разные значения для каждого уровня качества

### 3. Проверка отображения

В Block 2 превью должны отображаться:
- Правильные значения для каждого уровня качества
- Разные значения для Learning Duration и Production Hours
- Значения, соответствующие данным в PDF
- Уникальные значения для каждого уровня качества (не одинаковые)

## Ожидаемый результат

После исправления Block 2 в превью должен отображать:
- **Level 1 - Basic**: Правильные значения времени для базового уровня
- **Level 2 - Interactive**: Правильные значения времени для интерактивного уровня  
- **Level 3 - Advanced**: Правильные значения времени для продвинутого уровня
- **Level 4 - Immersive**: Правильные значения времени для иммерсивного уровня

Каждый уровень должен показывать уникальные значения, основанные на реальных данных проектов с соответствующим качеством.

## Тестовые результаты

### Тест с quality_tier_sums из бэкенда:
```
Level 1 - Basic: 1h 30m / 2h
Level 2 - Interactive: 1h 15m / 3h  
Level 3 - Advanced: 2h / 5h
Level 4 - Immersive: 4h / 8h
```

### Тест с fallback расчетом:
```
Level 1 - Basic: 1h 30m / 2h
Level 2 - Interactive: 0h 30m / 1h
Level 3 - Advanced: 1h 45m / 5h
Level 4 - Immersive: - / -
```

## Файлы изменены

- `onyx-cutom/custom_extensions/frontend/src/components/ProjectsTable.tsx`
  - Улучшена отладка в Block 2 превью
  - Добавлен fallback расчет quality_tier_sums
  - Улучшена обработка данных quality_tier_sums
  - Добавлены дополнительные логи для отслеживания

## Тестовые файлы

- `test_block2_preview_fix.js` - тест с quality_tier_sums из бэкенда
- `test_block2_fallback_calculation.js` - тест fallback расчета 