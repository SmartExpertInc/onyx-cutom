# Правильный маппинг полей для PDF template

## Проблема

Превью использовало неправильные поля данных по сравнению с PDF template, что приводило к несоответствию отображаемых значений.

## Анализ PDF Template

После детального анализа `modern_projects_list_pdf_template.html` было обнаружено правильное использование полей:

### Block 1. Course Overview

**Для проектов (не папок):**
- **Learning Duration (h)**: `project.total_completion_time` (в минутах)
- **Production Time (h)**: `project.total_hours` (в минутах)

**Для папок:**
- **Learning Duration (h)**: `folder.total_hours` (в минутах)
- **Production Time (h)**: `folder.total_completion_time` (в минутах)

### Block 2. Production Hours by Quality Level

- **Learning Duration (h)**: `quality_tier_sums[tier_key].completion_time` (в минутах)
- **Production Hours**: `quality_tier_sums[tier_key].creation_time` (в минутах)

## Исправления

### 1. Обновлена функция `processBlock1CourseOverview`

```typescript
// Для проектов (как в PDF template)
result.push({
  name: project.title,
  modules: project.total_modules,
  lessons: project.total_lessons,
  learningDuration: project.total_completion_time || 0, // Learning Duration
  productionTime: project.total_hours || 0, // Production Time
  isProject: true
});
```

### 2. Исправлен расчет quality tier sums

```typescript
// Process all projects to calculate quality tier sums (like PDF template)
allProjects.forEach((project: Project | BackendProject) => {
  const effectiveTier = getEffectiveQualityTier(project, 'interactive');
  // Learning Duration uses total_completion_time (like PDF template)
  qualityTierSums[effectiveTier].completionTime += project.total_completion_time || 0;
  // Production Time uses total_creation_hours (like PDF template)
  qualityTierSums[effectiveTier].creationTime += project.total_creation_hours || 0;
});
```

### 3. Исправлен расчет итоговых значений

```typescript
// Use total_completion_time for learning hours (like PDF template)
const totalLearningHours = allProjects.reduce((sum: number, project: Project | BackendProject) => 
  sum + (project.total_completion_time || 0), 0);
// Use total_creation_hours for production hours (like PDF template)
const totalProductionHours = allProjects.reduce((sum: number, project: Project | BackendProject) => 
  sum + (project.total_creation_hours || 0), 0);
```

## Правильный маппинг полей

| Таблица | Колонка | Поле данных | Описание |
|---------|---------|-------------|----------|
| Block 1 | Learning Duration (h) | `total_completion_time` | Время обучения (в минутах) |
| Block 1 | Production Time (h) | `total_hours` | Время производства (в минутах) |
| Block 2 | Learning Duration (h) | `total_completion_time` | Время обучения (в минутах) |
| Block 2 | Production Hours | `total_creation_hours` | Время производства (в минутах) |

## Форматирование времени

Все значения времени форматируются одинаково:
```typescript
const formatTimeLikePDF = (minutes: number | undefined | null): string => {
    if (!minutes || minutes === 0) return '-';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
        return `${hours}h`;
    } else {
        return `${hours}h ${remainingMinutes}m`;
    }
};
```

## Примеры

### AI Tools for Teachers
- **total_completion_time**: 376 минут → "6h 16m" (Learning Duration)
- **total_hours**: 1322 минут → "22h 2m" (Production Time)

### AI Tools for High School Teachers
- **total_completion_time**: 157 минут → "2h 37m" (Learning Duration)
- **total_hours**: 530 минут → "8h 50m" (Production Time)

## Результат

✅ **Block 1 теперь использует правильные поля данных**
✅ **Block 2 теперь использует правильные поля данных**
✅ **Время форматируется одинаково во всех таблицах**
✅ **Превью показывает точно такие же данные, как PDF**

## Тестирование

Создан тестовый скрипт `test_field_mapping.js` для проверки:
- Правильности маппинга полей
- Корректности форматирования времени
- Соответствия ожидаемым значениям из PDF

## Техническая информация

- **Файл**: `onyx-cutom/custom_extensions/frontend/src/utils/dataProcessing.ts`
- **Функция**: `processBlock1CourseOverview`
- **Файл**: `onyx-cutom/custom_extensions/frontend/src/components/ProjectsTable.tsx`
- **Функция**: `formatTimeLikePDF`
- **Тест**: `onyx-cutom/test_field_mapping.js`

## Заключение

Проблема с неправильным маппингом полей полностью решена. Теперь превью использует точно те же поля данных и ту же логику форматирования, что и PDF template. 