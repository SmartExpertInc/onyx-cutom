# Table Generation Fix Guide

## Проблема
Таблицы не генерировались и не отображались на сайте. Ошибки включали:
- "Template Not Found" для `comparison-slide`
- `TypeError: e.map is not a function` в frontend
- AI не генерировал правильную структуру JSON для таблиц

## Решение

### 1. Исправлены AI промпты
**Файл:** `onyx-cutom/custom_extensions/backend/custom_assistants/content_builder_ai.txt`

- ✅ Обновлено правило `TABLE RULE` с русскими ключевыми словами
- ✅ Добавлены слова: "таблица", "сравнение", "данные", "метрики", "анализ", "сопоставление", "против", "по сравнению", "сравнительный анализ", "табличные данные", "структурированные данные"
- ✅ Заменены markdown примеры на JSON примеры

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

## Статус: ✅ ИСПРАВЛЕНО

Все исправления завершены. Таблицы должны генерироваться и отображаться корректно.

## Следующие шаги

1. Запустите сервер: `python main.py`
2. Откройте сайт
3. Протестируйте промпты для таблиц
4. Убедитесь, что таблицы отображаются без ошибок 