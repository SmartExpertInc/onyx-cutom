# MoveableManager System Guide

## Overview

The MoveableManager system replaces the custom DragEnhancer with a unified solution using `react-moveable` for drag, resize, and future multi-select functionality. This system provides:

- **Unified drag and resize**: Single point of control for all element transformations
- **Aspect ratio locking**: Hold Shift while resizing to maintain proportions
- **Image cropping**: Support for cover, contain, and fill modes
- **Future-ready**: Built for multi-select and group operations
- **Type-safe**: Full TypeScript support with proper interfaces

## Key Components

### 1. MoveableManager Component

The core component that handles all drag and resize operations.

```typescript
import MoveableManager from '@/components/positioning/MoveableManager';

<MoveableManager
  isEnabled={isEditable}
  slideId={slideId}
  elements={moveableElements}
  savedPositions={positions}
  savedSizes={sizes}
  onPositionChange={handlePositionChange}
  onSizeChange={handleSizeChange}
  onTransformEnd={handleTransformEnd}
/>
```

### 2. useMoveableManager Hook

A custom hook that provides a clean API for managing moveable state and operations.

```typescript
import { useMoveableManager } from '@/hooks/useMoveableManager';

const moveableManager = useMoveableManager({
  slideId,
  isEditable,
  onUpdate
});
```

### 3. Enhanced ClickableImagePlaceholder

Updated image placeholder with cropping controls and MoveableManager integration.

```typescript
<ClickableImagePlaceholder
  imagePath={imagePath}
  onImageUploaded={handleImageUploaded}
  elementId={`${slideId}-image`}
  elementRef={imageRef}
  cropMode={moveableManager.getCropMode(`${slideId}-image`)}
  onCropModeChange={handleCropModeChange}
/>
```

## Integration Guide

### Step 1: Add Refs to Template Elements

Add refs to elements you want to make moveable:

```typescript
const imageRef = useRef<HTMLDivElement>(null);
const titleRef = useRef<HTMLDivElement>(null);
const subtitleRef = useRef<HTMLDivElement>(null);
```

### Step 2: Initialize MoveableManager

Use the hook to manage moveable state:

```typescript
const moveableManager = useMoveableManager({
  slideId,
  isEditable,
  onUpdate
});
```

### Step 3: Create Moveable Elements

Define which elements should be moveable:

```typescript
const moveableElements = [
  moveableManager.createMoveableElement(`${slideId}-image`, imageRef, 'image', {
    cropMode: moveableManager.getCropMode(`${slideId}-image`)
  }),
  moveableManager.createMoveableElement(`${slideId}-title`, titleRef, 'text'),
  moveableManager.createMoveableElement(`${slideId}-subtitle`, subtitleRef, 'text')
];
```

### Step 4: Add MoveableManager to Template

Include the MoveableManager component in your template:

```typescript
return (
  <div style={slideStyles}>
    <MoveableManager
      {...moveableManager.moveableManagerProps}
      elements={moveableElements}
    />
    
    {/* Your template content */}
  </div>
);
```

### Step 5: Add Data Attributes

Add the required data attributes to moveable elements:

```typescript
<div 
  ref={titleRef}
  data-moveable-element={`${slideId}-title`}
  data-draggable="true" 
  style={{ display: 'inline-block' }}
>
  {/* Element content */}
</div>
```

## Image Cropping Features

### Crop Modes

The system supports three crop modes:

1. **Contain** (`object-fit: contain`): Image scales to fit within container, maintaining aspect ratio
2. **Cover** (`object-fit: cover`): Image scales to cover container, maintaining aspect ratio (may crop)
3. **Fill** (`object-fit: fill`): Image stretches to fill container exactly (may distort)

### Crop Controls

Image placeholders include a crop control button that shows options:

```typescript
const handleCropModeChange = (mode: 'cover' | 'contain' | 'fill') => {
  moveableManager.handleCropModeChange(`${slideId}-image`, mode);
};
```

## Aspect Ratio Control

### Shift Key Locking

- **Shift pressed**: `keepRatio={true}` - Maintains aspect ratio during resize
- **Shift not pressed**: `keepRatio={false}` - Free-form width/height changes

### Implementation

The MoveableManager automatically tracks Shift key state:

```typescript
const [isShiftPressed, setIsShiftPressed] = useState(false);

// Keyboard event listeners handle Shift state
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Shift') setIsShiftPressed(true);
  };
  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Shift') setIsShiftPressed(false);
  };
  
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
  };
}, []);
```

## State Management

### MoveableState Interface

```typescript
interface MoveableState {
  positions: Record<string, { x: number; y: number }>;
  sizes: Record<string, { width: number; height: number }>;
  cropModes: Record<string, 'cover' | 'contain' | 'fill'>;
}
```

### Persistence

All transformations are automatically saved via the `onUpdate` callback:

```typescript
// Position changes
onUpdate?.({
  moveablePositions: {
    ...moveableState.positions,
    [elementId]: position
  }
});

// Size changes
onUpdate?.({
  moveableSizes: {
    ...moveableState.sizes,
    [elementId]: size
  }
});
```

## Future Multi-Select Support

### Target Arrays

react-moveable supports multiple targets:

```typescript
// Current single target
<Moveable target={selectedElement} />

// Future multi-target
<Moveable target={[element1, element2, element3]} />
```

### Group Operations

The system is designed to support:

- **Multi-select**: Click multiple elements while holding Ctrl/Cmd
- **Group resize**: Resize multiple elements simultaneously
- **Group move**: Move multiple elements together
- **Group aspect ratio**: Maintain proportions across multiple elements

## Migration from DragEnhancer

### What's Replaced

- ❌ Custom `DragEnhancer` component
- ❌ Manual drag event handling
- ❌ Custom resize logic with `ResizablePlaceholder`
- ❌ Separate position and size management

### What's New

- ✅ Unified `MoveableManager` with react-moveable
- ✅ Integrated drag and resize in one component
- ✅ Built-in aspect ratio locking
- ✅ Image cropping controls
- ✅ Type-safe state management
- ✅ Future multi-select ready

### Migration Steps

1. **Remove DragEnhancer**: Delete or comment out `<DragEnhancer />` usage
2. **Add MoveableManager**: Follow the integration guide above
3. **Update refs**: Add refs to moveable elements
4. **Add data attributes**: Include `data-moveable-element` attributes
5. **Update image placeholders**: Use new `ClickableImagePlaceholder` props

## Example: Complete Template Integration

```typescript
import React, { useState, useRef } from 'react';
import MoveableManager from '@/components/positioning/MoveableManager';
import { useMoveableManager } from '@/hooks/useMoveableManager';
import ClickableImagePlaceholder from '@/components/ClickableImagePlaceholder';

export const MyTemplate: React.FC<MyTemplateProps> = ({
  slideId,
  isEditable,
  onUpdate,
  // ... other props
}) => {
  // Refs for moveable elements
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  
  // Initialize moveable manager
  const moveableManager = useMoveableManager({
    slideId,
    isEditable,
    onUpdate
  });
  
  // Create moveable elements
  const moveableElements = [
    moveableManager.createMoveableElement(`${slideId}-image`, imageRef, 'image'),
    moveableManager.createMoveableElement(`${slideId}-title`, titleRef, 'text')
  ];
  
  return (
    <div style={slideStyles}>
      {/* MoveableManager handles all drag/resize */}
      <MoveableManager
        {...moveableManager.moveableManagerProps}
        elements={moveableElements}
      />
      
      {/* Image with cropping controls */}
      <ClickableImagePlaceholder
        elementId={`${slideId}-image`}
        elementRef={imageRef}
        cropMode={moveableManager.getCropMode(`${slideId}-image`)}
        onCropModeChange={(mode) => 
          moveableManager.handleCropModeChange(`${slideId}-image`, mode)
        }
        // ... other props
      />
      
      {/* Title with moveable support */}
      <div 
        ref={titleRef}
        data-moveable-element={`${slideId}-title`}
        data-draggable="true"
      >
        <h1>{title}</h1>
      </div>
    </div>
  );
};
```

## Troubleshooting

### Common Issues

1. **Elements not draggable**: Ensure `data-moveable-element` attribute is set
2. **Resize handles not visible**: Check that `isEnabled={true}` and element is selected
3. **Crop controls not showing**: Verify `isEditable={true}` and image is uploaded
4. **Transform not saving**: Ensure `onUpdate` callback is properly connected

### Debug Tips

- Check browser console for react-moveable errors
- Verify refs are properly connected to DOM elements
- Ensure element IDs are unique within the slide
- Test with `console.log` in callback functions

## Performance Considerations

- MoveableManager only renders when elements are selected
- Transform events are throttled for smooth performance
- State updates are batched to minimize re-renders
- Cleanup functions prevent memory leaks

## Browser Support

- Modern browsers with ES6+ support
- Touch devices supported via react-moveable
- Keyboard navigation for accessibility
- Fallback to basic functionality in older browsers
