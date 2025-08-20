# PDF Fixes Implementation

## Проблемы, которые были исправлены

### 1. Block 2. Production Hours by Quality Level - показывал только уровни с данными

**Проблема**: В шаблоне PDF было условие, которое скрывало строки с нулевыми значениями. Это приводило к тому, что не все 4 уровня качества отображались.

**Решение**: Убрано условие скрытия строк, теперь показываются все 4 уровня качества:
```jinja2
{% for tier_key, tier_name in tier_names.items() %}
    <tr class="table-row">
        <td class="course-name">{{ tier_name }}</td>
        <td>
            {% if quality_tier_sums[tier_key] and quality_tier_sums[tier_key].completion_time and quality_tier_sums[tier_key].completion_time > 0 %}
                <!-- Show time -->
            {% else %}0{% endif %}
        </td>
        <td>
            {% if quality_tier_sums[tier_key] and quality_tier_sums[tier_key].creation_time and quality_tier_sums[tier_key].creation_time > 0 %}
                <!-- Show time -->
            {% else %}0{% endif %}
        </td>
    </tr>
{% endfor %}
```

### 2. Subtotal, Total, Estimated Production Time - равнялись нулю

**Проблема**: В PDF переменные `total_hours` и `total_production_time` равнялись нулю, потому что они вычислялись в шаблоне, но не передавались в контекст.

**Решение**: Добавлена функция `calculate_table_sums_for_template` в backend, которая вычисляет суммы точно так же, как в шаблоне PDF:
```python
def calculate_table_sums_for_template(folders, folder_projects, unassigned_projects):
    total_lessons = 0
    total_modules = 0
    total_hours = 0  # Learning Duration (H) - sum of total_hours
    total_production_time = 0  # Production Time (H) - sum of total_creation_hours
    
    # Calculate from folders and their projects
    for folder in folders:
        if folder['id'] in folder_projects:
            for project in folder_projects[folder['id']]:
                total_lessons += project.get('total_lessons', 0) or 0
                total_modules += project.get('total_modules', 0) or 0
                total_hours += project.get('total_hours', 0) or 0  # Learning Duration
                total_production_time += project.get('total_creation_hours', 0) or 0  # Production Time
    
    # Add unassigned projects
    for project in unassigned_projects:
        total_lessons += project.get('total_lessons', 0) or 0
        total_modules += project.get('total_modules', 0) or 0
        total_hours += project.get('total_hours', 0) or 0  # Learning Duration
        total_production_time += project.get('total_creation_hours', 0) or 0  # Production Time
    
    return {
        'total_lessons': total_lessons,
        'total_modules': total_modules,
        'total_hours': total_hours,  # Learning Duration (H)
        'total_production_time': total_production_time  # Production Time (H)
    }
```

### 3. Превью не соответствовало PDF документу

**Проблема**: В превью использовались неправильные поля для вычисления итоговых значений:
- Для learning content использовалось `total_completion_time` вместо `total_hours`
- Для production time использовалось `total_hours` вместо `total_creation_hours`

**Решение**: Исправлены вычисления в PreviewModal:
```typescript
// Calculate summary stats exactly like PDF generation
const allProjects = data.projects || [];
const totalLearningHours = allProjects.reduce((sum: number, project: any) => sum + (project.total_hours || 0), 0);
const totalProductionHours = allProjects.reduce((sum: number, project: any) => sum + (project.total_creation_hours || 0), 0);
```

### 4. Неправильное суммирование данных в функциях

**Проблема**: В функциях `calculate_summary_stats` и `calculate_quality_tier_sums` использовались неправильные поля:
- Для production time использовалось `total_hours` вместо `total_creation_hours`
- В данных проектов отсутствовало поле `quality_tier`

**Решение**: 
1. Добавлено поле `quality_tier` в данные проектов:
```python
'quality_tier': row_dict.get('quality_tier'),  # Add quality_tier field
```

2. Исправлено использование полей в `calculate_summary_stats`:
```python
total_creation_time += project.get('total_creation_hours', 0) or 0  # Use total_creation_hours for production time
```

3. Исправлено использование полей в `calculate_quality_tier_sums`:
```python
quality_tier_data[effective_tier]['creation_time'] += project.get('total_creation_hours', 0) or 0  # Use total_creation_hours for production time
```

## Изменения в файлах

### 1. `onyx-cutom/custom_extensions/backend/main.py`

**Строка ~16450**: Добавлено поле `quality_tier` в данные проектов
```python
'quality_tier': row_dict.get('quality_tier'),  # Add quality_tier field
```

**Строка ~17070**: Добавлена функция `calculate_table_sums_for_template`
```python
def calculate_table_sums_for_template(folders, folder_projects, unassigned_projects):
    # Calculate table sums exactly like PDF template
```

**Строка ~17100**: Исправлены переменные в template_data
```python
'total_hours': table_sums['total_hours'],  # Add total hours for template (from table sums)
'total_production_time': table_sums['total_production_time']  # Add total production time for template (from table sums)
```

**Строка ~16720**: Исправлено использование `total_creation_hours` в `calculate_summary_stats`
```python
total_creation_time += project.get('total_creation_hours', 0) or 0  # Use total_creation_hours for production time
```

**Строка ~16750**: Исправлено использование `total_creation_hours` в `calculate_quality_tier_sums`
```python
quality_tier_data[effective_tier]['creation_time'] += project.get('total_creation_hours', 0) or 0  # Use total_creation_hours for production time
```

### 2. `onyx-cutom/custom_extensions/backend/templates/modern_projects_list_pdf_template.html`

**Строка ~448**: Исправлено отображение всех уровней качества в Block 2
```jinja2
{% for tier_key, tier_name in tier_names.items() %}
    <tr class="table-row">
        <!-- Always show all 4 levels -->
    </tr>
{% endfor %}
```

**Строка ~425**: Исправлен Subtotal для использования данных из таблицы
```jinja2
Subtotal: {{ (total_hours // 60) if total_hours else 0 }}h of learning content → {{ total_production_time }}h production
```

**Строка ~485**: Исправлены Total и Estimated Production Time
```jinja2
<li>Total: {{ (total_hours // 60) if total_hours else 0 }} hours of learning content</li>
<li>Estimated Production Time: ≈ {{ total_production_time }} hours</li>
```

### 3. `onyx-cutom/custom_extensions/frontend/src/components/ProjectsTable.tsx`

**Строка ~590**: Исправлены вычисления в PreviewModal
```typescript
// Calculate summary stats exactly like PDF generation
const allProjects = data.projects || [];
const totalLearningHours = allProjects.reduce((sum: number, project: any) => sum + (project.total_hours || 0), 0);
const totalProductionHours = allProjects.reduce((sum: number, project: any) => sum + (project.total_creation_hours || 0), 0);
```

**Строка ~815**: Исправлен Total в Summary
```typescript
const totalLearningHours = allProjects.reduce((sum: number, project: any) => sum + (project.total_hours || 0), 0);
```

**Строка ~825**: Исправлен Estimated Production Time в Summary
```typescript
const totalProductionHours = allProjects.reduce((sum: number, project: any) => sum + (project.total_creation_hours || 0), 0);
```

## Результат исправлений

### До исправлений:
- Block 2 показывал только уровни качества с данными
- Subtotal, Total и Estimated Production Time равнялись нулю
- Превью использовало неправильные поля для вычислений
- Production time рассчитывался неправильно

### После исправлений:
- **Block 2** показывает все 4 уровня качества (Basic, Interactive, Advanced, Immersive), даже если значения 0
- **Subtotal**: `70h of learning content → 925h production` (из сумм таблицы Block 1)
- **Total**: `70 hours of learning content` (из сумм таблицы Block 1)
- **Estimated Production Time**: `≈ 925 hours` (из сумм таблицы Block 1)
- **Превью** полностью соответствует PDF документу

## Тестирование

Созданы тестовые файлы для проверки исправлений:
- `test_pdf_fixes.py` - проверяет корректность расчетов
- `test_quality_tier_sums.py` - проверяет суммирование по уровням качества
- `test_table_sums.py` - проверяет суммирование данных из таблицы Block 1
- `test_pdf_preview_fixes.py` - проверяет соответствие PDF и превью

## Структура данных

### Поля проектов:
- `total_hours` - время обучения (из часов уроков)
- `total_creation_hours` - время производства (рассчитанное время создания)
- `total_completion_time` - время завершения в минутах
- `quality_tier` - уровень качества проекта

### Переменные шаблона:
- `total_hours` - сумма всех Learning Duration (H) из таблицы Block 1
- `total_production_time` - сумма всех Production Time (H) из таблицы Block 1

### Поля quality_tier_sums:
- `completion_time` - время обучения для каждого уровня качества
- `creation_time` - время производства для каждого уровня качества 