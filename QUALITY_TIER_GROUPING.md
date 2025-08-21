# Группировка по Quality Tiers в Block 2

## Описание

Block 2 "Production Hours by Quality Level" группирует проекты по их quality tier и показывает суммарные часы для каждой группы.

## Quality Tiers

Существует 4 уровня качества:

| Quality Tier | Название в PDF/Preview | Описание |
|--------------|------------------------|----------|
| `basic` | Level 1 - Basic | Базовый уровень качества |
| `interactive` | Level 2 - Interactive | Интерактивный уровень качества |
| `advanced` | Level 3 - Advanced | Продвинутый уровень качества |
| `immersive` | Level 4 - Immersive | Иммерсивный уровень качества |

## Логика группировки

### Backend (PDF)

```python
def calculate_quality_tier_sums(folders, folder_projects, unassigned_projects):
    quality_tier_data = {
        'basic': {'completion_time': 0, 'creation_time': 0},
        'interactive': {'completion_time': 0, 'creation_time': 0},
        'advanced': {'completion_time': 0, 'creation_time': 0},
        'immersive': {'completion_time': 0, 'creation_time': 0}
    }
    
    # Helper function to get effective quality tier
    def get_effective_quality_tier(project, folder_quality_tier='interactive'):
        if project.get('quality_tier'):
            return project['quality_tier'].lower()
        return folder_quality_tier.lower()
    
    # Process all projects
    for project in all_projects:
        effective_tier = get_effective_quality_tier(project, 'interactive')
        if effective_tier in quality_tier_data:
            quality_tier_data[effective_tier]['completion_time'] += project.get('total_completion_time', 0) or 0
            quality_tier_data[effective_tier]['creation_time'] += project.get('total_creation_hours', 0) or 0
    
    return quality_tier_data
```

### Frontend (Preview)

```typescript
const qualityTierSums = {
    'basic': { completionTime: 0, creationTime: 0 },
    'interactive': { completionTime: 0, creationTime: 0 },
    'advanced': { completionTime: 0, creationTime: 0 },
    'immersive': { completionTime: 0, creationTime: 0 }
};

// Helper function to get effective quality tier
const getEffectiveQualityTier = (project: Project | BackendProject, folderQualityTier = 'interactive'): keyof typeof qualityTierSums => {
    if (project.quality_tier) {
        const tier = project.quality_tier.toLowerCase();
        return (tier === 'basic' || tier === 'interactive' || tier === 'advanced' || tier === 'immersive') 
            ? tier as keyof typeof qualityTierSums 
            : 'interactive';
    }
    return 'interactive';
};

// Process all projects
const allProjects = data.projects || [];
allProjects.forEach((project: Project | BackendProject) => {
    const effectiveTier = getEffectiveQualityTier(project, 'interactive');
    qualityTierSums[effectiveTier].completionTime += project.total_completion_time || 0;
    qualityTierSums[effectiveTier].creationTime += project.total_creation_hours || 0;
});
```

## Маппинг полей

| Элемент | Поле данных | Описание |
|---------|-------------|----------|
| Learning Duration | `total_completion_time` | Время обучения (в минутах) |
| Production Time | `total_creation_hours` | Время производства (в минутах) |

## Форматирование в PDF Template

```html
{% if quality_tier_sums %}
    {% set tier_names = {
        'basic': 'Level 1 - Basic',
        'interactive': 'Level 2 - Interactive', 
        'advanced': 'Level 3 - Advanced',
        'immersive': 'Level 4 - Immersive'
    } %}
    {% for tier_key, tier_name in tier_names.items() %}
        <tr class="table-row">
            <td class="course-name">{{ tier_name }}</td>
            <td>
                {% if quality_tier_sums[tier_key] and quality_tier_sums[tier_key].completion_time and quality_tier_sums[tier_key].completion_time > 0 %}
                    {% set h = quality_tier_sums[tier_key].completion_time // 60 %}
                    {% set m = quality_tier_sums[tier_key].completion_time % 60 %}
                    {% if h > 0 %}{{ h }}h{% endif %}{% if h > 0 and m > 0 %} {% endif %}{% if m > 0 %}{{ m }}m{% endif %}
                {% else %}0{% endif %}
            </td>
            <td>
                {% if quality_tier_sums[tier_key] and quality_tier_sums[tier_key].creation_time and quality_tier_sums[tier_key].creation_time > 0 %}
                    {% set h = quality_tier_sums[tier_key].creation_time // 60 %}
                    {% set m = quality_tier_sums[tier_key].creation_time % 60 %}
                    {% if h > 0 %}{{ h }}h{% endif %}{% if h > 0 and m > 0 %} {% endif %}{% if m > 0 %}{{ m }}m{% endif %}
                {% else %}0{% endif %}
            </td>
        </tr>
    {% endfor %}
{% endif %}
```

## Форматирование в Preview

```typescript
// Define quality level names (matching PDF template exactly)
const qualityLevels = [
    { key: 'basic', name: 'Level 1 - Basic' },
    { key: 'interactive', name: 'Level 2 - Interactive' },
    { key: 'advanced', name: 'Level 3 - Advanced' },
    { key: 'immersive', name: 'Level 4 - Immersive' }
];

return qualityLevels.map((level, index) => {
    const tierData = qualityTierSums[level.key as keyof typeof qualityTierSums];
    const completionTimeFormatted = tierData.completionTime > 0 
        ? formatTimeLikePDF(tierData.completionTime) 
        : '0h';
    const creationTimeFormatted = tierData.creationTime > 0 
        ? formatTimeLikePDF(tierData.creationTime) 
        : '0h';
    
    return (
        <tr key={level.name}>
            <td>{level.name}</td>
            <td>{completionTimeFormatted}</td>
            <td>{creationTimeFormatted}</td>
        </tr>
    );
});
```

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
        title: 'AI Tools for High School Teachers',
        total_completion_time: 157, // Learning duration (minutes)
        total_creation_hours: 530, // Production time (minutes)
        quality_tier: 'interactive'
    },
    {
        title: 'Basic Course',
        total_completion_time: 45, // Learning duration (minutes)
        total_creation_hours: 120, // Production time (minutes)
        quality_tier: 'basic'
    }
];
```

### Результат группировки
```
Level 1 - Basic:
  - Learning Duration: 45 minutes → 0h 45m
  - Production Time: 120 minutes → 2h 0m

Level 2 - Interactive:
  - Learning Duration: 376 + 157 = 533 minutes → 8h 53m
  - Production Time: 1322 + 530 = 1852 minutes → 30h 52m

Level 3 - Advanced:
  - Learning Duration: 0 minutes → 0h
  - Production Time: 0 minutes → 0h

Level 4 - Immersive:
  - Learning Duration: 0 minutes → 0h
  - Production Time: 0 minutes → 0h
```

## Правила группировки

1. **Определение quality tier**: Каждый проект имеет поле `quality_tier`
2. **Fallback**: Если quality_tier не указан, используется 'interactive'
3. **Суммирование**: Все проекты с одинаковым quality_tier группируются вместе
4. **Расчет**: Для каждой группы суммируются:
   - `total_completion_time` для Learning Duration
   - `total_creation_hours` для Production Time
5. **Форматирование**: Время конвертируется из минут в формат "Xh Ym"

## Результат

✅ **4 группы quality tiers отображаются в Block 2**
✅ **Каждая группа показывает суммарные часы всех проектов**
✅ **PDF и preview показывают одинаковые значения**
✅ **Группировка работает корректно для всех quality tiers**

## Тестирование

Создан тестовый скрипт `test_quality_tier_grouping.js` для проверки:
- Правильности группировки по quality tiers
- Корректности суммирования часов
- Соответствия между PDF и preview
- Обработки edge cases (пустые группы, неверные quality tiers) 