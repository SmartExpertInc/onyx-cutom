# Deletable Elements System

A universal solution for adding delete functionality to any div or component with a red cross button that appears on hover.

## Components

### 1. DeletableDiv
Simple wrapper for making any div deletable.

### 2. DeletableWrapper
Advanced wrapper with more customization options.

### 3. useDeletableElements Hook
Hook for managing collections of deletable elements.

## Usage Examples

### Basic Usage

```tsx
import DeletableDiv from '../components/DeletableDiv';

<DeletableDiv
  onDelete={() => console.log('Deleted!')}
  className="p-4 bg-blue-100 rounded"
>
  <p>This div can be deleted!</p>
</DeletableDiv>
```

### Advanced Usage with DeletableWrapper

```tsx
import DeletableWrapper from '../components/DeletableWrapper';

<DeletableWrapper
  onDelete={() => handleDelete(item.id)}
  deleteButtonPosition="top-right"
  deleteButtonSize="md"
  confirmDelete={true}
  deleteConfirmText="Are you sure?"
  className="p-4 bg-gray-100 rounded"
>
  <div>
    <h3>Item Title</h3>
    <p>Item description</p>
  </div>
</DeletableWrapper>
```

### Using the Hook for Dynamic Lists

```tsx
import { useDeletableElements } from '../hooks/useDeletableElements';

const MyComponent = () => {
  const {
    elements,
    addElement,
    removeElement,
    updateElement
  } = useDeletableElements([
    { id: '1', title: 'Item 1' },
    { id: '2', title: 'Item 2' }
  ]);

  return (
    <div>
      {elements.map(item => (
        <DeletableWrapper
          key={item.id}
          onDelete={() => removeElement(item.id)}
        >
          <div>{item.title}</div>
        </DeletableWrapper>
      ))}
    </div>
  );
};
```

### Making Existing Components Deletable

```tsx
import { makeDeletable } from '../utils/deletableUtils';

const DeletableCard = makeDeletable(Card, {
  deleteButtonPosition: 'top-right',
  confirmDelete: true
});

// Usage
<DeletableCard
  onDelete={() => handleDelete(card.id)}
  title="My Card"
  content="Card content"
/>
```

## Props

### DeletableDiv Props
- `onDelete?: () => void` - Function called when delete button is clicked
- `className?: string` - Additional CSS classes for the wrapper
- `deleteButtonClassName?: string` - Additional CSS classes for the delete button
- `confirmDelete?: boolean` - Show confirmation dialog (default: true)
- `deleteConfirmText?: string` - Custom confirmation message
- `disabled?: boolean` - Disable delete functionality

### DeletableWrapper Props
All DeletableDiv props plus:
- `showOnHover?: boolean` - Show delete button only on hover (default: true)
- `deleteButtonPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'` - Position of delete button
- `deleteButtonSize?: 'sm' | 'md' | 'lg'` - Size of delete button

### useDeletableElements Hook
Returns:
- `elements: T[]` - Array of elements
- `addElement: (element: T) => void` - Add new element
- `removeElement: (id: string) => void` - Remove element by ID
- `updateElement: (id: string, updates: Partial<T>) => void` - Update element
- `clearElements: () => void` - Clear all elements
- `getElement: (id: string) => T | undefined` - Get element by ID
- `setElements: (elements: T[]) => void` - Set all elements

## Features

- ✅ Hover to show delete button
- ✅ Confirmation dialog (optional)
- ✅ Customizable button position and size
- ✅ Loading state during deletion
- ✅ Disabled state support
- ✅ TypeScript support
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Accessibility support

## Styling

The delete button uses Tailwind CSS classes and can be customized:

```tsx
<DeletableWrapper
  deleteButtonClassName="bg-red-600 hover:bg-red-700 shadow-xl"
  className="my-custom-wrapper-class"
>
  Content
</DeletableWrapper>
```

## Integration with Existing Code

To make existing elements deletable without changing their structure:

```tsx
// Wrap existing component
<DeletableWrapper onDelete={handleDelete}>
  <ExistingComponent />
</DeletableWrapper>

// Or use the utility function
const DeletableExistingComponent = makeDeletable(ExistingComponent);
```
