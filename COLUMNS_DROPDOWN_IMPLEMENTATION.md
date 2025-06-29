# Columns Dropdown Implementation

## Overview
Added a "Columns" dropdown to the projects list view that allows users to select which columns they want to see. The dropdown includes checkboxes for each column with the following default settings:
- **Title**: ✅ (enabled by default)
- **Created**: ❌ (disabled by default)
- **Creator**: ❌ (disabled by default)
- **Number of lessons**: ✅ (enabled by default)
- **Est. creation time**: ✅ (enabled by default)
- **Est. completion time**: ✅ (enabled by default)

## Changes Made

### Frontend Changes (`custom_extensions/frontend/src/components/ProjectsTable.tsx`)

#### 1. **New Imports**
- Added `CheckSquare`, `Square` icons from lucide-react for the checkbox UI

#### 2. **New Interface**
- Added `ColumnVisibility` interface to define the structure of column visibility settings:
  ```typescript
  interface ColumnVisibility {
      title: boolean;
      created: boolean;
      creator: boolean;
      numberOfLessons: boolean;
      estCreationTime: boolean;
      estCompletionTime: boolean;
  }
  ```

#### 3. **State Management**
- Added `columnVisibility` state with default values where only title, numberOfLessons, estCreationTime, and estCompletionTime are enabled
- Added `showColumnsDropdown` state to control dropdown visibility

#### 4. **Columns Dropdown Component**
- Added dropdown button next to the "Sort" button in the toolbar
- Implemented dropdown menu with checkboxes for each column
- Added click outside handler to close dropdown when clicking outside
- Used `data-columns-dropdown` attribute for proper event handling

#### 5. **Dynamic Table Headers**
- Updated table headers to conditionally render based on `columnVisibility` settings
- Each header is wrapped in a conditional check: `{columnVisibility.title && <th>...</th>}`

#### 6. **Dynamic Table Rows**
- Updated all table row types to respect column visibility:
  - **Folder rows**: Only show cells for enabled columns
  - **Folder project rows**: Only show cells for enabled columns
  - **Unassigned project rows**: Only show cells for enabled columns
  - **Trash/folder-specific project rows**: Only show cells for enabled columns

#### 7. **Dynamic Colspan**
- Updated loading row colspan to dynamically calculate based on visible columns: `Object.values(columnVisibility).filter(Boolean).length + 1`

## Features

### ✅ **User Interface**
- Clean dropdown design with checkboxes
- Visual feedback with CheckSquare/Square icons
- Hover effects and proper spacing
- Click outside to close functionality

### ✅ **Column Management**
- Real-time column visibility updates
- Persistent state during session
- All table row types respect visibility settings
- Proper colspan calculations for loading states

### ✅ **Default Configuration**
- Sensible defaults with most important columns enabled
- Title, Number of lessons, Est. creation time, and Est. completion time enabled by default
- Created and Creator columns disabled by default

### ✅ **Responsive Design**
- Dropdown positioned correctly relative to button
- Proper z-index handling
- Mobile-friendly touch targets

## Usage

1. **Access**: Click the "Columns" button in the toolbar (next to "Sort")
2. **Toggle Columns**: Check/uncheck columns to show/hide them
3. **Real-time Updates**: Table updates immediately when columns are toggled
4. **Close**: Click outside the dropdown or click the button again

## Technical Implementation

### State Management
```typescript
const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    title: true,
    created: false,
    creator: false,
    numberOfLessons: true,
    estCreationTime: true,
    estCompletionTime: true
});
```

### Conditional Rendering
```typescript
{columnVisibility.title && (
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {/* Column content */}
    </td>
)}
```

### Dynamic Colspan
```typescript
<td colSpan={Object.values(columnVisibility).filter(Boolean).length + 1}>
    Loading projects...
</td>
```

## Benefits

1. **User Customization**: Users can personalize their view based on their needs
2. **Reduced Clutter**: Hide less important columns to focus on relevant data
3. **Better UX**: Cleaner interface with only necessary information visible
4. **Flexibility**: Easy to add new columns in the future
5. **Performance**: Potentially better performance with fewer DOM elements

## Future Enhancements

- **Persistent Settings**: Save column preferences to localStorage or backend
- **Column Reordering**: Allow users to drag and drop columns to reorder them
- **Column Width**: Allow users to resize columns
- **Export Options**: Include only visible columns in exports
- **Presets**: Predefined column configurations for different use cases 