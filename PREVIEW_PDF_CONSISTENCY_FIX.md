# Preview and PDF Consistency Fix

## Проблема

Данные в превью и PDF не совпадали. В превью показывались правильные значения, а в PDF - неправильные. Это происходило из-за того, что API endpoint для превью использовал другую логику расчета данных, чем PDF generation.

## Причина

**Разная логика расчета в API endpoint и PDF generation**:

1. **API endpoint для превью** (`/api/custom/projects`):
   - Использовал неопределенную функцию `get_custom_rate_for_tier`
   - Неправильно рассчитывал `total_creation_hours` из `total_hours`
   - Использовал старую логику расчета

2. **PDF generation** (`/api/custom/pdf/projects-list`):
   - Использовал правильную функцию `calculate_lesson_creation_hours_with_module_fallback`
   - Правильно рассчитывал `total_creation_hours` с учетом quality tier
   - Использовал новую логику расчета

## Исправления

### 1. Исправлен API endpoint для превью

**Проблема**: API endpoint использовал неправильную логику расчета.

**Исправление**: API endpoint теперь использует ту же логику, что и PDF generation:

```python
# Было:
if lesson.get('hours'):
    try:
        lesson_creation_hours = float(lesson['hours'])
        total_hours += lesson_creation_hours
    except (ValueError, TypeError):
        custom_rate = get_custom_rate_for_tier(quality_tier)  # ❌ Неопределенная функция
        lesson_creation_hours = calculate_creation_hours(completion_time_minutes, custom_rate)
        total_hours += lesson_creation_hours

# Стало:
lesson_creation_hours = calculate_lesson_creation_hours_with_module_fallback(
    lesson, section, get_tier_ratio(quality_tier)  # ✅ Правильная функция
)
total_creation_hours += lesson_creation_hours
```

### 2. Исправлен расчет `total_creation_hours`

**Проблема**: `total_creation_hours` рассчитывался из `total_hours`.

**Исправление**: `total_creation_hours` теперь рассчитывается правильно:

```python
# Было:
total_creation_hours = round(total_hours)  # ❌ Неправильно

# Стало:
# total_creation_hours is already calculated correctly above  # ✅ Правильно
```

## Правильная логика расчета

### Production Time рассчитывается по quality tier:

- **Basic**: 20x (20 часов на 1 час обучения)
- **Interactive**: 25x (25 часов на 1 час обучения)
- **Advanced**: 40x (40 часов на 1 час обучения)
- **Immersive**: 80x (80 часов на 1 час обучения)

### Функция `calculate_lesson_creation_hours_with_module_fallback`:

```python
def calculate_lesson_creation_hours_with_module_fallback(lesson: dict, section: dict, project_custom_rate: int) -> int:
    """Calculate creation hours for a lesson with module-level fallback"""
    completion_time_str = lesson.get('completionTime', '')
    if not completion_time_str:
        return 0
    
    try:
        completion_time_minutes = int(completion_time_str.replace('m', ''))
        
        # Check lesson-level tier first, then module-level, then project-level
        if lesson.get('custom_rate'):
            effective_custom_rate = lesson['custom_rate']
        elif section.get('custom_rate'):
            effective_custom_rate = section['custom_rate']
        else:
            effective_custom_rate = project_custom_rate
            
        return calculate_creation_hours(completion_time_minutes, effective_custom_rate)
    except (ValueError, AttributeError):
        return 0
```

## Результат

После исправлений:

- ✅ **API endpoint для превью**: Использует правильную логику расчета
- ✅ **PDF generation**: Использует ту же логику расчета
- ✅ **Данные проектов**: Идентичны между превью и PDF
- ✅ **Block 1**: Показывает правильные значения в обоих местах
- ✅ **Subtotal и Summary**: Показывают правильные значения в обоих местах

## Файлы, которые были изменены:

1. `onyx-cutom/custom_extensions/backend/main.py`
   - Исправлен API endpoint `/api/custom/projects`
   - Использована функция `calculate_lesson_creation_hours_with_module_fallback`
   - Использована функция `get_tier_ratio` вместо неопределенной `get_custom_rate_for_tier`
   - Исправлен расчет `total_creation_hours`

## Тестирование

Создан тестовый файл `test_preview_pdf_consistency_fix.py` для проверки:
- Идентичности логики расчета между превью и PDF
- Правильности расчета Production Time
- Соответствия всех значений

## Проверка

После применения исправлений:
1. Откройте превью проектов
2. Загрузите PDF документ
3. Сравните все значения в Block 1, Subtotal и Summary
4. Они должны быть **идентичными** между превью и PDF

Теперь превью и PDF будут показывать точно одинаковые данные, используя одну и ту же логику расчета. 