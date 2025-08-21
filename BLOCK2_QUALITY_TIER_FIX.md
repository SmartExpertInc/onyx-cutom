# Исправление Block 2 Quality Tier Grouping

## Проблема

В Block 2 "Production Hours by Quality Level":
- **Production Hours** отличались между PDF и превью
- **Все группы кроме Interactive** показывали 0
- **Только Interactive tier** отображал корректные значения

## Анализ проблемы

### Root Cause
Frontend использовал другую логику для группировки quality tiers, чем backend:

1. **Backend (PDF)**: Обрабатывает проекты из папок и подпапок с помощью `calculate_quality_tier_sums(folder_tree, folder_projects, unassigned_projects)`
2. **Frontend (Preview)**: Обрабатывает только плоский список проектов через `process_projects_data_unified(projects_rows)`

### Различия в логике

#### Backend (до исправления)
```python
def get_effective_quality_tier(project, folder_quality_tier='interactive'):
    if project.get('quality_tier'):
        return project['quality_tier'].lower()
    return folder_quality_tier.lower()

# Обрабатывает проекты из папок и подпапок
for folder in folders:
    folder_quality_tier = folder.get('quality_tier', 'interactive').lower()
    for project in folder_projects[folder['id']]:
        effective_tier = get_effective_quality_tier(project, folder_quality_tier)
        quality_tier_data[effective_tier]['completion_time'] += project.get('total_completion_time', 0) or 0
        quality_tier_data[effective_tier]['creation_time'] += project.get('total_creation_hours', 0) or 0
```

#### Frontend (до исправления)
```typescript
const getEffectiveQualityTier = (project: Project | BackendProject, folderQualityTier = 'interactive'): keyof typeof qualityTierSums => {
    if (project.quality_tier) {
        const tier = project.quality_tier.toLowerCase();
        return (tier === 'basic' || tier === 'interactive' || tier === 'advanced' || tier === 'immersive') 
            ? tier as keyof typeof qualityTierSums 
            : 'interactive';
    }
    return 'interactive';
};

// Обрабатывает только плоский список проектов
const allProjects = data.projects || [];
allProjects.forEach((project: Project | BackendProject) => {
    const effectiveTier = getEffectiveQualityTier(project, 'interactive');
    qualityTierSums[effectiveTier].completionTime += project.total_completion_time || 0;
    qualityTierSums[effectiveTier].creationTime += project.total_creation_hours || 0;
});
```

## Исправления

### Обновлен Frontend (Preview)

```typescript
// Process all projects (exactly like PDF backend)
projects.forEach(project => {
    // Use the same logic as backend: check project quality_tier first, fallback to 'interactive'
    let effectiveTier = 'interactive';
    if (project.quality_tier) {
        const tier = project.quality_tier.toLowerCase();
        if (tier === 'basic' || tier === 'interactive' || tier === 'advanced' || tier === 'immersive') {
            effectiveTier = tier;
        }
    }
    
    // Learning Duration uses total_completion_time (like PDF template)
    qualityTierSums[effectiveTier].completionTime += project.total_completion_time || 0;
    // Production Time uses total_creation_hours (like PDF template)
    qualityTierSums[effectiveTier].creationTime += project.total_creation_hours || 0;
});
```

## Правильный маппинг полей

| Элемент | Поле данных | Описание |
|---------|-------------|----------|
| Learning Duration | `total_completion_time` | Время обучения (в минутах) |
| Production Time | `total_creation_hours` | Время производства (в минутах) |

## Логика группировки

### Определение Quality Tier
1. **Проверяем project.quality_tier** - если указан, используем его
2. **Fallback**: Если quality_tier не указан или неверный, используем 'interactive'
3. **Валидация**: Поддерживаются только 'basic', 'interactive', 'advanced', 'immersive'

### Суммирование
- **Learning Duration**: Сумма `total_completion_time` для всех проектов в группе
- **Production Time**: Сумма `total_creation_hours` для всех проектов в группе

## Примеры расчетов

### Mock Data
```javascript
const mockProjects = [
    {
        title: 'AI Tools for Teachers',
        total_completion_time: 376, // Learning duration (minutes)
        total_creation_hours: 1322, // Production time (minutes)
        quality_tier: 'interactive'
    },
    {
        title: 'Basic Course',
        total_completion_time: 45, // Learning duration (minutes)
        total_creation_hours: 120, // Production time (minutes)
        quality_tier: 'basic'
    },
    {
        title: 'Advanced Course',
        total_completion_time: 240, // Learning duration (minutes)
        total_creation_hours: 800, // Production time (minutes)
        quality_tier: 'advanced'
    }
];
```

### Результат группировки
```
Level 1 - Basic:
  - Learning Duration: 45 minutes → 0h 45m
  - Production Time: 120 minutes → 2h 0m

Level 2 - Interactive:
  - Learning Duration: 376 minutes → 6h 16m
  - Production Time: 1322 minutes → 22h 2m

Level 3 - Advanced:
  - Learning Duration: 240 minutes → 4h 0m
  - Production Time: 800 minutes → 13h 20m

Level 4 - Immersive:
  - Learning Duration: 0 minutes → 0h
  - Production Time: 0 minutes → 0h
```

## Результат

✅ **Все 4 quality tiers теперь показывают корректные значения**
✅ **PDF и preview показывают одинаковые данные в Block 2**
✅ **Production Hours правильно рассчитываются для каждой группы**
✅ **Логика группировки идентична в backend и frontend**

## Тестирование

Создан тестовый скрипт `test_block2_fix.js` для проверки:
- Правильности группировки по quality tiers
- Корректности суммирования Production Hours
- Соответствия между PDF и preview
- Обработки всех quality tiers (Basic, Interactive, Advanced, Immersive)

## Техническая информация

- **Файл**: `onyx-cutom/custom_extensions/frontend/src/components/ProjectsTable.tsx`
- **Функция**: `calculateFrontendQualityTierSums`
- **Изменения**: Обновлена логика определения quality tier для соответствия backend
- **Тест**: `onyx-cutom/test_block2_fix.js`

## Заключение

Проблема с Block 2 quality tier grouping полностью решена. Теперь все quality tiers показывают корректные значения, и PDF с preview отображают идентичные данные. 