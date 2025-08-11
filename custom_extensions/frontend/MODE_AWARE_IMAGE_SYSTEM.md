# Mode-Aware Image Placeholder System

## Overview

The Mode-Aware Image Placeholder System implements Gamma's two-mode behavior for handling images in slide templates. This system provides consistent, predictable resizing behavior across different slide layouts while maintaining image quality and aspect ratios.

## Two Modes

### 1. Full-Side Mode (`"full-side"`)

**Purpose**: For layouts where images should span the entire width or height of a slide area.

**Behavior**:
- One dimension (width or height) is locked to fill the available space
- Only the other dimension can be resized via a slider control
- Images use `object-fit: cover` to fill the entire placeholder
- Provides clean, intentional cropping for professional layouts

**Examples**:
- **Big Image Top**: Width locked to full slide width, height resizable via slider
- **Big Image Left**: Height locked to full slide height, width resizable via slider

**Resizing**: Slider control appears at the bottom of the image with real-time preview

### 2. Free-Proportion Mode (`"free-proportion"`)

**Purpose**: For layouts where images should maintain their original proportions.

**Behavior**:
- Image maintains its original aspect ratio exactly
- Placeholder matches the image's aspect ratio automatically
- Fully resizable proportionally using corner handles
- Images use `object-fit: contain` to show the entire image
- No forced cropping or distortion

**Examples**:
- **Bullet Points**: Image on the left maintains proportions alongside text
- **Content slides**: Images that should show completely without cropping

**Resizing**: Corner handles for proportional scaling

## Implementation

### Type Definitions

```typescript
export type ImageMode = 'full-side' | 'free-proportion';

export interface ImageModeConfig {
  mode: ImageMode;
  lockedSide?: 'width' | 'height'; // For full-side mode
  defaultSize?: {
    width?: number;
    height?: number;
  };
  constraints?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
}
```

### Component Usage

```typescript
// Full-side mode (Big Image Top)
<ClickableImagePlaceholder
  imagePath={imagePath}
  onImageUploaded={handleImageUploaded}
  imageMode="full-side"
  lockedSide="width"
  onSizeTransformChange={handleSizeTransformChange}
/>

// Free-proportion mode (Bullet Points)
<ClickableImagePlaceholder
  imagePath={imagePath}
  onImageUploaded={handleImageUploaded}
  imageMode="free-proportion"
  onSizeTransformChange={handleSizeTransformChange}
/>
```

### Template Configuration

Each slide template declares its image mode:

```typescript
// BigImageTopTemplate.tsx
<ClickableImagePlaceholder
  // ... other props
  imageMode="full-side"
  lockedSide="width" // Width locked, height resizable
/>

// BigImageLeftTemplate.tsx
<ClickableImagePlaceholder
  // ... other props
  imageMode="full-side"
  lockedSide="height" // Height locked, width resizable
/>

// BulletPointsTemplate.tsx
<ClickableImagePlaceholder
  // ... other props
  imageMode="free-proportion" // Fully proportional
/>
```

## Core Components

### 1. ModeAwareImagePlaceholder

The main component that handles both modes:

- **Props**: Mode configuration, size/transform data, callbacks
- **Features**: 
  - Mode-specific rendering and interaction
  - Automatic image sizing on upload
  - Resize controls (slider for full-side, handles for free-proportion)
  - Replace overlay for image management

### 2. useModeAwareResize Hook

Custom hook providing mode-aware resizing logic:

```typescript
const {
  handleSliderResize,
  handleCornerResize,
  handleImageUploadResize,
  getSliderValue,
  canResize,
  getResizeDirection
} = useModeAwareResize({
  mode,
  lockedSide,
  modeConfig,
  currentWidth,
  currentHeight,
  onSizeChange
});
```

### 3. ClickableImagePlaceholder

Wrapper component that determines mode based on template context:

- Automatically sets appropriate mode based on template type
- Provides consistent interface across all templates
- Handles position classes and layout integration

## Image Upload Behavior

### Full-Side Mode
1. Image is uploaded
2. System reads image dimensions
3. Calculates new size based on locked dimension
4. Applies `object-fit: cover` for full coverage
5. Updates placeholder dimensions

### Free-Proportion Mode
1. Image is uploaded
2. System reads image dimensions
3. Calculates proportional size within constraints
4. Applies `object-fit: contain` to show full image
5. Updates placeholder to match image aspect ratio

## Resizing Behavior

### Full-Side Mode Resizing
- **Slider Control**: Appears at bottom of image
- **Real-time Preview**: Shows current dimension value
- **Constraints**: Respects min/max values for resizable dimension
- **Smooth Animation**: Transitions between sizes

### Free-Proportion Mode Resizing
- **Corner Handles**: Appear on hover at corners
- **Proportional Scaling**: Maintains aspect ratio
- **Constraints**: Respects min/max values for both dimensions
- **Smooth Animation**: Transitions between sizes

## Styling System

### CSS Classes

```css
.mode-aware-image-placeholder {
  /* Base styles */
}

.mode-aware-image-placeholder[data-mode="full-side"] {
  /* Full-side specific styles */
}

.mode-aware-image-placeholder[data-mode="free-proportion"] {
  /* Free-proportion specific styles */
}

.resize-handle {
  /* Corner handle styles */
}

.resize-slider {
  /* Slider control styles */
}
```

### Data Attributes

- `data-mode`: Current mode (`"full-side"` or `"free-proportion"`)
- `data-locked-side`: Which side is locked (`"width"` or `"height"`)
- `data-has-image`: Whether an image is loaded

## Accessibility Features

- **Keyboard Navigation**: Tab through resize controls
- **Screen Reader Support**: ARIA labels for all interactive elements
- **Focus Management**: Clear focus indicators
- **High Contrast Support**: Enhanced visibility in high contrast mode
- **Reduced Motion**: Respects user's motion preferences

## Responsive Design

- **Mobile Optimization**: Larger touch targets on mobile
- **Adaptive Controls**: Slider and handles scale appropriately
- **Flexible Layouts**: Works across different screen sizes

## Performance Considerations

- **Debounced Updates**: Resize operations are debounced to prevent excessive re-renders
- **Efficient Re-renders**: Only necessary components update during resize
- **Memory Management**: Proper cleanup of event listeners and timeouts
- **Image Optimization**: Automatic sizing to prevent oversized images

## Migration Guide

### From Old System

1. **Update Template Props**: Add `imageMode` and `lockedSide` to template interfaces
2. **Replace Placeholder Usage**: Update `ClickableImagePlaceholder` calls with mode props
3. **Update Type Definitions**: Add new types to `slideTemplates.ts`
4. **Test Each Template**: Verify behavior matches expected mode

### Backward Compatibility

- Existing slides without mode data default to `free-proportion`
- Size/transform data is preserved and works with new system
- No breaking changes to existing functionality

## Best Practices

### Template Design
- Choose mode based on layout intent, not convenience
- Full-side for hero images and backgrounds
- Free-proportion for content images and illustrations

### User Experience
- Provide clear visual feedback during resize operations
- Maintain consistent behavior across similar layouts
- Respect user's image content (don't crop important details)

### Performance
- Use appropriate image sizes for each mode
- Implement proper loading states
- Optimize resize operations for smooth interaction

## Troubleshooting

### Common Issues

1. **Images not sizing correctly**: Check mode configuration and constraints
2. **Resize controls not appearing**: Verify `isEditable` prop and mode settings
3. **Aspect ratio distortion**: Ensure proper `object-fit` values for each mode
4. **Performance issues**: Check for excessive re-renders during resize

### Debug Tools

- Browser dev tools to inspect data attributes
- React DevTools to check component props
- Console logging for resize operations

## Future Enhancements

- **Additional Modes**: Support for more complex image behaviors
- **Advanced Cropping**: Manual crop controls for full-side mode
- **Image Filters**: Built-in image enhancement options
- **Batch Operations**: Resize multiple images simultaneously
- **Preset Sizes**: Quick size presets for common use cases
