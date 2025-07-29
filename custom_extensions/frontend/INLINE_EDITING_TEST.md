# Тест Inline Editing для слайдів

## Що було зроблено

### 1. Видалено кнопку "Edit Content"
- Кнопка "Edit Content" більше не показується
- Редагування включається автоматично при `isEditable={true}`

### 2. Реалізовано inline editing безпосередньо в тексті
- Користувач може клікати на заголовок слайду → стає input полем
- Користувач може клікати на контент слайду → стає textarea полем
- Автозбереження при втраті фокусу (onBlur)

### 3. Копійовано логіку з page.tsx
- `handleTextChange` - оновлення даних
- `handleAutoSave` - автозбереження через 2 секунди
- `autoSaveTimeoutRef` - таймер для автозбереження
- Глибока копія даних для іммутабельності

### 4. Передача даних
- `SmartSlideDeckViewer` отримує `editableData` замість `slideDeckData`
- `isEditable={isEditing}` - режим редагування з page.tsx
- `onSave` оновлює `editableData` і викликає `handleAutoSave`

## Як тестувати

1. Відкрийте слайд-дек
2. Натисніть кнопку "Edit Content" (загальна кнопка редагування)
3. Клікніть на заголовок слайду → повинен стати input полем
4. Клікніть на контент слайду → повинен стати textarea полем
5. Відредагуйте текст
6. Натисніть Enter або клікніть поза полем → збереження
7. Перевірте консоль браузера для логів

## Очікувані логи в консолі

```
Field clicked: title isEditable: true
Field save: title newValue: Новий заголовок
handleTextChange called with: { slideId: "slide-1", fieldPath: "title", newValue: "Новий заголовок" }
handleTextChange: Updated deck: {...}
Auto-save timeout triggered for slide: slide-1 field: title
Auto-save triggered
Auto-save: Sending data to onSave
```

## Ендпоінт для збереження

Використовується існуючий ендпоінт:
- `PUT /api/custom/projects/update/{project_id}`
- Приймає `ProjectUpdateRequest` з `microProductContent`
- Оновлює `microproduct_content` в базі даних

## Проблеми для вирішення

1. **Linter errors** - потрібно встановити типи для React/Next.js
2. **NodeJS namespace** - потрібно встановити @types/node
3. **JSX elements** - потрібно налаштувати TypeScript конфігурацію

## Наступні кроки

1. Виправити linter errors
2. Протестувати збереження на сервері
3. Додати індикатор збереження
4. Додати обробку помилок
5. Розширити на інші шаблони слайдів 