# Service Drag and Drop Implementation

This document describes the new drag and drop implementation for services using `@dnd-kit` library.

## Overview

The service drag and drop functionality has been refactored from a custom `DraggableWrapper` implementation to use the modern `@dnd-kit` library for better performance, accessibility, and user experience.

## Components

### ServiceList Component

The main component that handles the drag and drop functionality for services.

**Location**: `src/components/ServiceList.tsx`

**Props**:
- `serviceOrder: string[]` - Array of service IDs in their current order
- `onServiceReorder: (newOrder: string[]) => void` - Callback when services are reordered
- `renderService: (serviceId: string) => React.ReactNode` - Function to render each service
- `deletedElements: { [key: string]: boolean }` - Object tracking deleted elements

**Features**:
- ✅ Smooth drag animations
- ✅ Visual drag overlay
- ✅ Keyboard navigation support
- ✅ Touch device support
- ✅ Accessibility compliant
- ✅ Performance optimized

## Usage

```tsx
import { ServiceList } from '@/components/ServiceList';

// In your component
<ServiceList
  serviceOrder={serviceOrder}
  onServiceReorder={handleServiceReorder}
  renderService={renderService}
  deletedElements={deletedElements}
/>
```

## Key Improvements

### 1. **Performance**
- Uses `@dnd-kit` which is optimized for React
- No unnecessary re-renders during drag operations
- Efficient collision detection

### 2. **User Experience**
- Smooth animations and transitions
- Visual feedback with drag overlay
- Better touch support for mobile devices
- Cursor changes during drag operations

### 3. **Accessibility**
- Full keyboard navigation support
- Screen reader compatible
- ARIA attributes automatically applied

### 4. **Developer Experience**
- Clean, maintainable code
- TypeScript support
- Easy to extend and customize

## Migration from Custom Implementation

The old custom `DraggableWrapper` has been replaced with:

1. **ServiceList component** - Handles the drag and drop logic
2. **@dnd-kit library** - Provides the underlying drag and drop functionality
3. **Simplified state management** - Uses simple array reordering instead of complex position tracking

## Dependencies

Make sure to install the required packages:

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Configuration

The drag and drop behavior can be customized by modifying the sensors in `ServiceList.tsx`:

```tsx
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Minimum distance before drag starts
    },
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);
```

## Troubleshooting

### Common Issues

1. **Services not dragging**: Check that `serviceOrder` contains valid service IDs
2. **Visual glitches**: Ensure proper CSS classes are applied
3. **Touch not working**: Verify PointerSensor configuration

### Debug Mode

Add console logging to track drag operations:

```tsx
function handleDragEnd(event: DragEndEvent) {
  console.log('Drag ended:', event);
  // ... rest of the logic
}
```
