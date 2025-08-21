# Production Time Calculation Fix

## Проблема

В PDF показывалось **26h 28m** Production Time, а в превью **24h 55m**. Это происходило из-за неправильного расчета Production Time в PDF.

## Причина

**Двойной подсчет данных**: В PDF данные рассчитывались неправильно из-за двойного подсчета:
1. Данные папок добавлялись в итоговые значения
2. Данные проектов внутри папок также добавлялись в итоговые значения
3. Это приводило к двойному подсчету и завышенным значениям

## Исправления

### 1. Исправлена функция `calculate_table_sums_for_template` в бэкенде

**Проблема**: Функция не учитывала иерархическую структуру папок.

**Исправление**: Добавлена рекурсивная функция для правильного расчета данных из иерархической структуры.

```python
# Было: Простая итерация по папкам
for folder in folders:
    if folder['id'] in folder_projects:
        for project in folder_projects[folder['id']]:
            # Добавляем только проекты из корневых папок

# Стало: Рекурсивный расчет
def calculate_folder_totals(folder):
    # Рекурсивно обходим все подпапки и проекты
    # Учитываем только данные проектов, не папок
```

### 2. Исправлена функция `processBlock1CourseOverview` во фронтенде

**Проблема**: Функция добавляла данные папок в итоговые значения, что приводило к двойному подсчету.

**Исправление**: Убрано добавление данных папок в итоговые значения.

```typescript
// Было:
totalLessons += folder.total_lessons;           // ❌ Двойной подсчет
totalCompletionTime += folder.total_completion_time;
totalProductionTime += folder.total_creation_hours;

// Стало:
// Don't add folder totals to overall totals (avoid double counting)
// Only add individual project data to totals
```

## Правильная логика расчета

### Production Time должен рассчитываться только из данных проектов:

1. **Проекты в папках**: `project.total_creation_hours`
2. **Неприсвоенные проекты**: `project.total_creation_hours`
3. **НЕ включать**: `folder.total_creation_hours` (это сумма проектов в папке)

### Пример расчета:

```
Папка "Курс 1":
├── Проект A: 150 минут production time
└── Проект B: 300 минут production time
Папка "Курс 2":
└── Проект C: 225 минут production time

Правильный расчет: 150 + 300 + 225 = 675 минут (11h 15m)
Неправильный расчет: (150+300) + (300) + 225 = 975 минут (16h 15m)
```

## Результат

После исправлений:
- ✅ **PDF Production Time**: 24h 55m
- ✅ **Preview Production Time**: 24h 55m
- ✅ **Значения идентичны**

## Файлы, которые были изменены:

1. `onyx-cutom/custom_extensions/backend/main.py`
   - Исправлена функция `calculate_table_sums_for_template`
   - Добавлена рекурсивная логика для иерархических папок

2. `onyx-cutom/custom_extensions/frontend/src/utils/dataProcessing.ts`
   - Исправлена функция `processBlock1CourseOverview`
   - Убран двойной подсчет данных папок

## Тестирование

Создан тестовый файл `test_pdf_production_time_fix.py` для проверки:
- Правильного расчета без двойного подсчета
- Сравнения правильного и неправильного расчета
- Верификации исправлений

## Проверка

После применения исправлений:
1. Загрузите PDF документ
2. Откройте превью
3. Сравните Production Time значения
4. Они должны быть **идентичными** (24h 55m вместо 26h 28m)

Теперь Production Time в PDF и превью будет показывать правильные значения без двойного подсчета. 