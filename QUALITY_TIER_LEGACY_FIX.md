# Quality Tier Legacy Support Fix

## Проблемы

### 1. Столбец COURSE NAME недостаточно широкий
- **Проблема**: Столбец все еще слишком узкий, текст может переноситься
- **Требование**: Сделать столбец еще шире для лучшей читаемости

### 2. Quality Tier Sums показывают только Interactive
- **Проблема**: В Block 2 показывались данные только для Interactive tier
- **Причина**: Код не поддерживал legacy названия quality tiers
- **Результат**: Проекты с другими tiers (basic, advanced, immersive) не группировались правильно

## Анализ проблемы

### Legacy Quality Tier Names
В оригинальном коде используются как старые, так и новые названия quality tiers:

**Старые названия (legacy)**:
- `starter` → `basic`
- `medium` → `interactive` 
- `professional` → `immersive`

**Новые названия**:
- `basic`
- `interactive`
- `advanced`
- `immersive`

### Проблема в коде
Функция `get_effective_quality_tier` проверяла только новые названия:
```python
if tier in ['basic', 'interactive', 'advanced', 'immersive']:
    return tier
```

Это означало, что проекты с legacy названиями (`starter`, `medium`, `professional`) не попадали в правильные группы.

## Исправления

### 1. Увеличена ширина столбца COURSE NAME

**CSS изменения**:
```css
.course-name {
    font-weight: 600;
    color: #000;
    min-width: 300px;  /* ✅ Увеличено с 200px */
    width: 50%;        /* ✅ Увеличено с 40% */
}

/* Make first column (Quality Level) wider */
.table-header th:first-child,
.table-row td:first-child {
    width: 50%;        /* ✅ Увеличено с 40% */
    min-width: 300px;  /* ✅ Увеличено с 200px */
}

/* Make other columns narrower */
.table-header th:not(:first-child),
.table-row td:not(:first-child) {
    width: 25%;        /* ✅ Уменьшено с 30% */
    min-width: 100px;  /* ✅ Уменьшено с 120px */
}
```

### 2. Добавлена поддержка Legacy Quality Tiers

**Backend (Python)**:
```python
def get_effective_quality_tier(project, folder_quality_tier='interactive'):
    if project.get('quality_tier'):
        tier = project['quality_tier'].lower()
        # Support both old and new tier names
        tier_mapping = {
            # New tier names
            'basic': 'basic',
            'interactive': 'interactive', 
            'advanced': 'advanced',
            'immersive': 'immersive',
            # Old tier names (legacy support)
            'starter': 'basic',
            'medium': 'interactive',
            'professional': 'immersive'
        }
        if tier in tier_mapping:
            return tier_mapping[tier]
    # Fall back to folder quality tier
    folder_tier = folder_quality_tier.lower()
    # Map folder tier as well
    tier_mapping = {
        'basic': 'basic',
        'interactive': 'interactive',
        'advanced': 'advanced', 
        'immersive': 'immersive',
        'starter': 'basic',
        'medium': 'interactive',
        'professional': 'immersive'
    }
    return tier_mapping.get(folder_tier, 'interactive')
```

**Frontend (TypeScript)**:
```typescript
const getEffectiveQualityTier = (project: Project | BackendProject, folderQualityTier = 'interactive'): keyof typeof qualityTierSums => {
    if (project.quality_tier) {
        const tier = project.quality_tier.toLowerCase();
        // Support both old and new tier names
        const tierMapping: Record<string, keyof typeof qualityTierSums> = {
            // New tier names
            'basic': 'basic',
            'interactive': 'interactive',
            'advanced': 'advanced',
            'immersive': 'immersive',
            // Old tier names (legacy support)
            'starter': 'basic',
            'medium': 'interactive',
            'professional': 'immersive'
        };
        return tierMapping[tier] || 'interactive';
    }
    return 'interactive';
};
```

## Маппинг Quality Tiers

### Полный список поддерживаемых названий:

| Legacy Name | New Name | Group |
|-------------|----------|-------|
| `starter` | `basic` | Level 1 - Basic |
| `basic` | `basic` | Level 1 - Basic |
| `medium` | `interactive` | Level 2 - Interactive |
| `interactive` | `interactive` | Level 2 - Interactive |
| `advanced` | `advanced` | Level 3 - Advanced |
| `professional` | `immersive` | Level 4 - Immersive |
| `immersive` | `immersive` | Level 4 - Immersive |

### Пример работы:

```python
# Проекты с разными названиями tiers
projects = [
    {'quality_tier': 'basic', 'total_completion_time': 60},      # → basic
    {'quality_tier': 'starter', 'total_completion_time': 90},    # → basic (legacy)
    {'quality_tier': 'interactive', 'total_completion_time': 120}, # → interactive
    {'quality_tier': 'medium', 'total_completion_time': 150},    # → interactive (legacy)
    {'quality_tier': 'advanced', 'total_completion_time': 180},  # → advanced
    {'quality_tier': 'immersive', 'total_completion_time': 240}, # → immersive
    {'quality_tier': 'professional', 'total_completion_time': 200}, # → immersive (legacy)
]

# Результат группировки
quality_tier_sums = {
    'basic': {'completion_time': 150},      # basic + starter
    'interactive': {'completion_time': 270}, # interactive + medium
    'advanced': {'completion_time': 180},   # advanced only
    'immersive': {'completion_time': 440}   # immersive + professional
}
```

## Результат

После исправлений:

- ✅ **Столбец COURSE NAME**: Увеличен до 50% ширины с минимальной шириной 300px
- ✅ **Legacy поддержка**: Все старые названия tiers поддерживаются
- ✅ **Все quality tiers**: Показывают корректные данные (Basic, Interactive, Advanced, Immersive)
- ✅ **Группировка**: Проекты с legacy названиями правильно группируются
- ✅ **Консистентность**: PDF и превью показывают одинаковые данные
- ✅ **Читаемость**: Улучшена за счет увеличения ширины столбца

## Файлы, которые были изменены:

1. `onyx-cutom/custom_extensions/backend/main.py`
   - Добавлена поддержка legacy quality tier names
   - Улучшена функция `get_effective_quality_tier`

2. `onyx-cutom/custom_extensions/backend/templates/modern_projects_list_pdf_template.html`
   - Увеличена ширина столбца COURSE NAME (50% width, 300px min-width)
   - Уменьшена ширина других столбцов (25% width, 100px min-width)

3. `onyx-cutom/custom_extensions/frontend/src/components/ProjectsTable.tsx`
   - Добавлена поддержка legacy quality tier names
   - Улучшена функция `getEffectiveQualityTier`

## Тестирование

Создан тестовый файл `test_quality_tier_legacy_fix.py` для проверки:
- Поддержки legacy quality tier names
- Правильности группировки проектов
- Корректности маппинга tiers
- Увеличения ширины столбца

## Проверка

После применения исправлений:
1. Откройте превью проектов
2. Проверьте Block 2 - все quality tiers должны показывать данные
3. Убедитесь, что проекты с legacy названиями группируются правильно
4. Загрузите PDF и убедитесь, что столбец COURSE NAME стал шире
5. Проверьте, что данные в PDF и превью совпадают

Теперь Block 2 будет правильно отображать данные для всех quality tiers, включая legacy названия, а столбец COURSE NAME стал значительно шире и удобнее для чтения. 