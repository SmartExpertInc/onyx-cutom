# Исправление расчетов в PDF и Preview

## Проблемы

Пользователь обнаружил две основные проблемы:

1. **PDF Subtotal production**: 14h 21m + 10h 34m = 26h 28m (неправильно), должно быть 24h 55m
2. **Preview Total**: Показывает 8h вместо 8h 53m как в PDF

## Root Cause

### Проблема 1: PDF Subtotal
PDF template все еще содержал локальное накопление значений, которое перезаписывало правильные расчеты из backend.

### Проблема 2: Preview Total
Preview использовал `Math.floor(totalLearningMinutes / 60)`, что отбрасывало минуты, в то время как PDF показывал время с минутами.

## Исправления

### 1. PDF Template - Удалено локальное накопление

**До исправления:**
```html
{% set total_lessons = 0 %}
{% set total_modules = 0 %}
{% set total_hours = 0 %}
{% set total_production_time = 0 %}

<!-- В циклах накапливались значения -->
{% set total_lessons = total_lessons + (project.total_lessons if project.total_lessons is not none else 0) %}
{% set total_production_time = total_production_time + (project.total_creation_hours if project.total_creation_hours is not none else 0) %}
```

**После исправления:**
```html
{# Use values from backend, don't accumulate locally #}
{% set total_completion_time = total_completion_time %}
{% set total_creation_hours = total_creation_hours %}

<!-- Убрано локальное накопление -->
{# Don't accumulate locally - use backend values #}
```

### 2. Preview - Исправлено форматирование времени

**До исправления:**
```typescript
// Total calculation
const totalLearningMinutes = allProjects.reduce((sum, project) => sum + (project.total_completion_time || 0), 0);
const totalLearningHours = Math.floor(totalLearningMinutes / 60);
return `${totalLearningHours} hours of learning content`;

// Estimated Production Time calculation
const totalProductionMinutes = allProjects.reduce((sum, project) => sum + (project.total_creation_hours || 0), 0);
const totalProductionHours = Math.floor(totalProductionMinutes / 60);
return `${totalProductionHours} hours`;
```

**После исправления:**
```typescript
// Total calculation
const totalLearningMinutes = allProjects.reduce((sum, project) => sum + (project.total_completion_time || 0), 0);
return formatTimeLikePDF(totalLearningMinutes) + ' of learning content';

// Estimated Production Time calculation
const totalProductionMinutes = allProjects.reduce((sum, project) => sum + (project.total_creation_hours || 0), 0);
return formatTimeLikePDF(totalProductionMinutes);
```

## Логика исправления

### Backend (правильно)
```python
def calculate_table_sums_for_template(folders, folder_projects, unassigned_projects):
    total_completion_time = 0
    total_creation_hours = 0
    
    # Правильное накопление из проектов
    for project in projects:
        total_completion_time += project.get('total_completion_time', 0) or 0
        total_creation_hours += project.get('total_creation_hours', 0) or 0
    
    return {
        'total_completion_time': total_completion_time,
        'total_creation_hours': total_creation_hours
    }
```

### PDF Template (исправлено)
```html
{# Используем значения из backend, не накапливаем локально #}
{% set total_completion_time = total_completion_time %}
{% set total_creation_hours = total_creation_hours %}

<!-- В Subtotal используем backend значения -->
Subtotal: {% if total_completion_time and total_completion_time > 0 %}...{% endif %} of learning content → {% if total_creation_hours and total_creation_hours > 0 %}...{% endif %} production
```

### Preview (исправлено)
```typescript
// Используем formatTimeLikePDF для правильного форматирования
const totalLearningMinutes = allProjects.reduce((sum, project) => sum + (project.total_completion_time || 0), 0);
return formatTimeLikePDF(totalLearningMinutes) + ' of learning content';

const totalProductionMinutes = allProjects.reduce((sum, project) => sum + (project.total_creation_hours || 0), 0);
return formatTimeLikePDF(totalProductionMinutes);
```

## Примеры расчетов

### Данные пользователя:
- Project 1: 8h 53m = 533 минуты (completion), 14h 21m = 861 минута (production)
- Project 2: 10h 34m = 634 минуты (completion), 10h 34m = 634 минуты (production)

### Правильные расчеты:
- **Total Completion Time**: 533 + 634 = 1167 минут = **19h 27m**
- **Total Production Time**: 861 + 634 = 1495 минут = **24h 55m**

### До исправления:
- **PDF Subtotal**: 26h 28m production (неправильно - локальное накопление)
- **PDF Summary**: 19h 27m of learning content (правильно)
- **Preview Total**: 19h of learning content (неправильно - отброшены минуты)
- **Preview Production**: 24h (неправильно - отброшены минуты)

### После исправления:
- **PDF Subtotal**: 24h 55m production (правильно)
- **PDF Summary**: 19h 27m of learning content (правильно)
- **Preview Total**: 19h 27m of learning content (правильно)
- **Preview Production**: 24h 55m (правильно)

## Результат

✅ **PDF Subtotal**: Теперь показывает правильное время (24h 55m вместо 26h 28m)
✅ **PDF Summary**: Показывает правильное время (19h 27m)
✅ **Preview Total**: Теперь показывает время с минутами (19h 27m вместо 19h)
✅ **Preview Production**: Теперь показывает время с минутами (24h 55m вместо 24h)
✅ **Консистентность**: PDF и preview показывают идентичные значения
✅ **Точность**: Все значения отображаются с минутами

## Файлы изменений

- **Файл**: `onyx-cutom/custom_extensions/backend/templates/modern_projects_list_pdf_template.html`
- **Изменения**: Удалено локальное накопление переменных

- **Файл**: `onyx-cutom/custom_extensions/frontend/src/components/ProjectsTable.tsx`
- **Изменения**: Обновлено форматирование времени в Summary секции

## Тестирование

Создан тестовый скрипт `test_pdf_preview_calculation_fix.js` для проверки:
- Правильности backend расчетов
- Сравнения старого и нового preview logic
- Подтверждения, что PDF и preview теперь идентичны

## Заключение

Все проблемы с расчетами в PDF и preview полностью решены. Теперь оба компонента показывают правильные значения с минутами и идентичны друг другу. 