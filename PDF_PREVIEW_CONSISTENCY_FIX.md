# PDF и Preview Консистентность - Исправление

## Проблема

Пользователи жаловались на то, что данные в PDF и в превью не совпадают. В PDF отображались одни данные, а в превью - другие.

## Анализ проблемы

После анализа кода было обнаружено, что проблема заключалась в **различной обработке данных** для PDF и превью:

### До исправления:

1. **PDF генерация** (`/api/custom/pdf/projects-list`):
   - Использовала собственную логику обработки данных
   - Применяла `calculate_lesson_creation_hours_with_module_fallback`
   - Округляла значения с помощью `round(total_hours)`

2. **Превью** (`/api/custom/projects-data`):
   - Использовала другую логику обработки данных
   - Применяла упрощенные расчеты
   - Округляла значения с помощью `round(total_hours, 1)`

### Результат:
- Разные данные в PDF и превью
- Непредсказуемое поведение
- Пользовательская путаница

## Решение

### Принцип исправления:
**Единообразная обработка данных** для всех типов компонентов в PDF генерации и превью.

### Изменения в коде:

1. **Создана унифицированная функция** `process_projects_data_unified`:
   ```python
   def process_projects_data_unified(projects_rows, folders_data=None):
       """
       Unified function to process projects data for both PDF generation and preview.
       This ensures both PDF and preview use exactly the same data and calculations.
       """
   ```

2. **Обновлен PDF endpoint** (`/api/custom/pdf/projects-list`):
   ```python
   # Process projects data using unified function for consistency
   projects_data = process_projects_data_unified(projects_rows, folders_data)
   ```

3. **Обновлен preview endpoint** (`/api/custom/projects-data`):
   ```python
   # Process projects data using unified function for consistency
   projects_data = process_projects_data_unified(projects_rows)
   ```

### Ключевые особенности унифицированной функции:

1. **Единообразные расчеты**:
   - `total_lessons`: количество уроков
   - `total_modules`: количество модулей
   - `total_hours`: время обучения (округление до 1 знака)
   - `total_creation_hours`: время производства (округление до 1 знака)
   - `total_completion_time`: время завершения в минутах

2. **Консистентная обработка quality_tier**:
   - Basic: 20x множитель
   - Interactive: 25x множитель (по умолчанию)
   - Advanced: 40x множитель
   - Immersive: 80x множитель

3. **Единообразная обработка completion_time**:
   - Поддержка форматов: "30m", "2h", "45"
   - Fallback на 5 минут при отсутствии данных

## Результат

✅ **PDF и превью теперь используют идентичные данные**
✅ **Все расчеты выполняются одинаково**
✅ **Quality tier множители применяются консистентно**
✅ **Округление значений унифицировано**
✅ **Обработка ошибок стандартизирована**

## Тестирование

Создан тестовый скрипт `test_pdf_preview_consistency.py` для проверки:
- Корректности работы унифицированной функции
- Консистентности данных между PDF и превью
- Правильности расчетов quality tier множителей

## Использование

Теперь при скачивании PDF и просмотре превью пользователи будут видеть **точно одинаковые данные**:

1. **Block 1. Course Overview** - идентичные значения
2. **Block 2. Production Hours by Quality Level** - идентичные значения
3. **Subtotal, Total, Estimated Production Time** - идентичные значения

## Техническая информация

- **Файл**: `onyx-cutom/custom_extensions/backend/main.py`
- **Функция**: `process_projects_data_unified`
- **Endpoints**: `/api/custom/pdf/projects-list`, `/api/custom/projects-data`
- **Тест**: `onyx-cutom/test_pdf_preview_consistency.py`

## Заключение

Проблема с несовпадением данных в PDF и превью полностью решена. Теперь оба компонента используют единую логику обработки данных, что гарантирует консистентность результатов. 