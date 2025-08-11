# Gamma-Style Full-Side Image Placeholder Implementation

## Overview

This implementation introduces Gamma-style full-side image behavior for specific slide layouts, where placeholders have constrained resizing that matches the layout's design intent.

## Layout Modes

### 1. Free Mode (`layoutMode="free"`)
- **Default behavior** for most placeholders
- **Resizing**: Full corner handles for proportional resizing
- **Image behavior**: `object-fit: contain` - maintains aspect ratio, fits within placeholder
- **Use cases**: Bullet points, general content slides

### 2. Full-Width Mode (`layoutMode="full-width"`)
- **Layout**: Image spans full slide width, height is adjustable
- **Resizing**: Only north/south handles for height adjustment
- **Image behavior**: `object-fit: cover` - fills width completely, crops height
- **Use cases**: Big Image Top template

### 3. Full-Height Mode (`layoutMode="full-height"`)
- **Layout**: Image spans full slide height, width is adjustable  
- **Resizing**: Only east/west handles for width adjustment
- **Image behavior**: `object-fit: cover` - fills height completely, crops width
- **Use cases**: Big Image Left template

## Implementation Details

### Component Changes

#### ClickableImagePlaceholder.tsx
- Added `layoutMode` prop with three options: `'free' | 'full-width' | 'full-height'`
- Updated `handleImageUploaded` to implement mode-specific sizing logic
- Image rendering now uses `objectFit` prop instead of hardcoded `'contain'`

#### ResizablePlaceholder.tsx
- Added `layoutMode` prop support
- Constrained resize logic in `onPointerMove`
- Dynamic handle rendering based on layout mode
- Added CSS styles for edge handles (n, s, e, w)

### Template Updates

#### BigImageLeftTemplate.tsx
```typescript
<ClickableImagePlaceholder
  // ... other props
  layoutMode="full-height"
  onSizeTransformChange={handleSizeTransformChange}
/>
```

#### BigImageTopTemplate.tsx
```typescript
<ClickableImagePlaceholder
  // ... other props
  layoutMode="full-width"
  onSizeTransformChange={handleSizeTransformChange}
/>
```

#### BulletPointsTemplate.tsx
```typescript
<ClickableImagePlaceholder
  // ... other props
  layoutMode="free"
  onSizeTransformChange={handleSizeTransformChange}
/>
```

### Type System Updates

#### slideTemplates.ts
- Added `layoutMode?: 'free' | 'full-width' | 'full-height'` to:
  - `BigImageLeftProps`
  - `BigImageTopProps` 
  - `BulletPointsProps`

## Behavior Specifications

### Image Upload Logic

#### Free Mode
1. Calculate scale to fit image within container bounds
2. Set placeholder to `imgW * scale` × `imgH * scale`
3. Use `object-fit: contain`

#### Full-Width Mode
1. Lock placeholder width to container width
2. Calculate height as `(containerWidth / imgW) * imgH`
3. Use `object-fit: cover`

#### Full-Height Mode
1. Lock placeholder height to container height
2. Calculate width as `(containerHeight / imgH) * imgW`
3. Use `object-fit: cover`

### Resizing Constraints

#### Free Mode
- All corner handles available
- Proportional resizing from corners
- Both dimensions adjustable

#### Full-Width Mode
- Only north/south handles visible
- Width locked to container
- Only height adjustable

#### Full-Height Mode
- Only east/west handles visible
- Height locked to container
- Only width adjustable

## Visual Design

### Handle Styling
- **Corner handles**: 10px × 10px blue squares with white borders
- **Edge handles**: Same styling, positioned at center of edges
- **Cursors**: 
  - `ns-resize` for north/south handles
  - `ew-resize` for east/west handles
  - `nwse-resize`/`nesw-resize` for corner handles

### Image Rendering
- **Free mode**: `object-fit: contain` - no cropping, maintains proportions
- **Full modes**: `object-fit: cover` - intentional cropping for design consistency

## Benefits

1. **Design Consistency**: Full-side images maintain visual impact
2. **User Experience**: Intuitive resizing that matches layout intent
3. **Gamma Compatibility**: Matches industry-standard behavior
4. **Flexibility**: Different modes for different use cases
5. **Performance**: Efficient rendering with CSS-based constraints

## Future Enhancements

- Add visual indicators for locked dimensions
- Implement smooth transitions between modes
- Add keyboard shortcuts for mode switching
- Consider adding intermediate modes (e.g., `full-width-flexible`)

## Migration Notes

- Existing slides default to `free` mode (backward compatible)
- New slides can specify `layoutMode` in template props
- No breaking changes to existing functionality
