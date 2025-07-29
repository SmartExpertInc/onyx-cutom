# Dynamic Text Width Implementation

## Problem Statement

In the projects list view, users can adjust column widths dynamically, but the project names and folder names were using fixed `max-w-[200px]` classes that didn't adjust to the column width. This meant that regardless of how wide a user made the title column, the text would always show the same number of characters.

## Solution Overview

Implemented a dynamic text width system that:
1. Calculates available width based on column width percentage
2. Adjusts text truncation dynamically
3. Maintains readability with minimum width constraints
4. Works responsively across different screen sizes

## Implementation Details

### 1. DynamicText Component

Created a new `DynamicText` component in `ProjectsTable.tsx` that:
- Takes column width percentage as a prop
- Calculates available text width dynamically
- Handles both regular text and link text
- Updates on window resize
- Maintains tooltip functionality

```tsx
const DynamicText: React.FC<{
  text: string;
  columnWidthPercent: number;
  className?: string;
  title?: string;
  href?: string;
  onClick?: () => void;
}> = ({ text, columnWidthPercent, className = "", title, href, onClick }) => {
  // Implementation details...
};
```

### 2. Width Calculation Logic

The `calculateTextWidth` function:
- Converts column width percentage to pixel width
- Accounts for UI elements (icons, padding, etc.) by subtracting 120px
- Enforces a minimum width of 50px for readability
- Scales with container width

```tsx
const calculateTextWidth = (columnWidthPercent: number, containerWidth: number = 1200): number => {
  const pixelWidth = (columnWidthPercent / 100) * containerWidth;
  const availableWidth = pixelWidth - 120; // Account for icons, padding, etc.
  return Math.max(availableWidth, 50);
};
```

### 3. Responsive Updates

The component listens for window resize events and updates the text width accordingly:
- Uses `useEffect` to attach resize listener
- Finds the table container to get accurate width
- Recalculates text width when container size changes

### 4. Integration Points

Updated the following components to use DynamicText:

#### FolderRow Component
- Added `columnWidths` prop to interface
- Updated folder name display to use DynamicText
- Passed columnWidths to recursive child folder rows

#### Project Title Display
- Updated all three instances of project title links in list view
- Replaced fixed `max-w-[200px]` with DynamicText component
- Maintained all existing functionality (links, tooltips, etc.)

#### Sidebar Folder Names
- Updated sidebar folder names to use inline styles instead of fixed classes
- Ensured consistent behavior across the application

## Files Modified

1. **`custom_extensions/frontend/src/components/ProjectsTable.tsx`**
   - Added DynamicText component
   - Added calculateTextWidth helper function
   - Updated FolderRow component interface
   - Updated all project title displays
   - Updated folder name displays

2. **`custom_extensions/frontend/src/app/projects/page.tsx`**
   - Updated sidebar folder name display

## Testing

Created a test script (`test_dynamic_text_width.py`) that verifies:
- Width calculation accuracy
- Minimum width enforcement
- Responsive behavior
- Edge cases

### Test Results
```
20% column width, 1200px container: 120px available
30% column width, 1200px container: 240px available
40% column width, 1200px container: 360px available
50% column width, 1200px container: 480px available
```

## Benefits

1. **Dynamic Adjustment**: Text width now adjusts based on user column width preferences
2. **Better UX**: Users can see more or less text based on their column width settings
3. **Responsive**: Works across different screen sizes and container widths
4. **Maintainable**: Centralized logic in reusable component
5. **Backward Compatible**: Maintains all existing functionality

## Technical Considerations

1. **Performance**: Uses efficient resize listeners with cleanup
2. **Accessibility**: Maintains tooltip functionality for truncated text
3. **Cross-browser**: Uses standard DOM APIs for width calculation
4. **Type Safety**: Full TypeScript support with proper interfaces

## Future Enhancements

1. **Character Count Estimation**: Could add character count estimation based on font metrics
2. **Ellipsis Customization**: Could allow custom ellipsis characters
3. **Animation**: Could add smooth transitions when column width changes
4. **Global Settings**: Could make minimum width configurable per user

## Usage Example

```tsx
// Before (fixed width)
<Link className="truncate max-w-[200px]" title={title}>
  {title}
</Link>

// After (dynamic width)
<DynamicText 
  text={title}
  columnWidthPercent={columnWidths.title}
  href={`/projects/view/${id}`}
  title={title}
/>
``` 