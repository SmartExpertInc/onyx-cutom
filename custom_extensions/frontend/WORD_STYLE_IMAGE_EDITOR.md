# Word-Style Image Editor

## Опис

Word-Style Image Editor - це новий компонент для редагування зображень з інтерфейсом, схожим на Microsoft Word. Він замінює старий модальний редактор налаштувань зображень у `TextPresentationDisplay.tsx`.

## Особливості

### 🎨 **Word-подібний інтерфейс**
- Синій заголовок у стилі Microsoft Office
- Вкладки (Format, Size, Layout, Effects)
- Кнопки в стилі Word (OK, Reset)
- Фокус на зручності використання

### 📐 **Функції редагування**

#### **Вкладка Format:**
- **Quick Styles** - швидкі пресети розмірів (Small, Medium, Large, Extra Large)
- **Alignment** - вирівнювання (Left, Center, Right)
- **Corner Rounding** - закруглення кутів (Sharp, Slightly Rounded, Rounded, Very Rounded)

#### **Вкладка Size:**
- **Width** - точна ширина в пікселях
- **Height** - висота (Auto, 200px, 300px, 400px)
- **Scale Controls** - кнопки Smaller/Larger
- **Reset to Default** - скидання до стандартних налаштувань

#### **Вкладка Layout:**
- **Text Wrapping** - обтікання текстом
  - Inline with Text (текст обтікає зображення)
  - Break Text (зображення на окремому рядку)
  - Behind Text (зображення як фон)
  - In Front of Text (зображення поверх тексту)
- **Position** - позиціонування (Left, Center, Right)

#### **Вкладка Effects:**
- **Shadow** - тіні (None, Subtle, Medium, Strong)
- **Border** - рамки (None, Solid, Dashed, Dotted)
- **Opacity** - прозорість (0-100%)
- **Rotation** - поворот (0-360°)

### 📱 **Попередній перегляд**
- Режими перегляду: Desktop, Tablet, Mobile
- Реальний час оновлення
- Приклад документа з текстом

## Використання

### Інтеграція в TextPresentationDisplay

```tsx
import WordStyleImageEditor from './WordStyleImageEditor';

// Замість старого BlockSettingsModal
<WordStyleImageEditor
  isOpen={showWordStyleEditor}
  onClose={() => setShowWordStyleEditor(false)}
  imageBlock={block as ImageBlock}
  onImageChange={(updatedBlock) => {
    // Оновлення всіх властивостей зображення
    Object.keys(updatedBlock).forEach(key => {
      if (key !== 'type' && key !== 'src') {
        onTextChange?.(fieldPath(key), (updatedBlock as any)[key]);
      }
    });
  }}
/>
```

### Самостійне використання

```tsx
import WordStyleImageEditor from './WordStyleImageEditor';

const MyComponent = () => {
  const [imageBlock, setImageBlock] = useState<ImageBlock>({
    type: 'image',
    src: '/path/to/image.jpg',
    width: 300,
    alignment: 'center',
    // ... інші властивості
  });

  return (
    <WordStyleImageEditor
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      imageBlock={imageBlock}
      onImageChange={setImageBlock}
    />
  );
};
```

## Структура файлів

```
custom_extensions/frontend/src/components/
├── WordStyleImageEditor.tsx          # Основний компонент
├── TestWordStyleEditor.tsx           # Тестовий компонент
└── TextPresentationDisplay.tsx       # Оновлений основний файл
```

## Тестування

Для тестування використовуйте `TestWordStyleEditor.tsx`:

```tsx
import TestWordStyleEditor from './components/TestWordStyleEditor';

// У вашому компоненті
<TestWordStyleEditor />
```

## Кольорова схема

- **Primary Blue**: `#2b579a` (Microsoft Office blue)
- **Hover Blue**: `#1e3a8a` (darker blue)
- **Background**: `#f4f5f6` (light gray)
- **Borders**: `#e5e7eb` (gray-200)

## Переваги

1. **Звичний інтерфейс** - користувачі знайомі з Word
2. **Повна функціональність** - всі налаштування в одному місці
3. **Реальний час** - миттєвий попередній перегляд
4. **Адаптивність** - різні режими перегляду
5. **Зручність** - логічна організація налаштувань

## Міграція

Старий `BlockSettingsModal` для зображень замінено на `WordStyleImageEditor`. Всі функції збережено, але інтерфейс покращено.

## Підтримувані властивості ImageBlock

- `src` - шлях до зображення
- `alt` - альтернативний текст
- `caption` - підпис
- `width` - ширина
- `height` - висота
- `alignment` - вирівнювання
- `borderRadius` - закруглення кутів
- `maxWidth` - максимальна ширина
- `layoutMode` - режим макету
- `layoutPartnerIndex` - індекс партнера макету
- `layoutProportion` - пропорції макету
