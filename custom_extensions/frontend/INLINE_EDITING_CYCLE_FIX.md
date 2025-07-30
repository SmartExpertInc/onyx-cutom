# Виправлення нескінченного циклу автозбереження

## ❌ Проблема
Після змінення тексту і прибирання фокуса відбувався нескінченний цикл збереження:

```
🔄 SmartSlideDeckViewer onSave called with: {...}
🔄 Calling handleAutoSave from onSave callback
Auto-save triggered
🎯 SLIDE DECK AUTO-SAVE: {...}
Auto-save: Payload being sent: {...}
🔄 SmartSlideDeckViewer onSave called with: {...}
🔄 Calling handleAutoSave from onSave callback
Auto-save triggered
... (повторюється нескінченно)
```

## 🔍 Причина
**Цикл викликів**:
1. `ContentSlideTemplate` → `handleInputBlur` → `onAutoSave`
2. `SmartSlideDeckViewer` → `handleAutoSave` → `onSave?.(editableDeck)`
3. `page.tsx` → `onSave` callback → `handleAutoSave()`
4. Повернення до кроку 2...

## ✅ Рішення

### 1. Прибрали виклик `handleAutoSave()` з `onSave` callback в `page.tsx`

**Було**:
```typescript
onSave={(updatedDeck) => {
  setEditableData(updatedDeck as ComponentBasedSlideDeck);
  handleAutoSave(); // ❌ Це створювало цикл
}}
```

**Стало**:
```typescript
onSave={(updatedDeck) => {
  setEditableData(updatedDeck as ComponentBasedSlideDeck);
  // Автозбереження вже відбувається в SmartSlideDeckViewer
  // Не викликаємо handleAutoSave тут, щоб уникнути циклу
}}
```

### 2. Додали пряме збереження на сервер в `SmartSlideDeckViewer`

**Додали `projectId` пропс**:
```typescript
interface SmartSlideDeckViewerProps {
  // ... інші пропси
  projectId?: string; // Для прямого збереження на сервер
}
```

**Оновили `handleAutoSave`**:
```typescript
const handleAutoSave = async () => {
  if (!editableDeck) return;
  
  // Якщо є projectId, зберігаємо безпосередньо на сервер
  if (projectId) {
    const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
    const payload = { microProductContent: editableDeck };
    
    const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/update/${projectId}`, {
      method: 'PUT', 
      headers: saveOperationHeaders, 
      body: JSON.stringify(payload),
    });
    
    if (response.ok) {
      console.log('Auto-save successful');
    } else {
      console.warn('Auto-save failed:', response.status);
    }
  } else {
    // Якщо немає projectId, використовуємо onSave callback
    onSave?.(editableDeck);
  }
};
```

### 3. Передали `projectId` в `SmartSlideDeckViewer`

```typescript
<SmartSlideDeckViewer
  deck={editableData || slideDeckData}
  isEditable={true}
  projectId={projectId} // ✅ Передаємо projectId для прямого збереження
  onSave={(updatedDeck) => {
    setEditableData(updatedDeck as ComponentBasedSlideDeck);
  }}
  showFormatInfo={true}
  theme="dark-purple"
/>
```

## 🎯 Результат

Тепер логіка працює правильно:

1. **Користувач змінює текст** → `ContentSlideTemplate.handleInputBlur()`
2. **Викликається `onAutoSave`** → `SmartSlideDeckViewer.handleAutoSave()`
3. **Пряме збереження на сервер** → `fetch('/api/custom-projects-backend/projects/update/${projectId}')`
4. **Оновлення локального стану** → `setEditableData(updatedDeck)`

**Немає циклів!** ✅

## 📁 Змінені файли

- `page.tsx` - прибрали виклик `handleAutoSave()` з `onSave` callback
- `SmartSlideDeckViewer.tsx` - додали пряме збереження на сервер
- `INLINE_EDITING_CYCLE_FIX.md` - ця документація

## 🧪 Тестування

1. Відкрийте консоль (F12)
2. Змініть текст в слайді
3. Заберіть фокус
4. Перевірте логи - не повинно бути повторень

**Очікувані логи**:
```
🔄 handleInputBlur called: {...}
🔄 Calling onAutoSave
Auto-save triggered
Auto-save: Sending request to /api/custom-projects-backend/projects/update/174
Auto-save successful
```

**НЕ очікувані логи**:
```
🔄 SmartSlideDeckViewer onSave called with: {...}
🔄 Calling handleAutoSave from onSave callback
Auto-save triggered
... (повторення)
``` 