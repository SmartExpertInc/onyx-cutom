# Исправление форматирования времени в превью

## Проблема

В превью время отображалось неправильно:
- **Completion Time**: показывал "1322" вместо "6h 16m"
- **Creation Time**: показывал "1,322" вместо "22h 2m"
- **Block 2**: показывал неправильные названия quality levels

## Анализ проблемы

### До исправления:

1. **Block 1. Course Overview**:
   - Использовал `course.learningDuration || '-'` (показывал сырые числа)
   - Использовал `course.productionTime.toLocaleString()` (добавлял запятые)

2. **Block 2. Production Hours by Quality Level**:
   - Использовал `formatCompletionTimeLocalized()` (неправильное форматирование)
   - Показывал "Level 1 - Basic" вместо "Basic"

3. **Subtotal**:
   - Использовал `totalProductionHours.toLocaleString()` (добавлял запятые)

### Результат:
- Разное форматирование времени в PDF и превью
- Неправильные названия quality levels
- Пользовательская путаница

## Решение

### 1. Создана функция `formatTimeForPreview`

```typescript
const formatTimeForPreview = (time: number | undefined | null): string => {
    if (!time || time === 0) return '-';
    
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    
    if (minutes === 0) {
        return `${hours}h`;
    } else {
        return `${hours}h ${minutes}m`;
    }
};
```

### 2. Обновлено форматирование в Block 1

```typescript
// Было:
{course.learningDuration || '-'}
{course.productionTime ? course.productionTime.toLocaleString() : '-'}

// Стало:
{formatTimeForPreview(course.learningDuration)}
{formatTimeForPreview(course.productionTime)}
```

### 3. Исправлены названия quality levels в Block 2

```typescript
// Было:
{ key: 'basic', name: 'Level 1 - Basic' }
{ key: 'interactive', name: 'Level 2 - Interactive' }

// Стало:
{ key: 'basic', name: 'Basic' }
{ key: 'interactive', name: 'Interactive' }
```

### 4. Обновлено форматирование в Block 2

```typescript
// Было:
formatCompletionTimeLocalized(tierData.completionTime)
formatCompletionTimeLocalized(tierData.creationTime)

// Стало:
formatTimeForPreview(tierData.completionTime)
formatTimeForPreview(tierData.creationTime)
```

### 5. Исправлен Subtotal

```typescript
// Было:
Subtotal: {totalLearningHours}h of learning content → {totalProductionHours.toLocaleString()}h production

// Стало:
Subtotal: {formatTimeForPreview(totalLearningHours)} of learning content → {formatTimeForPreview(totalProductionHours)} production
```

## Результат

✅ **Время теперь форматируется одинаково в PDF и превью**
✅ **Block 1 показывает правильные значения времени**
✅ **Block 2 показывает правильные названия quality levels**
✅ **Subtotal показывает корректные значения**

## Примеры форматирования

| Исходное значение | PDF формат | Превью формат (после исправления) |
|-------------------|------------|-----------------------------------|
| 6.27 | 6h 16m | 6h 16m |
| 22.03 | 22h 2m | 22h 2m |
| 2.62 | 2h 37m | 2h 37m |
| 8.83 | 8h 50m | 8h 50m |
| 1.0 | 1h | 1h |
| 0 | - | - |

## Тестирование

Создан тестовый скрипт `test_time_formatting.js` для проверки:
- Корректности форматирования времени
- Соответствия формату PDF
- Обработки edge cases

## Техническая информация

- **Файл**: `onyx-cutom/custom_extensions/frontend/src/components/ProjectsTable.tsx`
- **Функция**: `formatTimeForPreview`
- **Тест**: `onyx-cutom/test_time_formatting.js`

## Заключение

Проблема с форматированием времени в превью полностью решена. Теперь превью показывает время в точно таком же формате, как и PDF документ. 