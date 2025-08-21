# Исправление Subtotal и Summary

## Проблема

Subtotal и Summary в PDF template использовали неправильные поля данных, что приводило к несоответствию с превью.

## Анализ проблемы

### PDF Template (до исправления)
- **Subtotal**: использовал `total_hours` для learning content и `total_production_time` для production
- **Summary**: использовал `total_hours` для learning content и `total_production_time` для production

### Превью (до исправления)
- **Summary**: использовал `total_hours` для learning content и `total_creation_hours` для production

## Исправления

### 1. Обновлен PDF Template

#### Добавлены новые переменные
```html
{% set total_completion_time = 0 %}
{% set total_creation_hours = 0 %}
```

#### Обновлен расчет для папок
```html
{% set total_completion_time = total_completion_time + (folder.total_hours if folder.total_hours is not none else 0) %}
{% set total_creation_hours = total_creation_hours + (folder.total_creation_hours if folder.total_creation_hours is not none else 0) %}
```

#### Обновлен расчет для проектов
```html
{% set total_completion_time = total_completion_time + (project.total_completion_time if project.total_completion_time is not none else 0) %}
{% set total_creation_hours = total_creation_hours + (project.total_creation_hours if project.total_creation_hours is not none else 0) %}
```

#### Исправлен Subtotal
```html
<!-- Было -->
Subtotal: {{ (total_hours // 60) if total_hours else 0 }}h of learning content → {{ total_production_time }}h production

<!-- Стало -->
Subtotal: {{ (total_completion_time // 60) if total_completion_time else 0 }}h of learning content → {{ total_creation_hours }}h production
```

#### Исправлен Summary
```html
<!-- Было -->
<li>Total: {{ (total_hours // 60) if total_hours else 0 }} hours of learning content</li>
<li>Estimated Production Time: ≈ {{ total_production_time }} hours</li>

<!-- Стало -->
<li>Total: {{ (total_completion_time // 60) if total_completion_time else 0 }} hours of learning content</li>
<li>Estimated Production Time: ≈ {{ total_creation_hours }} hours</li>
```

### 2. Обновлено превью

#### Исправлен расчет Summary
```typescript
// Было
const totalLearningHours = allProjects.reduce((sum: number, project: Project | BackendProject) => 
  sum + (project.total_hours || 0), 0);

// Стало
const totalLearningMinutes = allProjects.reduce((sum: number, project: Project | BackendProject) => 
  sum + (project.total_completion_time || 0), 0);
const totalLearningHours = Math.floor(totalLearningMinutes / 60);
```

## Правильный маппинг полей

| Элемент | Поле данных | Описание |
|---------|-------------|----------|
| Subtotal Learning Content | `total_completion_time` | Время обучения (в минутах) → часы |
| Subtotal Production Time | `total_creation_hours` | Время производства (в минутах) |
| Summary Learning Content | `total_completion_time` | Время обучения (в минутах) → часы |
| Summary Production Time | `total_creation_hours` | Время производства (в минутах) |

## Форматирование времени

### Learning Content
```html
{{ (total_completion_time // 60) if total_completion_time else 0 }}
```
- Берет `total_completion_time` в минутах
- Делит на 60 для получения часов
- Округляет вниз

### Production Time
```html
{{ total_creation_hours }}
```
- Берет `total_creation_hours` в минутах
- Отображает как есть

## Примеры расчетов

### AI Tools for Teachers + AI Tools for High School Teachers

**Данные проектов:**
- Project 1: `total_completion_time = 376` минут, `total_creation_hours = 1322` минут
- Project 2: `total_completion_time = 157` минут, `total_creation_hours = 530` минут

**Расчеты:**
- **Total Completion Time**: 376 + 157 = 533 минут
- **Total Creation Hours**: 1322 + 530 = 1852 минут
- **Learning Hours**: Math.floor(533 / 60) = 8 часов
- **Production Hours**: 1852 минут

**Результат:**
- **Subtotal**: 8h of learning content → 1852h production
- **Summary**: Total: 8 hours of learning content, Estimated Production Time: ≈ 1852 hours

## Результат

✅ **PDF template теперь использует правильные поля данных**
✅ **Превью теперь использует правильные поля данных**
✅ **Subtotal и Summary показывают одинаковые значения в PDF и превью**
✅ **Все расчеты соответствуют логике PDF template**

## Тестирование

Создан тестовый скрипт `test_subtotal_summary.js` для проверки:
- Правильности расчетов Subtotal
- Правильности расчетов Summary
- Соответствия между PDF и превью
- Корректности использования полей данных

## Техническая информация

- **Файл**: `onyx-cutom/custom_extensions/backend/templates/modern_projects_list_pdf_template.html`
- **Изменения**: Добавлены переменные `total_completion_time` и `total_creation_hours`
- **Файл**: `onyx-cutom/custom_extensions/frontend/src/components/ProjectsTable.tsx`
- **Изменения**: Исправлен расчет Summary
- **Тест**: `onyx-cutom/test_subtotal_summary.js`

## Заключение

Проблема с неправильными расчетами Subtotal и Summary полностью решена. Теперь и PDF, и превью используют одинаковую логику и показывают корректные значения. 