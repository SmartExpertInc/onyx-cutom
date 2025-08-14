# Instructions to Update TextPresentationDisplay.tsx

## Проблема
Зараз при натисканні на шестерню відкривається модальне вікно розширених налаштувань, а потрібно щоб відкривався випадаючий список з базовими діями.

## Рішення
Потрібно замінити всі кнопки з шестернею в `TextPresentationDisplay.tsx` на новий компонент `ImageBasicActions`.

## Кроки для оновлення

### 1. Додати імпорт
```tsx
import ImageBasicActions from './ImageBasicActions';
```

### 2. Замінити всі кнопки з шестернею

**Замість:**
```tsx
{/* Word-style Editor button */}
{isEditing && (
  <button
    onClick={() => setShowWordStyleEditor(true)}
    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#2b579a] hover:bg-[#1e3a8a] rounded p-1.5 text-xs text-white shadow-lg z-50"
    title="Format Picture (Word-style)"
  >
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  </button>
)}
```

**На:**
```tsx
{/* Basic Actions Button */}
{isEditing && (
  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
    <ImageBasicActions
      imageBlock={block as ImageBlock}
      onImageChange={(updatedBlock) => {
        Object.keys(updatedBlock).forEach(key => {
          if (key !== 'type' && key !== 'src') {
            onTextChange?.(fieldPath(key), (updatedBlock as any)[key]);
          }
        });
      }}
      onOpenAdvancedSettings={() => setShowWordStyleEditor(true)}
    />
  </div>
)}
```

### 3. Місця для заміни

Потрібно замінити кнопки в наступних місцях:

1. **Рядок 1440** - Перша кнопка для standalone зображень
2. **Рядок 1530** - Друга кнопка для side-by-side зображень  
3. **Рядок 1663** - Третя кнопка (якщо є)

### 4. Перевірити функціональність

Після заміни:
- При hover над зображенням з'являється кнопка "Actions"
- При кліку на "Actions" відкривається dropdown з базовими діями
- В dropdown є опція "Open Advanced Settings" для відкриття модального вікна

## Тестування

Використовуйте `SimpleImageActionsTest.tsx` для тестування нової функціональності:

```tsx
import SimpleImageActionsTest from './components/SimpleImageActionsTest';

// У вашому компоненті
<SimpleImageActionsTest />
```

## Результат

Після оновлення:
- ✅ При натисканні на шестерню відкривається dropdown з базовими діями
- ✅ Базові дії працюють миттєво
- ✅ Модальне вікно відкривається тільки через "Open Advanced Settings"
- ✅ Кращий UX з меншою кількістю кліків
