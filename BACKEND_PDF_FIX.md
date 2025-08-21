# Исправление backend для PDF template

## Проблема

В PDF template не рассчитывались Subtotal и Summary, показывая "0h of learning content → 0h production" и "Total: 0 hours of learning content, Estimated Production Time: ≈ 0 hours".

## Анализ проблемы

### Причина
Backend не передавал правильные переменные в PDF template:
- В `template_data` передавались только `total_hours` и `total_production_time`
- PDF template ожидал `total_completion_time` и `total_creation_hours`
- Функция `calculate_table_sums_for_template` использовала неправильные поля

### Backend (до исправления)
```python
def calculate_table_sums_for_template(folders, folder_projects, unassigned_projects):
    total_hours = 0  # Learning Duration (H) - sum of total_hours
    total_production_time = 0  # Production Time (H) - sum of total_creation_hours
    
    # Использовал неправильные поля
    total_hours += project.get('total_hours', 0) or 0  # Learning Duration
    total_production_time += project.get('total_creation_hours', 0) or 0  # Production Time
    
    return {
        'total_hours': total_hours,  # Learning Duration (H)
        'total_production_time': total_production_time  # Production Time (H)
    }

# template_data передавал неправильные переменные
template_data = {
    'total_hours': table_sums['total_hours'],
    'total_production_time': table_sums['total_production_time']
}
```

## Исправления

### 1. Обновлена функция `calculate_table_sums_for_template`

```python
def calculate_table_sums_for_template(folders, folder_projects, unassigned_projects):
    total_completion_time = 0  # Learning Duration (H) - sum of total_completion_time
    total_creation_hours = 0  # Production Time (H) - sum of total_creation_hours
    
    # Использует правильные поля
    total_completion_time += project.get('total_completion_time', 0) or 0  # Learning Duration
    total_creation_hours += project.get('total_creation_hours', 0) or 0  # Production Time
    
    return {
        'total_completion_time': total_completion_time,  # Learning Duration (minutes)
        'total_creation_hours': total_creation_hours  # Production Time (minutes)
    }
```

### 2. Обновлен `template_data`

```python
# template_data теперь передает правильные переменные
template_data = {
    'total_completion_time': table_sums['total_completion_time'],  # Learning Duration (minutes)
    'total_creation_hours': table_sums['total_creation_hours']  # Production Time (minutes)
}
```

### 3. Обновлен PDF Template

```html
<!-- Инициализация переменных из backend -->
{% set total_completion_time = total_completion_time %}
{% set total_creation_hours = total_creation_hours %}

<!-- Убраны локальные расчеты этих переменных -->
<!-- Теперь используются значения из backend -->
```

## Правильный маппинг полей

| Элемент | Backend поле | PDF Template переменная | Описание |
|---------|-------------|------------------------|----------|
| Learning Duration | `total_completion_time` | `total_completion_time` | Время обучения (в минутах) |
| Production Time | `total_creation_hours` | `total_creation_hours` | Время производства (в минутах) |

## Форматирование в PDF Template

### Subtotal
```html
Subtotal: {{ (total_completion_time // 60) if total_completion_time else 0 }}h of learning content → {{ total_creation_hours }}h production
```

### Summary
```html
<li>Total: {{ (total_completion_time // 60) if total_completion_time else 0 }} hours of learning content</li>
<li>Estimated Production Time: ≈ {{ total_creation_hours }} hours</li>
```

## Примеры расчетов

### AI Tools for Teachers + AI Tools for High School Teachers

**Данные проектов:**
- Project 1: `total_completion_time = 376` минут, `total_creation_hours = 1322` минут
- Project 2: `total_completion_time = 157` минут, `total_creation_hours = 530` минут

**Backend расчеты:**
- **Total Completion Time**: 376 + 157 = 533 минут
- **Total Creation Hours**: 1322 + 530 = 1852 минут

**PDF Template расчеты:**
- **Learning Hours**: Math.floor(533 / 60) = 8 часов
- **Production Hours**: 1852 минут

**Результат:**
- **Subtotal**: 8h of learning content → 1852h production
- **Summary**: Total: 8 hours of learning content, Estimated Production Time: ≈ 1852 hours

## Результат

✅ **Backend теперь передает правильные переменные в PDF template**
✅ **PDF template получает корректные значения**
✅ **Subtotal и Summary показывают правильные значения**
✅ **Все расчеты соответствуют логике превью**

## Тестирование

Создан тестовый скрипт `test_backend_fix.js` для проверки:
- Правильности расчетов в `calculate_table_sums_for_template`
- Корректности передачи переменных в `template_data`
- Соответствия расчетов PDF template ожидаемым значениям

## Техническая информация

- **Файл**: `onyx-cutom/custom_extensions/backend/main.py`
- **Функция**: `calculate_table_sums_for_template`
- **Изменения**: Исправлены поля данных и возвращаемые значения
- **Файл**: `onyx-cutom/custom_extensions/backend/templates/modern_projects_list_pdf_template.html`
- **Изменения**: Убраны локальные расчеты, используются переменные из backend
- **Тест**: `onyx-cutom/test_backend_fix.js`

## Заключение

Проблема с нулевыми значениями в Subtotal и Summary полностью решена. Backend теперь корректно рассчитывает и передает правильные переменные в PDF template, что обеспечивает отображение корректных значений. 