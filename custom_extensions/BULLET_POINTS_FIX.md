# Исправление проблемы с Bullet Points в ContentBuilder.ai

## Проблема

Пользователи сообщают, что при создании презентаций система автоматически применяет bullet points на всех слайдах, а когда в промпте запрашиваются другие типы контента (например, "создай сравнение", "покажи статистику", "сделай пошаговый процесс"), эти запросы игнорируются и всё равно создаются bullet points.

## Причина проблемы

В инструкциях для ассистента (`content_builder_ai.txt`) были очень строгие правила для использования шаблонов, которые не учитывали пользовательские запросы:

1. **Жёсткие ограничения на bullet-points**: Максимум 3 слайда с bullet points
2. **Приоритет специализированных шаблонов**: Система предпочитала `big-numbers`, `pyramid`, `process-steps` и другие шаблоны
3. **Отсутствие анализа пользовательского запроса**: Система не анализировала промпт на предмет конкретных запросов пользователя

## Решение

Добавлены новые правила в инструкции ассистента:

### 1. Правило анализа пользовательского запроса
```
**USER PROMPT ANALYSIS RULE:**
Before generating any content, analyze the user's prompt for specific content format requests:
- If user asks for "bullet points", "lists", "key points", "steps", "comparisons", "statistics", etc., prioritize these requests
- User intent takes precedence over template restrictions when they explicitly request specific content types
- Adapt template selection to match user's requested content format while maintaining educational quality
```

### 2. Приоритет пользовательского запроса в выборе шаблонов
```
**USER REQUEST PRIORITY**: First, check if user explicitly requests specific content types in their prompt
**USER INTENT MATCHING**: If user asks for specific formats, prioritize their request over default template selection
```

### 3. Гибкие ограничения на bullet points
```
**BULLET-POINTS RESTRICTION**: Maximum 3 bullet-points slides total per presentation (bullet-points + bullet-points-right combined) - UNLESS user explicitly requests more bullet point content
**SPECIALIZED TEMPLATE PRIORITY**: Always prefer specialized templates over bullet-points - UNLESS user explicitly requests bullet point format
**USER REQUEST PRIORITY**: If user asks for "bullet points", "lists", "key points", or similar content types, prioritize their request over template restrictions
```

### 4. Правило уважения намерений пользователя
```
**USER PROMPT PRIORITY**: If the user explicitly requests specific content types in their prompt (e.g., "create bullet points", "make a list", "show steps", "compare features"), prioritize their request over template restrictions
**USER INTENT RESPECT**: When user asks for specific content formats, adapt template selection to match their intent while maintaining educational quality
```

## Результат

Теперь система будет:

1. **Анализировать промпт пользователя** на предмет конкретных запросов
2. **Приоритизировать пользовательские запросы** над системными ограничениями
3. **Адаптировать выбор шаблонов** под намерения пользователя
4. **Сохранять образовательное качество** при выполнении пользовательских запросов

## Примеры работы

### До исправления:
- Пользователь: "Создай презентацию со сравнением двух подходов"
- Результат: Bullet points на всех слайдах

### После исправления:
- Пользователь: "Создай презентацию со сравнением двух подходов"
- Результат: Использование шаблона `two-column` или `comparison-slide` для сравнения

- Пользователь: "Покажи статистику и ключевые метрики"
- Результат: Использование шаблона `big-numbers` для статистики

- Пользователь: "Сделай пошаговый процесс"
- Результат: Использование шаблона `process-steps` или `timeline`

## Файлы изменены

- `onyx-cutom/custom_extensions/backend/custom_assistants/content_builder_ai.txt` - основные инструкции ассистента

## Тестирование

Для проверки исправления можно создать презентации с различными запросами:
1. "Создай презентацию со сравнением"
2. "Покажи статистику"
3. "Сделай пошаговый процесс"
4. "Создай иерархию понятий"

Система должна использовать соответствующие шаблоны вместо автоматического применения bullet points. 