# Block 2 Preview Fix - Production Hours by Quality Level

## Проблема
В превью PDF в Block 2 "Production Hours by Quality Level" отображались только черточки (-), хотя в самом PDF документе все значения были корректными.

## Причина
В fallback коде (когда backend недоступен или возвращает ошибку) quality_tier_sums устанавливались в нулевые значения вместо расчета на основе данных проектов.

## Исправление

### Файл: `onyx-cutom/custom_extensions/frontend/src/components/ProjectsTable.tsx`

#### Изменения в строках 3902 и 3933:

**Было:**
```typescript
setPreviewData({
    clientName,
    managerName,
    projects: projectsToShow,
    quality_tier_sums: {
        basic: { completion_time: 0, creation_time: 0 },
        interactive: { completion_time: 0, creation_time: 0 },
        advanced: { completion_time: 0, creation_time: 0 },
        immersive: { completion_time: 0, creation_time: 0 }
    }
});
```

**Стало:**
```typescript
// Calculate quality tier sums from frontend data (same logic as backend)
const qualityTierSums = {
    basic: { completion_time: 0, creation_time: 0 },
    interactive: { completion_time: 0, creation_time: 0 },
    advanced: { completion_time: 0, creation_time: 0 },
    immersive: { completion_time: 0, creation_time: 0 }
};

// Helper function to get effective quality tier
const getEffectiveQualityTier = (project: Project | BackendProject, folderQualityTier = 'interactive'): keyof typeof qualityTierSums => {
    if (project.quality_tier) {
        const tier = project.quality_tier.toLowerCase();
        if (tier === 'basic' || tier === 'interactive' || tier === 'advanced' || tier === 'immersive') {
            return tier as keyof typeof qualityTierSums;
        }
    }
    return 'interactive';
};

// Process all projects (exactly like backend)
projectsToShow.forEach((project: Project | BackendProject) => {
    const effectiveTier = getEffectiveQualityTier(project, 'interactive');
    qualityTierSums[effectiveTier].completion_time += project.total_completion_time || 0;
    qualityTierSums[effectiveTier].creation_time += project.total_creation_hours || 0;
});

setPreviewData({
    clientName,
    managerName,
    projects: projectsToShow,
    quality_tier_sums: qualityTierSums
});
```

## Логика расчета

1. **Определение quality tier**: Используется приоритет `project.quality_tier` → fallback к 'interactive'
2. **Агрегация данных**: 
   - `completion_time` суммируется из `project.total_completion_time`
   - `creation_time` суммируется из `project.total_creation_hours`
3. **Форматирование**: Используется функция `formatTimeLikePDF()` для отображения в формате "Xh Ym"

## Результат
Теперь превью Block 2 показывает те же значения, что и в PDF документе, независимо от того, доступен ли backend или нет.

## Тестирование
Создан тестовый файл `test_preview_fix.js` для проверки корректности расчетов. 