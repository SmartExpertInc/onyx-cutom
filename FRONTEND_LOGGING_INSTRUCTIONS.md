# Frontend Logging Instructions

## Как использовать логирование для диагностики

### Шаг 1: Откройте Developer Tools
1. Откройте браузер
2. Нажмите F12 или правой кнопкой мыши → "Inspect"
3. Перейдите на вкладку **Console**

### Шаг 2: Откройте превью проектов
1. Зайдите в ваше приложение
2. Откройте превью проектов (где показывается Block 2 таблица)

### Шаг 3: Посмотрите логи в консоли

Вы увидите следующие сообщения:

#### 1. Начало обработки
```
[FRONTEND_DEBUG] === BLOCK 2 QUALITY TIER SUMS START ===
[FRONTEND_DEBUG] Input data: {projects: [...], folders: [...]}
```

#### 2. Анализ проектов
```
[FRONTEND_DEBUG] Processing projects for quality tier sums: X
[FRONTEND_DEBUG] Raw projects data: [...]
[FRONTEND_DEBUG] === DETAILED PROJECT ANALYSIS ===
[FRONTEND_DEBUG] Project 1: {id: 1, title: "Project Name", quality_tier: "basic", ...}
[FRONTEND_DEBUG] Project 2: {id: 2, title: "Project Name", quality_tier: "interactive", ...}
...
[FRONTEND_DEBUG] === END PROJECT ANALYSIS ===
```

#### 3. Обработка quality tier
```
[FRONTEND_DEBUG] === QUALITY TIER PROCESSING ===
[FRONTEND_DEBUG] Project 1: quality_tier=basic, effective_tier=basic, completion_time=60, creation_hours=120
[FRONTEND_DEBUG] Project 2: quality_tier=interactive, effective_tier=interactive, completion_time=120, creation_hours=300
...
[FRONTEND_DEBUG] Final quality tier sums: {basic: {...}, interactive: {...}, advanced: {...}, immersive: {...}}
[FRONTEND_DEBUG] === END QUALITY TIER PROCESSING ===
```

#### 4. Рендеринг строк
```
[FRONTEND_DEBUG] Rendering row for Level 1 - Basic: completionTime=60, creationTime=120
[FRONTEND_DEBUG] Rendering row for Level 2 - Interactive: completionTime=120, creationTime=300
...
```

## Что искать

### ✅ Нормальная ситуация
- Все проекты имеют `quality_tier` (не null/undefined)
- Разные проекты попадают в разные категории
- В финальных суммах есть данные для нескольких категорий

### ❌ Проблемная ситуация
- Многие проекты имеют `quality_tier: null` или `quality_tier: undefined`
- Все проекты попадают в одну категорию (обычно "interactive")
- В финальных суммах только одна категория имеет данные

## Примеры логов

### Хороший пример:
```
[FRONTEND_DEBUG] Project 1: quality_tier=basic, effective_tier=basic
[FRONTEND_DEBUG] Project 2: quality_tier=interactive, effective_tier=interactive
[FRONTEND_DEBUG] Project 3: quality_tier=advanced, effective_tier=advanced
[FRONTEND_DEBUG] Final quality tier sums: {
  basic: {completionTime: 60, creationTime: 120},
  interactive: {completionTime: 120, creationTime: 300},
  advanced: {completionTime: 180, creationTime: 720},
  immersive: {completionTime: 0, creationTime: 0}
}
```

### Плохой пример:
```
[FRONTEND_DEBUG] Project 1: quality_tier=null, effective_tier=interactive
[FRONTEND_DEBUG] Project 2: quality_tier=null, effective_tier=interactive
[FRONTEND_DEBUG] Project 3: quality_tier=null, effective_tier=interactive
[FRONTEND_DEBUG] Final quality tier sums: {
  basic: {completionTime: 0, creationTime: 0},
  interactive: {completionTime: 360, creationTime: 1140},
  advanced: {completionTime: 0, creationTime: 0},
  immersive: {completionTime: 0, creationTime: 0}
}
```

## Действия после анализа

Если вы видите, что все проекты имеют `quality_tier: null`, то нужно:

1. **Выполнить SQL запрос** для проверки базы данных:
   ```sql
   SELECT quality_tier, COUNT(*) FROM projects WHERE deleted_at IS NULL GROUP BY quality_tier;
   ```

2. **Исправить quality_tier** в базе данных:
   ```sql
   UPDATE projects SET quality_tier = 'basic' WHERE deleted_at IS NULL AND quality_tier IS NULL;
   ```

3. **Перезапустить приложение** и проверить снова 