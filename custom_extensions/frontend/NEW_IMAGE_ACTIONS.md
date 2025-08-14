# New Image Actions - Basic Actions Dropdown

## Опис

Нова логіка роботи з зображеннями: при натисканні на шестерню з'являється список базових дій, а не меню розширених налаштувань. В цьому списку є пункт "Відкрити меню розширених налаштувань", який відкриває модальне вікно.

## 🎯 **Нова логіка**

### **Структура дій:**
1. **Шестерня** → Базові дії (dropdown)
2. **Базові дії** → Розмір, Вирівнювання, Стиль
3. **"Відкрити меню розширених налаштувань"** → Модальне вікно

### **Базові дії включають:**

#### **📏 Size (Розмір)**
- **Make Smaller** - зменшує до 200px
- **Make Larger** - збільшує до 600px

#### **📍 Alignment (Вирівнювання)**
- **⬅️ Align Left** - вирівнювання по лівому краю
- **⬆️ Align Center** - вирівнювання по центру
- **➡️ Align Right** - вирівнювання по правому краю

#### **🎨 Style (Стиль)**
- **🔲 Sharp Corners** - гострі кути (0px)
- **🔲 Rounded Corners** - закруглені кути (8px)

#### **⚙️ Advanced**
- **Open Advanced Settings** - відкриває повне модальне вікно

## 📁 **Структура файлів**

```
custom_extensions/frontend/src/components/
├── BasicImageActions.tsx           # Новий компонент базових дій
├── NewImageActionsTest.tsx         # Тестовий компонент
├── WordStyleImageEditor.tsx        # Модальне вікно розширених налаштувань
└── TextPresentationDisplay.tsx     # Основний файл (потребує оновлення)
```

## 🔧 **Компоненти**

### **1. BasicImageActions.tsx**
```tsx
interface BasicImageActionsProps {
  imageBlock: ImageBlock;
  onImageChange: (updatedBlock: ImageBlock) => void;
  onOpenAdvancedSettings: () => void;
}
```

**Функціональність:**
- Dropdown з базовими діями
- Категорії: Size, Alignment, Style
- Кнопка "Open Advanced Settings"
- Автоматичне закриття після вибору дії

### **2. NewImageActionsTest.tsx**
**Тестовий компонент для демонстрації:**
- Показує зображення з кнопкою базових дій
- Відображає поточні налаштування
- Інструкції по використанню
- JSON дані зображення

## 🎨 **UI/UX Особливості**

### **Dropdown Design:**
```tsx
<div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
  <div className="py-1">
    {/* Size Actions */}
    <div className="px-3 py-2 border-b border-gray-100">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Size</div>
      {/* Actions */}
    </div>
    
    {/* Alignment Actions */}
    <div className="px-3 py-2 border-b border-gray-100">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Alignment</div>
      {/* Actions */}
    </div>
    
    {/* Style Actions */}
    <div className="px-3 py-2 border-b border-gray-100">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Style</div>
      {/* Actions */}
    </div>
    
    {/* Advanced Settings */}
    <div className="px-3 py-2">
      <button className="text-blue-600 font-medium">
        <Edit3 className="w-4 h-4" />
        Open Advanced Settings
      </button>
    </div>
  </div>
</div>
```

### **Кнопка Actions:**
```tsx
<button className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors">
  <Settings className="w-4 h-4" />
  Actions
  <ChevronDown className={`w-3 h-3 transition-transform ${showActions ? 'rotate-180' : ''}`} />
</button>
```

## 🚀 **Використання**

### **Інтеграція в TextPresentationDisplay:**
```tsx
import BasicImageActions from './BasicImageActions';

// Замість старої кнопки
{isEditing && (
  <div className="absolute top-2 left-2 z-10">
    <BasicImageActions
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

### **Для тестування:**
```tsx
import NewImageActionsTest from './components/NewImageActionsTest';

// У вашому компоненті
<NewImageActionsTest />
```

## 🔄 **Переваги нової логіки**

1. **Швидкість** - базові дії доступні одразу
2. **Зручність** - не потрібно відкривати модальне вікно для простих змін
3. **Логічність** - чітка ієрархія: базові дії → розширені налаштування
4. **Ефективність** - менше кліків для простих операцій
5. **Інтуїтивність** - зрозуміла структура дій

## 📋 **План інтеграції**

### **Крок 1: Оновлення TextPresentationDisplay.tsx**
- Замінити стару кнопку на `BasicImageActions`
- Додати обробник `onOpenAdvancedSettings`

### **Крок 2: Тестування**
- Використати `NewImageActionsTest.tsx`
- Перевірити всі базові дії
- Перевірити відкриття розширених налаштувань

### **Крок 3: Фіналізація**
- Видалити старі компоненти
- Оновити документацію
- Протестувати в реальному середовищі

## 🎯 **Результат**

Тепер користувачі можуть:
- **Швидко** змінювати розмір, вирівнювання та стиль зображення
- **Легко** отримати доступ до розширених налаштувань
- **Ефективно** працювати з зображеннями без зайвих кліків

