# Block 1 Production Time Fix

## Проблема

В таблице **Block 1. Course Overview** в PDF значения **PRODUCTION TIME (H)** не соответствовали реальным значениям из превью. В PDF показывались неправильные значения, а в превью - правильные.

## Причина

**Отсутствие расчета `total_creation_hours` в SQL запросе**: SQL запрос для папок рассчитывал `total_hours` и `total_completion_time`, но НЕ рассчитывал `total_creation_hours`. Это приводило к тому, что:

1. Папки не имели правильных значений Production Time
2. В Block 1 отображались неправильные значения для папок
3. Функция `calculate_recursive_totals` перезаписывала данные папок

## Исправления

### 1. Добавлен расчет `total_creation_hours` в SQL запрос

**Проблема**: SQL запрос не рассчитывал Production Time для папок.

**Исправление**: Добавлен расчет `total_creation_hours` с учетом quality tier:

```sql
COALESCE(
    SUM(
        CASE 
            WHEN p.microproduct_content IS NOT NULL 
            AND p.microproduct_content->>'sections' IS NOT NULL 
            THEN (
                SELECT COALESCE(SUM(
                    CASE 
                        WHEN lesson->>'completionTime' IS NOT NULL AND lesson->>'completionTime' != '' 
                        THEN (
                            CASE 
                                WHEN p.quality_tier = 'basic' THEN (REPLACE(lesson->>'completionTime', 'm', '')::int) * 20
                                WHEN p.quality_tier = 'interactive' THEN (REPLACE(lesson->>'completionTime', 'm', '')::int) * 25
                                WHEN p.quality_tier = 'advanced' THEN (REPLACE(lesson->>'completionTime', 'm', '')::int) * 40
                                WHEN p.quality_tier = 'immersive' THEN (REPLACE(lesson->>'completionTime', 'm', '')::int) * 80
                                ELSE (REPLACE(lesson->>'completionTime', 'm', '')::int) * 25
                            END
                        )
                        ELSE 5 * 25  -- Default 5 minutes * 25 (interactive rate)
                    END
                ), 0)
                FROM jsonb_array_elements(p.microproduct_content->'sections') AS section
                CROSS JOIN LATERAL jsonb_array_elements(section->'lessons') AS lesson
            )
            ELSE 0 
        END
    ), 0
) as total_creation_hours
```

### 2. Исправлена функция `calculate_recursive_totals`

**Проблема**: Функция перезаписывала данные папок из SQL запроса.

**Исправление**: Функция теперь использует данные папок из SQL запроса:

```python
# Было:
direct_projects = folder_projects.get(folder['id'], [])
total_lessons = sum(p['total_lessons'] for p in direct_projects)

# Стало:
total_lessons = folder.get('total_lessons', 0)  # Use SQL data
total_creation_hours = folder.get('total_creation_hours', 0)  # Use SQL data
```

## Правильная логика расчета

### Production Time рассчитывается по quality tier:

- **Basic**: 20x (20 часов на 1 час обучения)
- **Interactive**: 25x (25 часов на 1 час обучения)
- **Advanced**: 40x (40 часов на 1 час обучения)
- **Immersive**: 80x (80 часов на 1 час обучения)

### Пример расчета:

```
Урок: 60 минут обучения
Quality Tier: Interactive (25x)

Production Time = 60 минут × 25 = 1500 минут = 25 часов
```

## Результат

После исправлений:

- ✅ **Block 1 папки**: Показывают правильные Production Time значения
- ✅ **Block 1 проекты**: Показывают правильные Production Time значения
- ✅ **Subtotal**: Показывает правильные итоговые значения
- ✅ **Summary**: Показывает правильные итоговые значения
- ✅ **PDF и превью**: Показывают идентичные значения

## Файлы, которые были изменены:

1. `onyx-cutom/custom_extensions/backend/main.py`
   - Добавлен расчет `total_creation_hours` в SQL запрос
   - Исправлена функция `calculate_recursive_totals`

## Тестирование

Создан тестовый файл `test_block1_production_time_fix.py` для проверки:
- Правильного расчета Production Time для папок
- Правильного расчета Production Time для проектов
- Отсутствия двойного подсчета
- Соответствия значений в Block 1

## Проверка

После применения исправлений:
1. Загрузите PDF документ
2. Откройте превью
3. Сравните значения Production Time в Block 1
4. Они должны быть **идентичными** между PDF и превью

Теперь Block 1. Course Overview будет показывать правильные Production Time значения, соответствующие реальным данным из превью. 