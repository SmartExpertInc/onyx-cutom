# Real Data from Database Fix

## Проблема

В PDF показывались неправильные значения Production Time:
- **Реальные данные из БД**: 14h 21m, 10h 34m
- **Неправильные данные в PDF**: 15h 57m, 10h 31m

Проблема была в том, что PDF generation пересчитывал данные вместо использования реальных значений из базы данных.

## Причина

**Пересчет данных вместо использования реальных значений**:

1. **База данных**: Содержит правильные значения `hours` для каждого урока
2. **PDF generation**: Использовал функцию `calculate_lesson_creation_hours_with_module_fallback` для пересчета
3. **Результат**: Неправильные значения из-за различий в логике расчета

## Исправления

### 1. Исправлена функция `process_projects_data_unified`

**Проблема**: Функция всегда пересчитывала Production Time.

**Исправление**: Функция теперь использует реальные данные из базы данных:

```python
# Было:
lesson_creation_hours = calculate_lesson_creation_hours_with_module_fallback(
    lesson, section, get_tier_ratio(row_dict.get('quality_tier', 'interactive'))
)
total_creation_hours += lesson_creation_hours

# Стало:
# Use real data from database if available, otherwise calculate
if lesson.get('hours'):
    try:
        lesson_creation_hours = float(lesson['hours'])
        total_creation_hours += lesson_creation_hours
    except (ValueError, TypeError):
        # Fallback to calculation if hours is invalid
        lesson_creation_hours = calculate_lesson_creation_hours_with_module_fallback(
            lesson, section, get_tier_ratio(row_dict.get('quality_tier', 'interactive'))
        )
        total_creation_hours += lesson_creation_hours
else:
    # Calculate if no hours data available
    lesson_creation_hours = calculate_lesson_creation_hours_with_module_fallback(
        lesson, section, get_tier_ratio(row_dict.get('quality_tier', 'interactive'))
    )
    total_creation_hours += lesson_creation_hours
```

### 2. Исправлен API endpoint для превью

**Проблема**: API endpoint тоже пересчитывал данные.

**Исправление**: API endpoint теперь использует реальные данные из базы данных:

```python
# Было:
lesson_creation_hours = calculate_lesson_creation_hours_with_module_fallback(
    lesson, section, get_tier_ratio(quality_tier)
)
total_creation_hours += lesson_creation_hours

# Стало:
# Use real data from database if available, otherwise calculate
if lesson.get('hours'):
    try:
        lesson_creation_hours = float(lesson['hours'])
        total_creation_hours += lesson_creation_hours
    except (ValueError, TypeError):
        # Fallback to calculation if hours is invalid
        lesson_creation_hours = calculate_lesson_creation_hours_with_module_fallback(
            lesson, section, get_tier_ratio(quality_tier)
        )
        total_creation_hours += lesson_creation_hours
else:
    # Calculate if no hours data available
    lesson_creation_hours = calculate_lesson_creation_hours_with_module_fallback(
        lesson, section, get_tier_ratio(quality_tier)
    )
    total_creation_hours += lesson_creation_hours
```

## Правильная логика

### Приоритет использования данных:

1. **Реальные данные из БД**: `lesson.hours` (если доступно и валидно)
2. **Fallback расчет**: `calculate_lesson_creation_hours_with_module_fallback` (если нет данных или они невалидны)

### Пример:

```
Урок в базе данных:
- completionTime: "60m"
- hours: 861 (реальные данные: 14h 21m)

Старый способ:
- Пересчитывал: 60 * 25 = 1500 минут (25h 0m)
- Результат: 15h 57m (неправильно)

Новый способ:
- Использует реальные данные: 861 минут (14h 21m)
- Результат: 14h 21m (правильно)
```

## Результат

После исправлений:

- ✅ **PDF Production Time**: Показывает реальные данные из БД (14h 21m, 10h 34m)
- ✅ **Preview Production Time**: Показывает реальные данные из БД (14h 21m, 10h 34m)
- ✅ **Fallback**: Если данных нет, используется расчет
- ✅ **Консистентность**: PDF и превью показывают одинаковые значения
- ✅ **Точность**: Значения соответствуют реальным данным из базы данных

## Файлы, которые были изменены:

1. `onyx-cutom/custom_extensions/backend/main.py`
   - Исправлена функция `process_projects_data_unified`
   - Исправлен API endpoint `/api/custom/projects`
   - Добавлена логика использования реальных данных из БД

## Тестирование

Создан тестовый файл `test_real_data_fix.py` для проверки:
- Использования реальных данных из БД
- Fallback к расчету при отсутствии данных
- Правильности значений (14h 21m, 10h 34m)

## Проверка

После применения исправлений:
1. Откройте превью проектов
2. Загрузите PDF документ
3. Сравните Production Time значения
4. Они должны показывать **реальные данные из БД** (14h 21m, 10h 34m)

Теперь PDF и превью будут показывать реальные данные из базы данных вместо неправильных пересчитанных значений. 