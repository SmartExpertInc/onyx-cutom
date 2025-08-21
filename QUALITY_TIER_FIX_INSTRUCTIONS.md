# Quality Tier Fix Instructions

## Проблема
В Block 2 таблице показываются данные только для "Interactive" качества, хотя у вас есть проекты с разными уровнями качества (Basic, Advanced, Immersive).

## Причина
Проекты в базе данных имеют `quality_tier = NULL`, поэтому они все попадают в категорию "interactive" по умолчанию.

## Решение

### Шаг 1: Проверьте текущее состояние базы данных

Выполните этот SQL запрос в вашей базе данных:

```sql
SELECT 
    quality_tier,
    COUNT(*) as count
FROM projects 
WHERE deleted_at IS NULL
GROUP BY quality_tier
ORDER BY count DESC;
```

### Шаг 2: Посмотрите примеры проектов с NULL quality_tier

```sql
SELECT 
    id,
    project_name,
    microproduct_name,
    quality_tier,
    created_at
FROM projects 
WHERE deleted_at IS NULL AND quality_tier IS NULL
ORDER BY created_at DESC
LIMIT 10;
```

### Шаг 3: Исправьте quality_tier значения

Выберите один из вариантов:

**Вариант A: Установить все NULL в 'basic'**
```sql
UPDATE projects 
SET quality_tier = 'basic' 
WHERE deleted_at IS NULL AND quality_tier IS NULL;
```

**Вариант B: Установить все NULL в 'interactive'**
```sql
UPDATE projects 
SET quality_tier = 'interactive' 
WHERE deleted_at IS NULL AND quality_tier IS NULL;
```

**Вариант C: Установить все NULL в 'advanced'**
```sql
UPDATE projects 
SET quality_tier = 'advanced' 
WHERE deleted_at IS NULL AND quality_tier IS NULL;
```

**Вариант D: Установить все NULL в 'immersive'**
```sql
UPDATE projects 
SET quality_tier = 'immersive' 
WHERE deleted_at IS NULL AND quality_tier IS NULL;
```

### Шаг 4: Проверьте результат

```sql
SELECT 
    quality_tier,
    COUNT(*) as count
FROM projects 
WHERE deleted_at IS NULL
GROUP BY quality_tier
ORDER BY count DESC;
```

### Шаг 5: Перезапустите приложение

После обновления базы данных:
1. Перезапустите backend
2. Откройте превью проектов в браузере
3. Проверьте Block 2 таблицу - теперь должны показываться данные для всех уровней качества

## Альтернативный способ (через логи)

Если у вас есть доступ к логам backend:

1. Запустите backend с нашими новыми логами
2. Откройте превью проектов
3. Посмотрите в логах backend сообщения:
   - `[PDF_ANALYTICS] Raw DB Project X: quality_tier=...`
   - `[PDF_ANALYTICS] Quality tier distribution: ...`

Это покажет, какие именно значения `quality_tier` приходят из базы данных.

## Рекомендация

Рекомендуем установить все NULL значения в 'basic' как безопасный вариант по умолчанию:

```sql
UPDATE projects 
SET quality_tier = 'basic' 
WHERE deleted_at IS NULL AND quality_tier IS NULL;
```

После этого вы сможете вручную изменить quality_tier для конкретных проектов через интерфейс приложения. 