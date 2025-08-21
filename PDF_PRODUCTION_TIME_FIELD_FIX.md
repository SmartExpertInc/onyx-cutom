# Исправление полей для Production Time в PDF

## Проблема

Пользователь сообщил, что в PDF неправильно суммируется Production Time:
- **Subtotal production**: Неправильно суммируется
- **Estimated Production Time**: Неправильно рассчитывается
- **Block 2 Production Hours**: Неправильно отображается

## Root Cause

Проблема была в том, что PDF template использовал неправильные поля для Production Time:

```html
<!-- Неправильно - использовал total_hours для Production Time -->
{% if project.total_hours and project.total_hours > 0 %}
    {% set h = project.total_hours // 60 %}
    {% set m = project.total_hours % 60 %}
    ...
{% endif %}
```

**Правильное назначение полей:**
- `total_completion_time` = Learning Duration (время обучения)
- `total_creation_hours` = Production Time (время производства)
- `total_hours` = Learning Duration (дублирует total_completion_time)

PDF template смешивал эти поля, используя `total_hours` для Production Time вместо `total_creation_hours`.

## Исправления

### 1. Исправлены все места в PDF template

**До исправления:**
```html
<!-- Строка 395 - основной проект -->
{% if project.total_hours and project.total_hours > 0 %}
    {% set h = project.total_hours // 60 %}
    {% set m = project.total_hours % 60 %}
    ...
{% endif %}

<!-- Строка 316 - проект в папке -->
{% if project.total_hours and project.total_hours > 0 %}
    {% set h = project.total_hours // 60 %}
    {% set m = project.total_hours % 60 %}
    ...
{% endif %}

<!-- Строка 365 - проект в подпапке -->
{% if project.total_hours and project.total_hours > 0 %}
    {% set h = project.total_hours // 60 %}
    {% set m = project.total_hours % 60 %}
    ...
{% endif %}
```

**После исправления:**
```html
<!-- Строка 395 - основной проект -->
{% if project.total_creation_hours and project.total_creation_hours > 0 %}
    {% set h = project.total_creation_hours // 60 %}
    {% set m = project.total_creation_hours % 60 %}
    ...
{% endif %}

<!-- Строка 316 - проект в папке -->
{% if project.total_creation_hours and project.total_creation_hours > 0 %}
    {% set h = project.total_creation_hours // 60 %}
    {% set m = project.total_creation_hours % 60 %}
    ...
{% endif %}

<!-- Строка 365 - проект в подпапке -->
{% if project.total_creation_hours and project.total_creation_hours > 0 %}
    {% set h = project.total_creation_hours // 60 %}
    {% set m = project.total_creation_hours % 60 %}
    ...
{% endif %}
```

## Логика исправления

### Правильное назначение полей

```python
# Backend data structure
project = {
    'total_completion_time': 533,  # Learning Duration (8h 53m)
    'total_creation_hours': 861,   # Production Time (14h 21m)
    'total_hours': 533,            # Learning Duration (дублирует total_completion_time)
}
```

### Preview (правильно)
```typescript
// Learning Duration
const totalLearningMinutes = allProjects.reduce((sum, project) => sum + (project.total_completion_time || 0), 0);

// Production Time
const totalProductionMinutes = allProjects.reduce((sum, project) => sum + (project.total_creation_hours || 0), 0);
```

### PDF Template (исправлено)
```html
<!-- Learning Duration -->
{% if project.total_completion_time and project.total_completion_time > 0 %}
    {% set h = project.total_completion_time // 60 %}
    {% set m = project.total_completion_time % 60 %}
    ...
{% endif %}

<!-- Production Time -->
{% if project.total_creation_hours and project.total_creation_hours > 0 %}
    {% set h = project.total_creation_hours // 60 %}
    {% set m = project.total_creation_hours % 60 %}
    ...
{% endif %}
```

## Примеры расчетов

### Данные пользователя:
- Project 1: 8h 53m = 533 минуты (learning), 14h 21m = 861 минута (production)
- Project 2: 10h 34m = 634 минуты (learning), 10h 34m = 634 минуты (production)

### Правильные расчеты:
- **Learning Duration**: 533 + 634 = 1167 минут = **19h 27m**
- **Production Time**: 861 + 634 = 1495 минут = **24h 55m**

### До исправления:
- **PDF Production Time**: 533 + 634 = 1167 минут = **19h 27m** (неправильно - использовал learning time)
- **Preview Production Time**: 861 + 634 = 1495 минут = **24h 55m** (правильно)

### После исправления:
- **PDF Production Time**: 861 + 634 = 1495 минут = **24h 55m** (правильно)
- **Preview Production Time**: 861 + 634 = 1495 минут = **24h 55m** (правильно)

## Результат

✅ **PDF Subtotal**: Теперь показывает правильное production time (24h 55m)
✅ **PDF Summary**: Теперь показывает правильный Estimated Production Time (24h 55m)
✅ **Block 2**: Теперь показывает правильные Production Hours (24h 55m)
✅ **Консистентность**: PDF и preview показывают идентичные значения
✅ **Правильное назначение полей**: total_creation_hours используется для Production Time

## Файлы изменений

- **Файл**: `onyx-cutom/custom_extensions/backend/templates/modern_projects_list_pdf_template.html`
- **Строки**: 395, 316, 365
- **Изменения**: Заменены все `project.total_hours` на `project.total_creation_hours` для Production Time

## Тестирование

Создан тестовый скрипт `test_pdf_production_time_fix.js` для проверки:
- Правильности назначения полей
- Сравнения старого и нового PDF logic
- Подтверждения, что PDF и preview теперь используют одинаковые поля

## Заключение

Проблема с неправильным назначением полей в PDF полностью решена. Теперь PDF использует правильные поля:
- `total_completion_time` для Learning Duration
- `total_creation_hours` для Production Time

Это обеспечивает идентичность расчетов между PDF и preview. 