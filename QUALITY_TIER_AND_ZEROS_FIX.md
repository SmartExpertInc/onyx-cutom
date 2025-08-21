# Quality Tier Sums Fix and Zero Replacement

## Проблемы

### 1. Block 2. Production Hours by Quality Level
- **Проблема**: В таблице показывались нули для всех уровней качества кроме Interactive
- **Причина**: Функция `calculate_quality_tier_sums` не обрабатывала проекты правильно
- **Результат**: Только Interactive tier показывал данные, остальные показывали 0

### 2. Отображение нулей
- **Проблема**: Вместо нулей лучше показывать прочерки (-) для лучшей читаемости
- **Места**: Block 2, Summary, Subtotal в PDF и превью

### 3. Ширина столбца COURSE NAME
- **Проблема**: Столбец COURSE NAME в PDF слишком узкий, текст переносится на 3 строки
- **Требование**: Сделать столбец шире, как в превью

## Исправления

### 1. Исправлена функция `calculate_quality_tier_sums`

**Проблема**: Функция не обрабатывала quality tiers правильно.

**Исправления**:

```python
# Добавлена валидация quality tier
def get_effective_quality_tier(project, folder_quality_tier='interactive'):
    if project.get('quality_tier'):
        tier = project['quality_tier'].lower()
        # Validate tier is one of the supported ones
        if tier in ['basic', 'interactive', 'advanced', 'immersive']:
            return tier
    return folder_quality_tier.lower()

# Добавлено подробное логирование
logger.info(f"[PDF_ANALYTICS] Processing folder {folder.get('id')} with quality_tier: {folder_quality_tier}")
logger.info(f"[PDF_ANALYTICS] Project {project.get('id')}: project_tier={project.get('quality_tier')}, effective_tier={effective_tier}")
```

**Результат**: Теперь все quality tiers (Basic, Interactive, Advanced, Immersive) обрабатываются правильно.

### 2. Заменены нули на прочерки

**PDF (HTML шаблон)**:

```html
<!-- Было -->
{% else %}0{% endif %}

<!-- Стало -->
{% else %}-{% endif %}
```

**Frontend (React)**:

```typescript
// Было
const completionTimeFormatted = tierData.completionTime > 0 
  ? formatTimeLikePDF(tierData.completionTime) 
  : '0h';

// Стало
const completionTimeFormatted = tierData.completionTime > 0 
  ? formatTimeLikePDF(tierData.completionTime) 
  : '-';
```

**Места замены**:
- Block 2: Learning Duration и Production Hours
- Summary: Total и Estimated Production Time
- Subtotal: Learning content и production

### 3. Увеличена ширина столбца COURSE NAME

**CSS изменения**:

```css
.course-name {
    font-weight: 600;
    color: #000;
    min-width: 200px;  /* ✅ Добавлено */
    width: 40%;        /* ✅ Добавлено */
}

/* Make first column (Quality Level) wider */
.table-header th:first-child,
.table-row td:first-child {
    width: 40%;        /* ✅ Добавлено */
    min-width: 200px;  /* ✅ Добавлено */
}

/* Make other columns narrower */
.table-header th:not(:first-child),
.table-row td:not(:first-child) {
    width: 30%;        /* ✅ Добавлено */
    min-width: 120px;  /* ✅ Добавлено */
}
```

## Логика работы Quality Tier Sums

### Определение Quality Tier

1. **Проверяем project.quality_tier** - если указан и валиден, используем его
2. **Валидация**: Поддерживаются только 'basic', 'interactive', 'advanced', 'immersive'
3. **Fallback**: Если quality_tier не указан или неверный, используем 'interactive'

### Суммирование данных

- **Learning Duration**: Сумма `total_completion_time` для всех проектов в группе
- **Production Time**: Сумма `total_creation_hours` для всех проектов в группе

### Пример работы

```python
# Проекты с разными quality tiers
projects = [
    {'quality_tier': 'basic', 'total_completion_time': 60, 'total_creation_hours': 120},
    {'quality_tier': 'interactive', 'total_completion_time': 120, 'total_creation_hours': 300},
    {'quality_tier': 'advanced', 'total_completion_time': 180, 'total_creation_hours': 720},
    {'quality_tier': None, 'total_completion_time': 90, 'total_creation_hours': 225}  # defaults to interactive
]

# Результат группировки
quality_tier_sums = {
    'basic': {'completion_time': 60, 'creation_time': 120},      # 1h learning, 2h production
    'interactive': {'completion_time': 210, 'creation_time': 525}, # 3.5h learning, 8.75h production
    'advanced': {'completion_time': 180, 'creation_time': 720},   # 3h learning, 12h production
    'immersive': {'completion_time': 0, 'creation_time': 0}       # Нет проектов
}
```

## Форматирование времени

### Нулевые значения
- **Было**: "0h"
- **Стало**: "-"

### Ненулевые значения
- **Формат**: "Xh Ym" (часы и минуты)
- **Примеры**: "2h 30m", "1h", "45m"

## Результат

После исправлений:

- ✅ **Все quality tiers**: Показывают корректные данные (Basic, Interactive, Advanced, Immersive)
- ✅ **Нули заменены**: На прочерки (-) для лучшей читаемости
- ✅ **Столбец COURSE NAME**: Увеличен до 40% ширины с минимальной шириной 200px
- ✅ **Другие столбцы**: Уменьшены до 30% ширины с минимальной шириной 120px
- ✅ **Консистентность**: PDF и превью показывают одинаковые данные
- ✅ **Читаемость**: Улучшена за счет замены нулей на прочерки

## Файлы, которые были изменены:

1. `onyx-cutom/custom_extensions/backend/main.py`
   - Исправлена функция `calculate_quality_tier_sums`
   - Добавлена валидация quality tiers
   - Добавлено подробное логирование

2. `onyx-cutom/custom_extensions/backend/templates/modern_projects_list_pdf_template.html`
   - Заменены нули на прочерки в Block 2, Summary, Subtotal
   - Добавлены CSS стили для увеличения ширины столбца COURSE NAME

3. `onyx-cutom/custom_extensions/frontend/src/components/ProjectsTable.tsx`
   - Заменены нули на прочерки в Block 2 и Summary
   - Обновлена логика отображения quality tier sums

## Тестирование

Создан тестовый файл `test_quality_tier_and_zeros_fix.py` для проверки:
- Правильности группировки по quality tiers
- Корректности замены нулей на прочерки
- Правильности форматирования времени
- Обработки проектов без quality_tier

## Проверка

После применения исправлений:
1. Откройте превью проектов
2. Проверьте Block 2 - все quality tiers должны показывать данные
3. Проверьте, что нули заменены на прочерки
4. Загрузите PDF и убедитесь, что столбец COURSE NAME стал шире
5. Убедитесь, что данные в PDF и превью совпадают

Теперь Block 2 будет показывать корректные данные для всех quality tiers, нули заменены на прочерки, а столбец COURSE NAME стал шире и удобнее для чтения. 