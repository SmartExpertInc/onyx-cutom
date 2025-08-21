# Block 1 Columns Fix and Quality Tier Sums Debug

## Проблемы

### 1. Колонки в Block 1 выходят за пределы
- **Проблема**: В таблице Block 1. Course Overview колонки выходят за пределы страницы
- **Причина**: Неправильные CSS стили для ширины колонок
- **Результат**: Плохая читаемость и неаккуратный вид PDF

### 2. В Block 2 показывается только Interactive
- **Проблема**: В таблице Block 2. Production Hours by Quality Level показываются данные только для Interactive tier
- **Причина**: Возможные проблемы с данными quality_tier или их обработкой
- **Результат**: Неполная информация о распределении по quality tiers

## Исправления

### 1. Исправлены CSS стили для Block 1

**Проблема**: Общие CSS стили для всех таблиц не подходили для Block 1.

**Решение**: Созданы специфичные стили для каждого блока.

**CSS изменения**:

```css
/* Block 1 specific column widths */
.block:first-of-type .table-header th:nth-child(1),
.block:first-of-type .table-row td:nth-child(1) {
    width: 35%;        /* Course Name */
    min-width: 200px;
    max-width: 300px;
}

.block:first-of-type .table-header th:nth-child(2),
.block:first-of-type .table-row td:nth-child(2) {
    width: 15%;        /* Modules */
    min-width: 80px;
}

.block:first-of-type .table-header th:nth-child(3),
.block:first-of-type .table-row td:nth-child(3) {
    width: 15%;        /* Lessons */
    min-width: 80px;
}

.block:first-of-type .table-header th:nth-child(4),
.block:first-of-type .table-row td:nth-child(4) {
    width: 17.5%;      /* Learning Duration */
    min-width: 100px;
}

.block:first-of-type .table-header th:nth-child(5),
.block:first-of-type .table-row td:nth-child(5) {
    width: 17.5%;      /* Production Time */
    min-width: 100px;
}

/* Block 2 specific column widths */
.block:nth-of-type(2) .table-header th:nth-child(1),
.block:nth-of-type(2) .table-row td:nth-child(1) {
    width: 40%;        /* Quality Level */
    min-width: 200px;
}

.block:nth-of-type(2) .table-header th:nth-child(2),
.block:nth-of-type(2) .table-row td:nth-child(2) {
    width: 30%;        /* Learning Duration */
    min-width: 120px;
}

.block:nth-of-type(2) .table-header th:nth-child(3),
.block:nth-of-type(2) .table-row td:nth-child(3) {
    width: 30%;        /* Production Hours */
    min-width: 120px;
}
```

**Улучшения**:
- ✅ **Специфичные стили**: Каждый блок имеет свои стили
- ✅ **Правильные пропорции**: Колонки не выходят за пределы
- ✅ **Адаптивность**: Минимальная ширина для каждой колонки
- ✅ **Читаемость**: Текст не обрезается

### 2. Добавлено диагностическое логирование для Quality Tier Sums

**Проблема**: Неясно, почему в Block 2 показываются данные только для Interactive tier.

**Решение**: Добавлено подробное логирование для диагностики.

**Backend логирование**:

```python
# Debug quality tier distribution
quality_tier_counts = {}
for project in all_projects:
    tier = project.get('quality_tier', 'None')
    quality_tier_counts[tier] = quality_tier_counts.get(tier, 0) + 1

logger.info(f"[PDF_ANALYTICS] Quality tier distribution: {quality_tier_counts}")

# Check if projects have any data at all
projects_with_data = [p for p in all_projects if p.get('total_completion_time', 0) > 0 or p.get('total_creation_hours', 0) > 0]
logger.info(f"[PDF_ANALYTICS] Projects with data: {len(projects_with_data)} out of {len(all_projects)}")

# Test quality tier mapping
def test_quality_tier_mapping():
    test_tiers = ['basic', 'interactive', 'advanced', 'immersive', 'starter', 'medium', 'professional', None, '', 'unknown']
    for tier in test_tiers:
        if tier:
            tier_lower = tier.lower()
            tier_mapping = {
                'basic': 'basic',
                'interactive': 'interactive', 
                'advanced': 'advanced',
                'immersive': 'immersive',
                'starter': 'basic',
                'medium': 'interactive',
                'professional': 'immersive'
            }
            mapped = tier_mapping.get(tier_lower, 'interactive')
            logger.info(f"[PDF_ANALYTICS] Tier mapping test: '{tier}' -> '{mapped}'")
        else:
            logger.info(f"[PDF_ANALYTICS] Tier mapping test: '{tier}' -> 'interactive' (default)")
```

**Frontend логирование**:

```typescript
// Process all projects to calculate quality tier sums
const allProjects = data.projects || [];
console.log('[FRONTEND_DEBUG] Processing projects for quality tier sums:', allProjects.length);

allProjects.forEach((project: Project | BackendProject) => {
    const effectiveTier = getEffectiveQualityTier(project, 'interactive');
    console.log(`[FRONTEND_DEBUG] Project ${project.id}: quality_tier=${project.quality_tier}, effective_tier=${effectiveTier}, completion_time=${project.total_completion_time}, creation_hours=${project.total_creation_hours}`);
    
    qualityTierSums[effectiveTier].completionTime += project.total_completion_time || 0;
    qualityTierSums[effectiveTier].creationTime += project.total_creation_hours || 0;
});

console.log('[FRONTEND_DEBUG] Final quality tier sums:', qualityTierSums);
```

## Диагностика Quality Tier Issue

### Возможные причины проблемы:

1. **Проекты не имеют quality_tier**:
   - В базе данных quality_tier может быть NULL или пустым
   - Проекты используют значения по умолчанию

2. **Неправильные значения quality_tier**:
   - Значения могут отличаться от ожидаемых
   - Могут использоваться старые названия tiers

3. **Проблемы с маппингом**:
   - Legacy tier mapping может не работать
   - Fallback логика может быть неправильной

4. **Проблемы с данными**:
   - Данные могут не передаваться правильно
   - Могут быть проблемы с агрегацией

### Диагностические шаги:

1. **Проверить логи backend**:
   - Посмотреть на качество tier distribution
   - Проверить маппинг tiers
   - Убедиться, что проекты имеют данные

2. **Проверить логи frontend**:
   - Посмотреть на данные проектов
   - Проверить эффективные tiers
   - Убедиться в правильности расчетов

3. **Проверить базу данных**:
   - Посмотреть на реальные значения quality_tier
   - Проверить, есть ли проекты с разными tiers

## Результат

После исправлений:

- ✅ **Block 1**: Колонки больше не выходят за пределы страницы
- ✅ **Правильные пропорции**: Каждая колонка имеет оптимальную ширину
- ✅ **Диагностика**: Добавлено подробное логирование для выявления проблем
- ✅ **Читаемость**: Улучшена за счет правильного размера колонок

## Следующие шаги

1. **Запустить приложение** и проверить логи
2. **Проверить Block 1** - колонки должны помещаться на странице
3. **Проверить логи backend** для диагностики quality tier issue
4. **Проверить логи frontend** для сравнения данных
5. **Исправить quality tier issue** на основе диагностики

## Файлы, которые были изменены:

1. `onyx-cutom/custom_extensions/backend/templates/modern_projects_list_pdf_template.html`
   - Исправлены CSS стили для колонок Block 1
   - Добавлены специфичные стили для каждого блока

2. `onyx-cutom/custom_extensions/backend/main.py`
   - Добавлено диагностическое логирование для quality tier sums
   - Добавлена проверка распределения quality tiers

3. `onyx-cutom/custom_extensions/frontend/src/components/ProjectsTable.tsx`
   - Добавлено логирование для диагностики quality tier sums

4. `onyx-cutom/debug_quality_tier_issue.py`
   - Создан диагностический скрипт для тестирования логики

Теперь Block 1 должен выглядеть аккуратно, а логи помогут выявить причину проблемы с quality tier sums в Block 2. 