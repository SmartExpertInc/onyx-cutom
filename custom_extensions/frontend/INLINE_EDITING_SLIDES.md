# Inline Editing для слайдів

## Опис

Реалізовано inline editing для слайдів, копіюючи логіку з `page.tsx` для course outline. Користувач може клікати на текст в слайдах і редагувати його безпосередньо.

## Як це працює

### 1. Структура стану (State Management)

В `SmartSlideDeckViewer.tsx` додано:
- `editableDeck` - копія даних для редагування
- `isEditing` - режим редагування
- `isSaving` - стан збереження
- `autoSaveTimeoutRef` - таймер для автозбереження

### 2. Функція handleTextChange

Копіюється з `page.tsx`:
```typescript
const handleTextChange = useCallback((slideId: string, fieldPath: string, newValue: any) => {
  setEditableDeck(currentDeck => {
    const newDeck = JSON.parse(JSON.stringify(currentDeck));
    const slideIndex = newDeck.slides.findIndex((slide: ComponentBasedSlide) => slide.slideId === slideId);
    
    if (slideIndex === -1) return currentDeck;

    newDeck.slides[slideIndex].props[fieldPath] = newValue;
    newDeck.slides[slideIndex].metadata = {
      ...newDeck.slides[slideIndex].metadata,
      updatedAt: new Date().toISOString()
    };

    return newDeck;
  });

  // Автозбереження через 2 секунди
  if (autoSaveTimeoutRef.current) {
    clearTimeout(autoSaveTimeoutRef.current);
  }
  
  autoSaveTimeoutRef.current = setTimeout(() => {
    handleAutoSave();
  }, 2000);
}, [editableDeck]);
```

### 3. Автозбереження

```typescript
const handleAutoSave = async () => {
  if (!editableDeck) return;
  
  try {
    onSave?.(editableDeck);
  } catch (err: any) {
    console.warn('Auto-save error:', err.message);
  }
};
```

### 4. Передача функцій через компоненти

Функції передаються через:
1. `SmartSlideDeckViewer` → `ComponentBasedSlideDeckRenderer`
2. `ComponentBasedSlideDeckRenderer` → `ComponentBasedSlideRenderer`
3. `ComponentBasedSlideRenderer` → `ContentSlideTemplate`

### 5. Inline Editor в шаблонах

В `ContentSlideTemplate.tsx` додано:
- `InlineEditor` компонент
- `editingField` стан для відстеження яке поле редагується
- `handleFieldClick` - обробник кліку на поле
- `handleFieldSave` - обробник збереження

### 6. Послідовність дій

1. Користувач натискає "Edit Content" → `setIsEditing(true)`
2. Користувач клікає на текст → `handleFieldClick(fieldPath)` → `setEditingField(fieldPath)`
3. Текст стає input полем → рендериться `InlineEditor`
4. Користувач редагує → `onChange` → `setValue(newValue)`
5. Користувач натискає Enter або клікає поза полем → `handleFieldSave` → `onTextChange` → `handleTextChange`
6. Автозбереження → `triggerAutoSave` → `handleAutoSave` → `onSave`

## Використання

### В page.tsx:

```typescript
<SmartSlideDeckViewer
  deck={slideDeckData}
  isEditable={true}
  onSave={(updatedDeck) => {
    setEditableData(updatedDeck as any);
    handleAutoSave();
  }}
  showFormatInfo={true}
  theme="dark-purple"
/>
```

### В шаблонах слайдів:

```typescript
{editingField === 'title' ? (
  <InlineEditor
    initialValue={title}
    onSave={(value) => handleFieldSave('title', value)}
    onCancel={handleFieldCancel}
  />
) : (
  <h1 
    onClick={() => handleFieldClick('title')}
    className={isEditable ? 'editable-field' : ''}
    title={isEditable ? 'Click to edit title' : ''}
  >
    {title}
  </h1>
)}
```

## CSS стилі

Додано стилі для:
- `.editable-field` - поля що можна редагувати
- `.inline-editor-input` - input поля
- `.inline-editor-textarea` - textarea поля
- `.control-button` - кнопки керування

## Ключові особливості

1. **Збереження стилів** - всі існуючі стилі шаблонів залишаються незмінними
2. **Автозбереження** - зміни зберігаються автоматично через 2 секунди
3. **Глибока копія** - використовується `JSON.parse(JSON.stringify())` для іммутабельності
4. **Таймер** - автозбереження відбувається з затримкою
5. **Обробка помилок** - всі помилки логуються в консоль

## Тестування

Для тестування додано console.log в:
- `handleFieldClick` - коли поле клікається
- `handleFieldSave` - коли поле зберігається
- `handleTextChange` - коли дані оновлюються
- `handleAutoSave` - коли відбувається автозбереження 