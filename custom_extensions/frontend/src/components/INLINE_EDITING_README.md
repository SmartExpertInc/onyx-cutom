# Inline Editing для слайдів

## 🎯 Огляд

Система inline editing для слайдів дозволяє користувачам редагувати контент безпосередньо в інтерфейсі презентації, без необхідності відкривати окремі форми або модальні вікна.

## 🏗️ Архітектура

### Основні компоненти

1. **`InlineEditor.tsx`** - універсальний компонент для inline редагування
2. **`useInlineEditing.ts`** - хук для управління станом редагування
3. **`withInlineEditing.tsx`** - HOC для додавання inline editing до шаблонів
4. **`ComponentBasedSlideRenderer.tsx`** - оновлений рендерер з підтримкою inline editing

### Типи даних

```typescript
interface EditingState {
  slideId: string;
  fieldPath: string[];
  value: string;
}

interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  maxLength?: number;
  autoFocus?: boolean;
  rows?: number;
}
```

## 🚀 Використання

### 1. Базове використання InlineEditor

```tsx
import InlineEditor from './InlineEditor';

function MyComponent() {
  const [value, setValue] = useState('Initial text');
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <InlineEditor
        initialValue={value}
        onSave={(newValue) => {
          setValue(newValue);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
        multiline={true}
        placeholder="Enter your text..."
        maxLength={500}
      />
    );
  }

  return (
    <div onClick={() => setIsEditing(true)}>
      {value}
    </div>
  );
}
```

### 2. Використання хука useInlineEditing

```tsx
import { useInlineEditing } from '../hooks/useInlineEditing';

function SlideComponent({ slideId, isEditable }) {
  const inlineEditing = useInlineEditing();

  const handleSave = (slideId: string, fieldPath: string[], value: string) => {
    // Логіка збереження змін
    console.log('Saving:', { slideId, fieldPath, value });
  };

  return (
    <div>
      {inlineEditing.isEditing(slideId, ['title']) ? (
        <InlineEditor
          initialValue={inlineEditing.getEditingValue(slideId, ['title']) || ''}
          onSave={(value) => {
            handleSave(slideId, ['title'], value);
            inlineEditing.stopEditing();
          }}
          onCancel={() => inlineEditing.cancelChanges()}
        />
      ) : (
        <h1 
          onClick={() => inlineEditing.startEditing(slideId, ['title'], 'Current Title')}
          className="editable-field"
        >
          Current Title
        </h1>
      )}
    </div>
  );
}
```

### 3. Використання HOC withInlineEditing

```tsx
import { withInlineEditing } from './withInlineEditing';

const MyTemplate = ({ 
  title, 
  content, 
  renderEditableText, 
  renderEditableField 
}) => {
  return (
    <div>
      <h1>
        {renderEditableText(['title'], title, {
          placeholder: 'Enter title...',
          maxLength: 100
        })}
      </h1>
      
      <div>
        {renderEditableField(['content'], content, 
          (displayValue) => <p>{displayValue}</p>,
          {
            multiline: true,
            placeholder: 'Enter content...',
            maxLength: 2000
          }
        )}
      </div>
    </div>
  );
};

export default withInlineEditing(MyTemplate);
```

## 🎨 Стилізація

### CSS класи

- `.inline-editor-base` - базові стилі для inline editor
- `.editable-field` - стилі для полів що можна редагувати
- `.slide-title-editable` - специфічні стилі для заголовків слайдів
- `.slide-content-editable` - специфічні стилі для контенту слайдів
- `.bullet-points-editable` - специфічні стилі для маркованих списків

### Кастомізація

```css
/* Кастомні стилі для inline editing */
.my-custom-editor {
  background: #f0f9ff !important;
  border-color: #0ea5e9 !important;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.2);
}

.my-custom-editor:focus {
  border-color: #0284c7 !important;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}
```

## ⌨️ Клавіатурні скорочення

- **Enter** - зберегти зміни (для однострочних полів)
- **Ctrl+Enter** - зберегти зміни (для багатострочних полів)
- **Escape** - скасувати редагування
- **Tab** - навігація між полями

## 🔧 Налаштування

### Параметри InlineEditor

```typescript
interface InlineEditorProps {
  initialValue: string;           // Початкове значення
  onSave: (value: string) => void; // Callback при збереженні
  onCancel: () => void;           // Callback при скасуванні
  multiline?: boolean;            // Багатострочний режим
  placeholder?: string;           // Плейсхолдер
  className?: string;             // Додаткові CSS класи
  style?: React.CSSProperties;    // Інлайн стилі
  maxLength?: number;             // Максимальна довжина
  autoFocus?: boolean;            // Автофокус
  rows?: number;                  // Кількість рядків (для textarea)
}
```

### Параметри renderEditableText

```typescript
renderEditableText(
  fieldPath: string[],           // Шлях до поля
  value: string,                 // Поточне значення
  options: {
    multiline?: boolean;         // Багатострочний режим
    placeholder?: string;        // Плейсхолдер
    className?: string;          // CSS класи
    style?: React.CSSProperties; // Інлайн стилі
    maxLength?: number;          // Максимальна довжина
    rows?: number;               // Кількість рядків
  }
)
```

## 🐛 Відладка

### Логування

```typescript
// Включити детальне логування
const inlineEditing = useInlineEditing();

console.log('Editing state:', inlineEditing.editingState);
console.log('Has unsaved changes:', inlineEditing.hasUnsavedChanges);
```

### Перевірка стану

```typescript
// Перевірити чи редагується конкретне поле
const isEditing = inlineEditing.isEditing(slideId, ['title']);

// Отримати поточне значення редагування
const editingValue = inlineEditing.getEditingValue(slideId, ['title']);
```

## 🔄 Інтеграція з існуючими шаблонами

### 1. Оновлення шаблону

```tsx
// До
export const MyTemplate = ({ title, content }) => (
  <div>
    <h1>{title}</h1>
    <p>{content}</p>
  </div>
);

// Після
export const MyTemplate = ({ 
  title, 
  content, 
  renderEditableText, 
  renderEditableField 
}) => (
  <div>
    <h1>
      {renderEditableText(['title'], title, {
        placeholder: 'Enter title...'
      })}
    </h1>
    <p>
      {renderEditableField(['content'], content, 
        (displayValue) => <span>{displayValue}</span>,
        { multiline: true }
      )}
    </p>
  </div>
);
```

### 2. Оновлення реєстру шаблонів

```typescript
// registry.ts
export const SLIDE_TEMPLATE_REGISTRY = {
  'my-template': {
    // ... інші властивості
    component: withInlineEditing(MyTemplate), // Обгорнути в HOC
  }
};
```

## 🎯 Приклади використання

### ContentSlideTemplate

```tsx
// Заголовок
{renderEditableText(['title'], title, {
  className: 'slide-title-editable',
  placeholder: 'Enter slide title...',
  maxLength: 100
})}

// Контент
{renderEditableField(['content'], content, 
  (displayValue) => parseContent(displayValue),
  {
    multiline: true,
    placeholder: 'Enter slide content...',
    className: 'slide-content-editable',
    maxLength: 2000,
    rows: 8
  }
)}
```

### BulletPointsTemplate

```tsx
// Заголовок
{renderEditableText(['title'], title, {
  className: 'slide-title-editable',
  placeholder: 'Enter slide title...',
  maxLength: 100
})}

// Маркований список
{renderEditableArray(['bullets'], bullets, {
  placeholder: 'Enter bullet points, one per line...',
  className: 'bullet-points-editable',
  maxLength: 2000
})}
```

## 🚀 Майбутні покращення

1. **Rich Text Editor** - підтримка форматування тексту
2. **Drag & Drop** - перетягування елементів
3. **Undo/Redo** - історія змін
4. **Auto-save** - автоматичне збереження
5. **Collaboration** - спільна робота в реальному часі
6. **Templates** - збереження власних шаблонів
7. **Export** - експорт в різні формати

## 📝 Примітки

- Всі зміни зберігаються автоматично при втраті фокусу
- Підтримується клавіатурна навігація
- Адаптивний дизайн для мобільних пристроїв
- Повна підтримка доступності (accessibility)
- Оптимізовано для продуктивності 