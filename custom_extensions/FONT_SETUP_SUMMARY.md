# Настройка шрифтов: Inter для UI, Lora для слайдов

## Что было сделано

Переконфигурирована система шрифтов так, чтобы:
- **Inter** использовался везде в интерфейсе (UI) приложения
- **Lora** использовался только в слайдах презентаций

## Измененные файлы

### 1. `src/styles/inter.css`
**Было:** Файл содержал настройки для Lora (ошибочно назван inter.css)  
**Стало:** 
- Определены @font-face для Inter (Regular, Medium, SemiBold, Bold)
- Глобальное применение Inter для всех элементов
- Специфичное применение для UI компонентов с !important

### 2. `src/styles/lora.css`
**Было:** Lora применялся глобально ко всем элементам  
**Стало:**
- Убрано глобальное применение `* { font-family: 'Lora' }`
- Lora применяется только к специфичным классам слайдов:
  - `.title-element` - для заголовков в слайдах
  - `.slide-title`, `.slide-title-text`, `.slide-title-display`
- Убраны правила для всех h1-h6, которые применялись глобально

### 3. `src/app/globals.css`
**Изменено:**
- `body { font-family: 'Inter', ... }` (было Mont Regular)
- `.chudo-theme-*` классы теперь используют Inter
- `.inter-theme` класс (был `.mont-theme`)

### 4. `src/styles/globals.css`
**Изменено:**
- `* { font-family: 'Inter', ... }` (было Mont Regular)
- `body { font-family: 'Inter', ... }` (было Mont Regular)

### 5. `src/app/layout.tsx`
**Изменено:**
- Обновлены комментарии: "Inter for UI, Lora for slides only"
- Удален импорт Roboto шрифта из Google Fonts

## Как это работает

### Для UI компонентов (весь интерфейс вне слайдов)
1. **inter.css** загружается и устанавливает Inter как шрифт по умолчанию
2. Все кнопки, формы, меню, модальные окна используют Inter
3. Fallback цепочка: `Inter → -apple-system → BlinkMacSystemFont → Segoe UI → Roboto → sans-serif`

### Для слайдов
1. Каждый шаблон слайда может использовать:
   - Тему из `slideThemes.ts` (определяет шрифты через `currentTheme.fonts`)
   - Собственные inline стили (как в ChangeManagementTabsSlideTemplate)
2. **lora.css** применяет Lora только к элементам с классами `.title-element`, `.slide-title` и т.д.
3. Inline стили в шаблонах имеют приоритет и могут переопределять тему

### Пример из ChangeManagementTabsSlideTemplate
```tsx
<div className="change-mgmt-tabs inter-theme" style={slide}>
  <style>{`
    .change-mgmt-tabs *:not(.title-element) {
      font-family: "Inter", ... !important;
    }
    .change-mgmt-tabs .title-element {
      font-family: "Lora", serif !important;
    }
  `}</style>
  {/* Содержимое слайда */}
</div>
```

## Доступные темы слайдов

### Темы с Inter (из slideThemes.ts):
- `dark-purple` - Inter для заголовков и контента
- `light-modern` - Inter для заголовков и контента
- `corporate-blue` - Inter для заголовков и контента
- `chudo-2` - Inter для заголовков и контента
- `forta` - Inter для заголовков и контента
- `forta-2` - Inter для заголовков и контента

### Тема с Lora:
- `chudo-theme` - Lora для заголовков и контента (специально для этой темы)

## Шрифты Inter
Установлены следующие варианты:
- **Regular (400)** - основной текст
- **Medium (500)** - акцентный текст
- **SemiBold (600)** - подзаголовки
- **Bold (700)** - заголовки

## Результат
✅ **Inter** - используется везде в UI приложения (кнопки, формы, меню, таблицы, карточки)  
✅ **Lora** - используется только в слайдах для заголовков (класс `.title-element`)  
✅ Каждый шаблон слайда контролирует свои шрифты через темы или inline стили  
✅ Никаких конфликтов между глобальными стилями и стилями слайдов

## Тестирование
Рекомендуется проверить:
1. Все UI элементы используют Inter
2. Заголовки в слайдах используют Lora (где применим класс `.title-element`)
3. Темы слайдов работают корректно
4. Нет визуальных артефактов или мигания шрифтов при загрузке
