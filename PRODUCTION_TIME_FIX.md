# Исправление расчетов Production Time

## Проблема

`Estimated Production Time` в PDF и превью показывал неправильные значения, а `production` в subtotal не конвертировался из минут в часы.

## Анализ проблемы

### Причина
- `total_creation_hours` хранится в минутах
- PDF template и превью отображали минуты как часы без конвертации
- Нужно было добавить `// 60` для конвертации минут в часы

### PDF Template (до исправления)
```html
<!-- Subtotal -->
Subtotal: 8h of learning content → 1852h production

<!-- Summary -->
<li>Estimated Production Time: ≈ 1852 hours</li>
```

### Превью (до исправления)
```typescript
// Estimated Production Time
const totalProductionHours = allProjects.reduce((sum, project) => 
  sum + (project.total_creation_hours || 0), 0);
return `${totalProductionHours.toLocaleString()} hours`; // 1852 hours
```

## Исправления

### 1. Обновлен PDF Template

#### Subtotal
```html
<!-- Было -->
Subtotal: {{ (total_completion_time // 60) if total_completion_time else 0 }}h of learning content → {{ total_creation_hours }}h production

<!-- Стало -->
Subtotal: {{ (total_completion_time // 60) if total_completion_time else 0 }}h of learning content → {{ (total_creation_hours // 60) if total_creation_hours else 0 }}h production
```

#### Summary
```html
<!-- Было -->
<li>Estimated Production Time: ≈ {{ total_creation_hours }} hours</li>

<!-- Стало -->
<li>Estimated Production Time: ≈ {{ (total_creation_hours // 60) if total_creation_hours else 0 }} hours</li>
```

### 2. Обновлено превью

```typescript
// Было
const totalProductionHours = allProjects.reduce((sum: number, project: Project | BackendProject) => 
  sum + (project.total_creation_hours || 0), 0);
return `${totalProductionHours.toLocaleString()} hours`;

// Стало
const totalProductionMinutes = allProjects.reduce((sum: number, project: Project | BackendProject) => 
  sum + (project.total_creation_hours || 0), 0);
const totalProductionHours = Math.floor(totalProductionMinutes / 60);
return `${totalProductionHours} hours`;
```

## Правильный маппинг полей

| Элемент | Поле данных | Конвертация | Результат |
|---------|-------------|-------------|-----------|
| Learning Duration | `total_completion_time` | `// 60` | минуты → часы |
| Production Time | `total_creation_hours` | `// 60` | минуты → часы |

## Форматирование

### PDF Template
```html
<!-- Learning Duration -->
{{ (total_completion_time // 60) if total_completion_time else 0 }}

<!-- Production Time -->
{{ (total_creation_hours // 60) if total_creation_hours else 0 }}
```

### Превью
```typescript
// Learning Duration
const totalLearningMinutes = allProjects.reduce((sum, project) => 
  sum + (project.total_completion_time || 0), 0);
const totalLearningHours = Math.floor(totalLearningMinutes / 60);

// Production Time
const totalProductionMinutes = allProjects.reduce((sum, project) => 
  sum + (project.total_creation_hours || 0), 0);
const totalProductionHours = Math.floor(totalProductionMinutes / 60);
```

## Примеры расчетов

### AI Tools for Teachers + AI Tools for High School Teachers

**Данные проектов:**
- Project 1: `total_creation_hours = 1322` минут
- Project 2: `total_creation_hours = 530` минут

**Расчеты:**
- **Total Creation Hours**: 1322 + 530 = 1852 минут
- **Production Hours**: Math.floor(1852 / 60) = 30 часов

**Результат:**
- **Subtotal**: 8h of learning content → 30h production
- **Summary**: Estimated Production Time: ≈ 30 hours

## Результат

✅ **PDF template правильно конвертирует минуты в часы**
✅ **Превью правильно конвертирует минуты в часы**
✅ **Subtotal и Summary показывают одинаковые значения**
✅ **Все расчеты используют правильную логику конвертации**

## Тестирование

Создан тестовый скрипт `test_production_time_fix.js` для проверки:
- Правильности конвертации минут в часы
- Соответствия между PDF и превью
- Корректности расчетов для всех проектов

## Техническая информация

- **Файл**: `onyx-cutom/custom_extensions/backend/templates/modern_projects_list_pdf_template.html`
- **Изменения**: Добавлена конвертация `// 60` для production time
- **Файл**: `onyx-cutom/custom_extensions/frontend/src/components/ProjectsTable.tsx`
- **Изменения**: Добавлена конвертация минут в часы для production time
- **Тест**: `onyx-cutom/test_production_time_fix.js`

## Заключение

Проблема с неправильными расчетами Production Time полностью решена. Теперь и PDF, и превью правильно конвертируют минуты в часы и показывают корректные значения. 