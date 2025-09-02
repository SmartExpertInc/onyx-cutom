# Table Generation Fix Guide

## Проблема
Таблицы не генерировались и не отображались на сайте. Ошибки включали:
- "Template Not Found" для `comparison-slide`
- `TypeError: e.map is not a function` в frontend
- AI не генерировал правильную структуру JSON для таблиц
- **НОВАЯ ПРОБЛЕМА**: Система выбирала `two-column` вместо `table-dark`/`table-light`

## Решение

### 1. Исправлены AI промпты
**Файл:** `onyx-cutom/custom_extensions/backend/custom_assistants/content_builder_ai.txt`

- ✅ Обновлено правило `TABLE RULE` с русскими ключевыми словами
- ✅ Добавлены слова: "таблица", "сравнение", "данные", "метрики", "анализ", "сопоставление", "против", "по сравнению", "сравнительный анализ", "табличные данные", "структурированные данные"
- ✅ Заменены markdown примеры на JSON примеры
- ✅ **ДОБАВЛЕНЫ КРИТИЧЕСКИЕ ПРАВИЛА**: Запрет использования `two-column` для таблиц

### 2. Исправлены frontend компоненты
**Файлы:**
- `onyx-cutom/custom_extensions/frontend/src/components/templates/TableDarkTemplate.tsx`
- `onyx-cutom/custom_extensions/frontend/src/components/templates/TableLightTemplate.tsx`

- ✅ Добавлены проверки на null/undefined для всех `.map()` операций
- ✅ Исправлены функции `addColumn`, `removeColumn`, `addRow`

### 3. Обновлен registry
**Файл:** `onyx-cutom/custom_extensions/frontend/src/components/templates/registry.ts`

- ✅ Изменен тип `tableData` с `array` на `object` в `propSchema`
- ✅ Обновлены схемы для `table-dark` и `table-light`

### 4. Исправлены TypeScript типы
**Файл:** `onyx-cutom/custom_extensions/frontend/src/types/slideTemplates.ts`

- ✅ Добавлен тип `'object'` в интерфейс `PropDefinition`

### 5. ✅ ДОБАВЛЕНЫ JSON ПРИМЕРЫ В MAIN.PY
**Файл:** `onyx-cutom/custom_extensions/backend/main.py`

- ✅ Добавлены примеры `table-dark` и `table-light` в `DEFAULT_SLIDE_DECK_JSON_EXAMPLE_FOR_LLM`
- ✅ Добавлены примеры `table-dark` и `table-light` в `DEFAULT_VIDEO_LESSON_JSON_EXAMPLE_FOR_LLM`
- ✅ Каждый пример включает правильную структуру `tableData` с `headers` и `rows`

### 6. ✅ ИСПРАВЛЕН ВЫБОР ШАБЛОНОВ
**Файл:** `onyx-cutom/custom_extensions/backend/main.py`

- ✅ Удален `comparison-slide` из Template Assignment Guidelines
- ✅ Заменен на `two-column-diversity`
- ✅ **ДОБАВЛЕНЫ CRITICAL TABLE RULE** в оба места Template Assignment Guidelines
- ✅ Явно указано использовать `table-dark` или `table-light` для таблиц
- ✅ Запрещено использование других шаблонов для табличных данных

## Структура JSON для таблиц

```json
{
  "slideId": "slide_X",
  "slideNumber": X,
  "slideTitle": "Title",
  "templateId": "table-dark" | "table-light",
  "props": {
    "title": "Table Title",
    "tableData": {
      "headers": ["Header1", "Header2", "Header3"],
      "rows": [
        ["Row1Col1", "Row1Col2", "Row1Col3"],
        ["Row2Col1", "Row2Col2", "Row2Col3"]
      ]
    }
  }
}
```

## Промпты для тестирования

1. "Создай таблицу сравнения технологий"
2. "Сделай таблицу с данными о продуктах"
3. "Сгенерируй таблицу сравнения планов подписки"
4. "Создай таблицу метрик производительности"
5. "Сделай сравнительную таблицу функций"
6. "Создай таблицу данных"
7. "Сделай таблицу анализа"
8. "Сгенерируй таблицу статистики"

## Критические правила для AI

**При обнаружении ключевых слов таблиц AI ДОЛЖЕН:**
- ✅ Использовать ТОЛЬКО `table-dark` или `table-light`
- ✅ Генерировать JSON props с `tableData.headers` и `tableData.rows`
- ❌ НЕ использовать `two-column`, `two-column-diversity` или другие шаблоны
- ❌ НЕ генерировать markdown таблицы
- ✅ Всегда структурировать данные как таблицу с заголовками и строками

## Статус: ✅ ИСПРАВЛЕНО

Все исправления завершены. Таблицы должны генерироваться и отображаться корректно.

## Следующие шаги

1. Запустите сервер: `python main.py`
2. Откройте сайт
3. Протестируйте промпты для таблиц
4. Убедитесь, что таблицы отображаются без ошибок
5. Проверьте, что генерируются именно таблицы, а не слайды сравнения 