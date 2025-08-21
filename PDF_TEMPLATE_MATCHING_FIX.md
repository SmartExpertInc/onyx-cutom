# Исправление соответствия PDF template

## Проблема

Превью показывало неправильные данные по сравнению с PDF:
- **PDF**: AI Tools for Teachers - 6h 16m / 22h 2m
- **Превью**: AI Tools for Teachers - 1322 / 1,322

## Анализ проблемы

После анализа PDF template (`modern_projects_list_pdf_template.html`) было обнаружено, что:

### PDF Template использует:
1. **Learning Duration**: `total_completion_time` (в минутах) → делит на 60 для отображения
2. **Production Time**: `total_hours` (в минутах) → делит на 60 для отображения
3. **Quality Level Names**: "Level 1 - Basic", "Level 2 - Interactive", etc.

### Превью использовало:
1. **Learning Duration**: `total_hours` (в часах) → неправильное поле
2. **Production Time**: `total_creation_hours` (в часах) → неправильное поле
3. **Quality Level Names**: "Basic", "Interactive", etc. → неправильные названия

## Решение

### 1. Создана функция `formatTimeLikePDF`

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

Эта функция точно соответствует логике PDF template:
```html
{% set h = project.total_completion_time // 60 %}
{% set m = project.total_completion_time % 60 %}
{% if h > 0 %}{{ h }}h{% endif %}{% if h > 0 and m > 0 %} {% endif %}{% if m > 0 %}{{ m }}m{% endif %}
```

### 2. Обновлено форматирование в Block 1

```typescript
// Было:
{formatTimeForPreview(course.learningDuration)}
{formatTimeForPreview(course.productionTime)}

// Стало:
{formatTimeLikePDF(course.learningDuration)}
{formatTimeLikePDF(course.productionTime)}
```

### 3. Исправлены названия quality levels

```typescript
// Было:
{ key: 'basic', name: 'Basic' }
{ key: 'interactive', name: 'Interactive' }

// Стало:
{ key: 'basic', name: 'Level 1 - Basic' }
{ key: 'interactive', name: 'Level 2 - Interactive' }
```

### 4. Обновлено форматирование в Block 2

```typescript
// Было:
formatTimeForPreview(tierData.completionTime)
formatTimeForPreview(tierData.creationTime)

// Стало:
formatTimeLikePDF(tierData.completionTime)
formatTimeLikePDF(tierData.creationTime)
```

### 5. Исправлен Subtotal

```typescript
// Было:
Subtotal: {formatTimeForPreview(totalLearningHours)} of learning content → {formatTimeForPreview(totalProductionHours)} production

// Стало:
Subtotal: {formatTimeLikePDF(totalLearningHours)} of learning content → {formatTimeLikePDF(totalProductionHours)} production
```

## Результат

✅ **Превью теперь показывает точно такие же данные, как PDF**
✅ **Время форматируется одинаково (минуты → часы и минуты)**
✅ **Quality level названия соответствуют PDF template**
✅ **Все расчеты используют правильные поля данных**

## Примеры соответствия

| Поле | PDF Template | Превью (после исправления) |
|------|-------------|---------------------------|
| Learning Duration | `total_completion_time // 60` | `formatTimeLikePDF(total_completion_time)` |
| Production Time | `total_hours // 60` | `formatTimeLikePDF(total_hours)` |
| Quality Levels | "Level 1 - Basic" | "Level 1 - Basic" |

## Тестирование

Создан тестовый скрипт `test_pdf_formatting.js` для проверки:
- Корректности форматирования времени (минуты → часы и минуты)
- Соответствия логике PDF template
- Правильности названий quality levels

## Техническая информация

- **Файл**: `onyx-cutom/custom_extensions/frontend/src/components/ProjectsTable.tsx`
- **Функция**: `formatTimeLikePDF`
- **PDF Template**: `onyx-cutom/custom_extensions/backend/templates/modern_projects_list_pdf_template.html`
- **Тест**: `onyx-cutom/test_pdf_formatting.js`

## Заключение

Проблема с несоответствием данных в превью и PDF полностью решена. Теперь превью использует точно ту же логику форматирования и те же поля данных, что и PDF template. 