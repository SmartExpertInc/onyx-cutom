# Dynamic Item Positioning System

This guide explains how to use the new dynamic item positioning system that allows users to freely move, resize, and rotate slide elements.

## Overview

The positioning system introduces three modes for slide editing:

- **Template Mode**: Traditional fixed layout (default)
- **Hybrid Mode**: Template background with moveable items overlaid
- **Free Mode**: Complete freedom to position items anywhere

## Key Features

✅ **Drag & Drop**: Move items freely around the canvas  
✅ **Resize**: Adjust width and height with visual handles  
✅ **Rotate**: Rotate items with rotation handle  
✅ **Grid Snapping**: Optional grid alignment for precision  
✅ **Multi-selection**: Select and manipulate multiple items  
✅ **Alignment Tools**: Auto-align and distribute items  
✅ **Undo/Redo**: Full history support  
✅ **Template Extraction**: Convert existing templates to positioning mode  
✅ **Reset to Defaults**: Restore original template positions  

## Architecture

### Core Components

```
positioning/
├── types/
│   └── positioning.ts          # Type definitions
├── lib/
│   ├── PositioningEngine.ts    # Core positioning logic
│   └── TemplateExtractor.ts    # Template-to-items conversion
├── components/
│   ├── DraggableItem.tsx       # Individual draggable item
│   ├── ItemRenderer.tsx        # Renders different item types
│   ├── PositioningCanvas.tsx   # Main canvas component
│   ├── PositioningControls.tsx # Control panel UI
│   └── base/
│       └── HybridTemplateBase.tsx # Template integration
├── hooks/
│   └── usePositioning.ts       # State management hook
└── styles/
    └── positioning.css         # Positioning-specific styles
```

## Usage Examples

### Basic Integration

```tsx
import { ComponentBasedSlideRenderer } from '@/components/ComponentBasedSlideRenderer';
import { ComponentBasedSlide } from '@/types/slideTemplates';

// Your slide data
const slide: ComponentBasedSlide = {
  slideId: 'slide-1',
  slideNumber: 1,
  templateId: 'bullet-points',
  props: {
    title: 'My Presentation',
    bullets: ['Point 1', 'Point 2', 'Point 3']
  },
  // NEW: Positioning support
  positioningMode: 'hybrid', // 'template' | 'hybrid' | 'free'
  items: [], // Will be auto-extracted from template
  canvasConfig: {
    width: 1200,
    height: 675,
    gridSize: 20,
    showGrid: true
  }
};

// Render with positioning support
<ComponentBasedSlideRenderer
  slide={slide}
  isEditable={true}
  onSlideUpdate={(updatedSlide) => {
    // Handle slide updates
    console.log('Slide updated:', updatedSlide);
  }}
/>
```

### Using the Positioning Hook

```tsx
import { usePositioning } from '@/hooks/usePositioning';

function MySlideEditor({ slide }: { slide: ComponentBasedSlide }) {
  const {
    items,
    canvasConfig,
    mode,
    selectedItems,
    updateItemPosition,
    changeMode,
    alignItems,
    undo,
    redo,
    canUndo,
    canRedo
  } = usePositioning({
    slide,
    onSlideUpdate: (updatedSlide) => {
      // Save changes
      saveSlide(updatedSlide);
    }
  });

  return (
    <div>
      {/* Mode Switcher */}
      <div className="mode-switcher">
        <button 
          onClick={() => changeMode('template')}
          className={mode === 'template' ? 'active' : ''}
        >
          Template
        </button>
        <button 
          onClick={() => changeMode('hybrid')}
          className={mode === 'hybrid' ? 'active' : ''}
        >
          Hybrid
        </button>
        <button 
          onClick={() => changeMode('free')}
          className={mode === 'free' ? 'active' : ''}
        >
          Free
        </button>
      </div>

      {/* Canvas */}
      <PositioningCanvas
        items={items}
        canvasConfig={canvasConfig}
        mode={mode}
        isEditable={true}
        onItemsChange={updateItems}
        onModeChange={changeMode}
      />

      {/* Toolbar */}
      <div className="toolbar">
        <button onClick={undo} disabled={!canUndo}>↶ Undo</button>
        <button onClick={redo} disabled={!canRedo}>↷ Redo</button>
        <button onClick={() => alignItems('left')}>Align Left</button>
        <button onClick={() => alignItems('center')}>Align Center</button>
      </div>
    </div>
  );
}
```

### Creating Custom Items

```tsx
import { PositionableItem } from '@/types/positioning';

// Create a custom text item
const createTextItem = (text: string, x: number, y: number): PositionableItem => ({
  id: `text-${Date.now()}`,
  type: 'text',
  content: {
    text,
    style: 'text'
  },
  position: {
    x,
    y,
    width: 300,
    height: 100,
    rotation: 0,
    zIndex: 1
  },
  defaultPosition: { x, y, width: 300, height: 100 },
  constraints: {
    minWidth: 100,
    minHeight: 30,
    snapToGrid: true
  },
  metadata: {
    isUserCreated: true,
    lastModified: new Date().toISOString()
  }
});

// Add to slide
const newItem = createTextItem('Hello World', 100, 200);
addItem(newItem);
```

## Item Types

The system supports several built-in item types:

### Text Items
```tsx
{
  type: 'text',
  content: {
    text: 'Your text content',
    style: 'text' | 'heading'
  }
}
```

### Image Items
```tsx
{
  type: 'image',
  content: {
    imagePath: '/path/to/image.jpg',
    prompt: 'AI generation prompt',
    alt: 'Alt text'
  }
}
```

### Bullet List Items
```tsx
{
  type: 'bullet-list',
  content: {
    bullets: ['Item 1', 'Item 2', 'Item 3'],
    bulletStyle: 'dot' | 'arrow' | 'check' | 'star' | 'number',
    listType: 'bullet' | 'challenge' | 'solution'
  }
}
```

### Shape Items
```tsx
{
  type: 'shape',
  content: {
    shapeType: 'rectangle' | 'circle' | 'triangle' | 'line',
    fillColor: '#ff0000',
    strokeColor: '#000000',
    strokeWidth: 2
  }
}
```

### Container Items
```tsx
{
  type: 'container',
  content: {
    type: 'big-number' | 'pyramid-item' | 'timeline-item',
    // Type-specific content...
  }
}
```

## Template Extraction

The system can automatically extract items from existing templates:

```tsx
import { TemplateExtractor } from '@/lib/positioning/TemplateExtractor';

// Convert any slide to positioning mode
const { items, canvasConfig } = TemplateExtractor.extractItemsFromSlide(slide);

// The extractor handles:
// - Bullet point lists → bullet-list items
// - Two columns → separate text/image items
// - Process steps → container items
// - Images → image items
// - Titles → text items with heading style
```

## Positioning Engine API

The `PositioningEngine` class provides low-level control:

```tsx
import { PositioningEngine } from '@/lib/positioning/PositioningEngine';

const engine = new PositioningEngine(items, constraints);

// Event handling
engine.on('itemPositionChanged', ({ itemId, position }) => {
  console.log(`Item ${itemId} moved to:`, position);
});

// Manual operations
engine.startDrag('item-1', { x: 100, y: 200 });
engine.updateDrag({ x: 150, y: 250 });
engine.endDrag();

// Selection
engine.selectItem('item-1');
engine.selectItem('item-2', true); // Multi-select

// History
engine.undo();
engine.redo();
```

## Styling and Theming

The positioning system respects your existing slide themes:

```tsx
// Themes are automatically applied to positioned items
const themedSlide = {
  ...slide,
  theme: 'dark-theme', // Your theme ID
  items: extractedItems.map(item => ({
    ...item,
    // Theme colors will be applied during rendering
  }))
};
```

Custom CSS can be added via the positioning.css file:

```css
/* Custom item styling */
.draggable-item.selected {
  box-shadow: 0 0 0 2px #007bff;
}

/* Custom handle styling */
.moveable-control .moveable-control-box {
  background: #007bff;
  border: 2px solid white;
}
```

## Performance Considerations

- **Virtualization**: Large numbers of items are automatically virtualized
- **Debounced Updates**: Position changes are debounced to prevent excessive re-renders
- **Transform-based Positioning**: Uses CSS transforms for optimal performance
- **Selective Rendering**: Only re-renders changed items

## Migration Guide

### From Template Mode to Positioning

1. **Automatic**: Enable positioning mode in the UI - items are extracted automatically
2. **Manual**: Use the `TemplateExtractor.convertSlideToPositioning()` method
3. **Gradual**: Start with hybrid mode to maintain template background

### Backward Compatibility

- Existing slides continue to work unchanged
- Positioning data is optional - slides without it render normally
- Template mode is always available as fallback

## Troubleshooting

### Common Issues

**Items not appearing**: Check that `positioningMode` is not 'template'
```tsx
slide.positioningMode = 'hybrid'; // or 'free'
```

**Items not draggable**: Ensure `isEditable` is true
```tsx
<ComponentBasedSlideRenderer isEditable={true} />
```

**Poor performance**: Enable virtualization for large item counts
```tsx
canvasConfig.virtualizeItems = true; // For 100+ items
```

**Items jumping**: Check grid settings
```tsx
canvasConfig.snapToGrid = false; // Disable snapping
```

### Debug Mode

Enable debug logging:
```tsx
// In development
localStorage.setItem('positioning-debug', 'true');
```

This will log all positioning operations to the console.

## Future Enhancements

Planned features for future releases:

- **Layers Panel**: Visual layer management
- **Grouping**: Group items together
- **Animation**: Transition animations between positions  
- **Templates**: Save custom positioning as reusable templates
- **Collaboration**: Real-time collaborative editing
- **Advanced Shapes**: More shape types and custom shapes
- **Smart Guides**: Automatic alignment suggestions

## Support

For questions or issues with the positioning system:

1. Check this documentation
2. Look for existing issues in the project repository
3. Create a new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and version information
   - Sample slide data (if applicable)

## API Reference

See the TypeScript definitions in `types/positioning.ts` for complete API documentation.
