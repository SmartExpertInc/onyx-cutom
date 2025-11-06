# Video Mode Slide Styles - Специальные стили для редактора видео

## 🎯 Задача

Сделать так, чтобы в редакторе видео слайды имели:
- **Ширину: 80%** (вместо 100%)
- **Без minHeight: 600px** (height: auto)
- **Центрирование**: margin: 0 auto

А в остальных местах приложения слайды остаются со стандартными стилями:
- **Ширина: 100%**
- **minHeight: 600px**
- **maxWidth: 1200px**

## ✅ Реализация

### 1. **HybridTemplateBase.tsx** - Добавлен проп `isVideoMode`

**Файл:** `custom_extensions/frontend/src/components/templates/base/HybridTemplateBase.tsx`

**Изменения:**

#### Интерфейс (строки 24-33):
```tsx
interface HybridTemplateProps extends BaseTemplateProps {
  slide?: ComponentBasedSlide;
  items?: PositionableItem[];
  canvasConfig?: CanvasConfig;
  positioningMode?: PositioningMode;
  theme?: SlideTheme;
  onSlideUpdate?: (updatedSlide: ComponentBasedSlide) => void;
  children?: React.ReactNode;
  isVideoMode?: boolean; // 👈 НОВЫЙ ПРОП
}
```

#### Пропсы компонента (строки 35-47):
```tsx
export const HybridTemplateBase: React.FC<HybridTemplateProps> = ({
  slideId,
  slide,
  items = [],
  canvasConfig,
  positioningMode = 'template',
  theme,
  isEditable = false,
  onUpdate,
  onSlideUpdate,
  children,
  isVideoMode = false // 👈 НОВЫЙ ПРОП
}) => {
```

#### Стили обертки (строки 267-277):
```tsx
style={{
  // Use max-width and max-height instead of fixed dimensions to allow natural flow
  width: isVideoMode ? '80%' : '100%',              // 👈 80% для видео
  height: 'auto',
  minHeight: isVideoMode ? 'auto' : '600px',        // 👈 Убираем minHeight для видео
  position: 'relative',
  // Ensure the wrapper doesn't interfere with slide spacing
  margin: isVideoMode ? '0 auto' : 0,               // 👈 Центрирование для видео
  padding: 0,
  display: 'block'
}}
```

---

### 2. **ComponentBasedSlideRenderer.tsx** - Проброс пропа

**Файл:** `custom_extensions/frontend/src/components/ComponentBasedSlideRenderer.tsx`

**Изменения:**

#### Интерфейс ComponentBasedSlideRendererProps (строки 9-17):
```tsx
interface ComponentBasedSlideRendererProps {
  slide: ComponentBasedSlide;
  isEditable?: boolean;
  onSlideUpdate?: (updatedSlide: ComponentBasedSlide) => void;
  onTemplateChange?: (slideId: string, newTemplateId: string) => void;
  theme?: string;
  getPlaceholderGenerationState?: (elementId: string) => { isGenerating: boolean; hasImage: boolean; error?: string };
  isVideoMode?: boolean; // 👈 НОВЫЙ ПРОП
}
```

#### Использование в HybridTemplateBase (строка 136):
```tsx
<HybridTemplateBase
  slideId={slide.slideId}
  slide={slide}
  items={slide.items}
  canvasConfig={slide.canvasConfig}
  positioningMode={slide.positioningMode || (isEditable ? 'hybrid' : 'template')}
  theme={currentTheme}
  isEditable={isEditable}
  onUpdate={handlePropsUpdate}
  onSlideUpdate={onSlideUpdate}
  isVideoMode={isVideoMode} // 👈 ПЕРЕДАЕМ ПРОП
>
```

#### Интерфейс ComponentBasedSlideDeckRendererProps (строки 163-172):
```tsx
interface ComponentBasedSlideDeckRendererProps {
  slides: ComponentBasedSlide[];
  selectedSlideId?: string;
  isEditable?: boolean;
  onSlideUpdate?: (updatedSlide: ComponentBasedSlide) => void;
  onTemplateChange?: (slideId: string, newTemplateId: string) => void;
  theme?: string;
  getPlaceholderGenerationState?: (elementId: string) => { isGenerating: boolean; hasImage: boolean; error?: string };
  isVideoMode?: boolean; // 👈 НОВЫЙ ПРОП
}
```

#### Проброс в дочерний ComponentBasedSlideRenderer (строка 213):
```tsx
<ComponentBasedSlideRenderer
  slide={slide}
  isEditable={isEditable}
  onSlideUpdate={onSlideUpdate}
  onTemplateChange={onTemplateChange}
  theme={theme}
  getPlaceholderGenerationState={getPlaceholderGenerationState}
  isVideoMode={isVideoMode} // 👈 ПЕРЕДАЕМ ПРОП
/>
```

---

### 3. **[projectId]/page.tsx** - Активация видео режима

**Файл:** `custom_extensions/frontend/src/app/projects-2/view/[projectId]/page.tsx`

**Изменения:**

#### Строка 807 - добавлен isVideoMode={true}:
```tsx
<ComponentBasedSlideDeckRenderer
  slides={componentBasedSlideDeck.slides}
  selectedSlideId={currentSlideId}
  isEditable={true}
  onSlideUpdate={(updatedSlide) => {
    // Handle slide updates for component-based slides
    if (componentBasedSlideDeck) {
      const updatedSlides = componentBasedSlideDeck.slides.map(slide =>
        slide.slideId === updatedSlide.slideId ? updatedSlide : slide
      );
      const updatedDeck = { ...componentBasedSlideDeck, slides: updatedSlides };
      setComponentBasedSlideDeck(updatedDeck);
      // Save to backend
      saveVideoLessonData(updatedDeck);
    }
  }}
  theme="default"
  isVideoMode={true} // 👈 АКТИВАЦИЯ ВИДЕО РЕЖИМА
/>
```

---

## 📊 Результат

### В видео редакторе (`projects-2/view/[projectId]`):
```css
width: 80%;
height: auto;
minHeight: auto; /* Нет минимальной высоты */
margin: 0 auto; /* Центрирование */
```

### В остальных местах (презентации, превью и т.д.):
```css
width: 100%;
height: auto;
minHeight: 600px; /* Минимальная высота для консистентности */
margin: 0;
```

## 🎬 Где применяется

**Видео режим активен ТОЛЬКО в:**
- `custom_extensions/frontend/src/app/projects-2/view/[projectId]/page.tsx`
- При редактировании слайдов для видео уроков

**Обычный режим используется во всех остальных местах:**
- Превью слайдов
- Экспорт в PDF
- Обычная презентация
- Редактор презентаций (не видео)

## 🔧 Как это работает

1. В видео редакторе передается `isVideoMode={true}`
2. Проп проходит через `ComponentBasedSlideDeckRenderer` → `ComponentBasedSlideRenderer` → `HybridTemplateBase`
3. `HybridTemplateBase` применяет специальные стили для видео режима
4. Слайды получают ширину 80% и центрируются без минимальной высоты

## ✨ Преимущества

✅ **Гибкость**: Слайды адаптируются под контейнер видео редактора  
✅ **Центрирование**: 80% ширина с автоматическим центрированием  
✅ **Консистентность**: В остальных местах сохраняются стандартные стили  
✅ **Масштабируемость**: Легко добавить другие режимы в будущем
