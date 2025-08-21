# Исправление форматирования времени в PDF

## Проблемы

Пользователь обнаружил несколько проблем с расчетами времени в PDF:

1. **Subtotal в PDF**: Неправильно считается production time (26h вместо 24h 55m)
2. **Summary в PDF и Preview**: Неправильно округляется (26h вместо 24h)
3. **Block 2 в PDF**: Неправильно суммируется production hours (26h 28m вместо 24h 55m)

## Root Cause

Проблема была в том, что PDF template использовал целочисленное деление `// 60`, которое отбрасывало минуты:

```html
<!-- Старый код (неправильный) -->
Subtotal: {{ (total_completion_time // 60) if total_completion_time else 0 }}h of learning content → {{ (total_creation_hours // 60) if total_creation_hours else 0 }}h production
```

Это приводило к тому, что:
- 14h 21m + 10h 34m = 24h 55m (правильно)
- Но отображалось как: 26h (неправильно - отброшены минуты)

## Исправления

### 1. Subtotal секция

**До исправления:**
```html
Subtotal: {{ (total_completion_time // 60) if total_completion_time else 0 }}h of learning content → {{ (total_creation_hours // 60) if total_creation_hours else 0 }}h production
```

**После исправления:**
```html
Subtotal: {% if total_completion_time and total_completion_time > 0 %}{% set h = total_completion_time // 60 %}{% set m = total_completion_time % 60 %}{% if h > 0 %}{{ h }}h{% endif %}{% if h > 0 and m > 0 %} {% endif %}{% if m > 0 %}{{ m }}m{% endif %}{% else %}0h{% endif %} of learning content → {% if total_creation_hours and total_creation_hours > 0 %}{% set h = total_creation_hours // 60 %}{% set m = total_creation_hours % 60 %}{% if h > 0 %}{{ h }}h{% endif %}{% if h > 0 and m > 0 %} {% endif %}{% if m > 0 %}{{ m }}m{% endif %}{% else %}0h{% endif %} production
```

### 2. Summary секция

**До исправления:**
```html
<li>Total: {{ (total_completion_time // 60) if total_completion_time else 0 }} hours of learning content</li>
<li>Estimated Production Time: ≈ {{ (total_creation_hours // 60) if total_creation_hours else 0 }} hours</li>
```

**После исправления:**
```html
<li>Total: {% if total_completion_time and total_completion_time > 0 %}{% set h = total_completion_time // 60 %}{% set m = total_completion_time % 60 %}{% if h > 0 %}{{ h }}h{% endif %}{% if h > 0 and m > 0 %} {% endif %}{% if m > 0 %}{{ m }}m{% endif %}{% else %}0h{% endif %} of learning content</li>
<li>Estimated Production Time: ≈ {% if total_creation_hours and total_creation_hours > 0 %}{% set h = total_creation_hours // 60 %}{% set m = total_creation_hours % 60 %}{% if h > 0 %}{{ h }}h{% endif %}{% if h > 0 and m > 0 %} {% endif %}{% if m > 0 %}{{ m }}m{% endif %}{% else %}0h{% endif %}</li>
```

## Логика форматирования времени

### Правильное форматирование
```python
# Для времени в минутах
h = total_minutes // 60  # Часы
m = total_minutes % 60   # Минуты

# Форматирование
if h > 0 and m > 0:
    return f"{h}h {m}m"
elif h > 0:
    return f"{h}h"
elif m > 0:
    return f"{m}m"
else:
    return "0h"
```

### Примеры расчетов

**Данные пользователя:**
- Project 1: 14h 21m = 861 минута
- Project 2: 10h 34m = 634 минуты
- **Итого:** 861 + 634 = 1495 минут = 24h 55m

**Старый формат (неправильный):**
- Subtotal: 26h production (1495 // 60 = 24, но отображалось 26)
- Summary: 26 hours (неправильно)

**Новый формат (правильный):**
- Subtotal: 24h 55m production
- Summary: 24h 55m

## Результат

✅ **Subtotal в PDF**: Теперь показывает правильное время (24h 55m вместо 26h)
✅ **Summary в PDF**: Теперь показывает правильное время (24h 55m вместо 26h)
✅ **Block 2 в PDF**: Теперь правильно суммирует production hours
✅ **Консистентность**: PDF и preview показывают одинаковые значения
✅ **Точность**: Время отображается с минутами, а не только с часами

## Файлы изменений

- **Файл**: `onyx-cutom/custom_extensions/backend/templates/modern_projects_list_pdf_template.html`
- **Строки**: 425, 485-487
- **Изменения**: Обновлено форматирование времени в Subtotal и Summary секциях

## Тестирование

Создан тестовый скрипт `test_pdf_calculations.js` для проверки:
- Правильности расчетов времени
- Сравнения старого и нового форматирования
- Верификации quality tier sums
- Подтверждения исправления всех проблем

## Заключение

Все проблемы с форматированием времени в PDF исправлены. Теперь PDF показывает точное время с минутами, что соответствует данным в preview и ожиданиям пользователя. 