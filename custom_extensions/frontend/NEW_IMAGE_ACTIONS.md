# New Image Actions System

## Опис

Нова система дій для зображень, яка розділяє базові дії (швидкі налаштування) та розширені налаштування (повний редактор).

## 🎯 **Концепція**

### **Два рівні редагування:**

1. **Базові дії** - швидкі налаштування через дроп-меню
2. **Розширені налаштування** - повний модальний редактор

### **Потік роботи:**
```
Зображення → Hover → Actions Button → Dropdown Menu → Basic Actions OR Advanced Settings
```

## 🔧 **Компоненти**

### **1. ImageBasicActions.tsx**
```tsx
interface ImageBasicActionsProps {
  imageBlock: ImageBlock;
  onImageChange: (updatedBlock: ImageBlock) => void;
  onOpenAdvancedSettings: () => void;
}
```

**Функціональність:**
- Кнопка "Actions" з шестернею
- Дроп-меню з базовими діями
- Швидкі пресети розмірів
- Вирівнювання
- Стилі кутів
- Посилання на розширені налаштування

### **2. WordStyleImageEditor.tsx**
- Повний модальний редактор
- Детальні налаштування
- Live preview
- Всі розширені опції

## 📋 **Базові дії (Dropdown Menu)**

### **Quick Size**
- Small (200px)
- Medium (400px) 
- Large (600px)
- Extra Large (800px)

### **Alignment**
- ⬅️ Left
- ⬆️ Center  
- ➡️ Right

### **Corner Style**
- Sharp Corners (0px)
- Slightly Rounded (4px)
- Rounded (8px)
- Very Rounded (16px)

### **Advanced Settings**
- "Open Advanced Settings" - відкриває модальне вікно

## 🎨 **UI/UX Особливості**

### **Кнопка Actions:**
```tsx
<button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md">
  <Settings className="w-4 h-4" />
  Actions
  <ChevronDown className="w-3 h-3" />
</button>
```

### **Dropdown Menu:**
- Ширина: 224px (w-56)
- Розділені секції з заголовками
- Hover ефекти
- Закриття після вибору дії

### **Секції меню:**
```tsx
<div className="px-3 py-2 border-b border-gray-100">
  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
    Quick Size
  </div>
  {/* Content */}
</div>
```

## 🚀 **Використання**

### **В TextPresentationDisplay.tsx:**
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

### **В тестовому компоненті:**
```tsx
<ImageBasicActions
  imageBlock={imageBlock}
  onImageChange={handleImageChange}
  onOpenAdvancedSettings={() => setShowAdvancedEditor(true)}
/>
```

## 📁 **Структура файлів**

```
custom_extensions/frontend/src/components/
├── ImageBasicActions.tsx           # Новий компонент базових дій
├── WordStyleImageEditor.tsx        # Розширені налаштування
├── NewImageActionsTest.tsx         # Тестовий компонент
├── TextPresentationDisplay.tsx     # Основний файл (потребує оновлення)
└── UpdatedTestEditor.tsx           # Старий тестовий компонент
```

## 🎯 **Переваги нової системи**

1. **Швидкість** - базові дії доступні через 1 клік
2. **Зручність** - не потрібно відкривати модальне вікно для простих змін
3. **Гнучкість** - можна використовувати як базові, так і розширені налаштування
4. **Інтуїтивність** - зрозумілий потік роботи
5. **Продуктивність** - менше кліків для простих операцій

## 🔄 **Міграція**

### **Заміна старих кнопок:**
```tsx
// Старий варіант:
<button onClick={() => setShowWordStyleEditor(true)}>
  <Settings className="w-3 h-3" />
</button>

// Новий варіант:
<ImageBasicActions
  imageBlock={block as ImageBlock}
  onImageChange={handleImageChange}
  onOpenAdvancedSettings={() => setShowWordStyleEditor(true)}
/>
```

### **Оновлення станів:**
```tsx
const [showWordStyleEditor, setShowWordStyleEditor] = useState(false);
// Додати якщо потрібно:
const [showBasicActions, setShowBasicActions] = useState(false);
```

## 🧪 **Тестування**

### **NewImageActionsTest.tsx:**
- Демонструє повну функціональність
- Інструкції по використанню
- Live preview змін
- JSON дані для дебагу

### **Використання:**
```tsx
import NewImageActionsTest from './components/NewImageActionsTest';

// У вашому компоненті
<NewImageActionsTest />
```

## 🎨 **Дизайн**

### **Кольори:**
- **Primary**: `blue-600` / `blue-700`
- **Secondary**: `gray-100` / `gray-200`
- **Text**: `gray-700` / `gray-500`
- **Borders**: `gray-200` / `gray-100`

### **Анімації:**
- Hover ефекти
- Transition для ChevronDown
- Opacity для появи кнопки

### **Responsive:**
- Dropdown позиціонується правильно
- Адаптивні розміри
- Touch-friendly на мобільних

## 📝 **Плани розвитку**

1. **Додати більше базових дій:**
   - Обрізання
   - Фільтри
   - Тіні

2. **Покращити UX:**
   - Keyboard shortcuts
   - Undo/Redo
   - Batch operations

3. **Інтеграція:**
   - З іншими компонентами
   - Drag & drop
   - Context menu
