# Nested Folders Implementation

## Overview

This implementation adds support for hierarchical folder structures where users can create folders inside other folders, enabling better organization of projects and content.

## Features

### ✅ Implemented Features

1. **Hierarchical Folder Structure**
   - Folders can have parent folders (nested structure)
   - Unlimited nesting depth (with practical limits)
   - Visual tree structure in the sidebar

2. **Drag & Drop Support**
   - Drag folders into other folders
   - Drag projects into any folder level
   - Visual feedback during drag operations

3. **Folder Management**
   - Create folders with parent selection
   - Move folders between different parents
   - Expand/collapse folder trees
   - Circular reference prevention

4. **Database Schema**
   - Added `parent_id` column to `project_folders` table
   - Foreign key constraint with CASCADE delete
   - Indexed for performance

## Database Changes

### Schema Updates

```sql
-- Added to project_folders table
ALTER TABLE project_folders ADD COLUMN parent_id INTEGER REFERENCES project_folders(id) ON DELETE CASCADE;
CREATE INDEX idx_project_folders_parent_id ON project_folders(parent_id);
```

### Table Structure

```sql
CREATE TABLE project_folders (
    id SERIAL PRIMARY KEY,
    onyx_user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "order" INTEGER DEFAULT 0,
    parent_id INTEGER REFERENCES project_folders(id) ON DELETE CASCADE
);
```

## API Endpoints

### New Endpoints

#### 1. Move Folder
```http
PUT /api/custom/projects/folders/{folder_id}/move
```

**Request Body:**
```json
{
  "parent_id": 123  // null to move to root
}
```

**Response:**
```json
{
  "id": 456,
  "name": "Folder Name",
  "created_at": "2024-01-01T00:00:00Z",
  "parent_id": 123
}
```

### Updated Endpoints

#### 1. Create Folder
```http
POST /api/custom/projects/folders
```

**Request Body:**
```json
{
  "name": "Folder Name",
  "parent_id": 123  // optional, null for root
}
```

#### 2. List Folders
```http
GET /api/custom/projects/folders
```

**Response includes:**
```json
[
  {
    "id": 123,
    "name": "Folder Name",
    "created_at": "2024-01-01T00:00:00Z",
    "order": 0,
    "parent_id": null,
    "project_count": 5,
    "total_lessons": 25,
    "total_hours": 12.5,
    "total_completion_time": 180
  }
]
```

## Frontend Implementation

### Components

#### 1. FolderItem (Recursive Component)
- Displays individual folders with expand/collapse
- Handles drag and drop for both projects and folders
- Supports unlimited nesting levels
- Visual indicators for folder hierarchy

#### 2. Updated Sidebar
- Builds folder tree from flat API response
- Displays nested structure with proper indentation
- Maintains drag and drop functionality

### Key Functions

#### buildFolderTree()
```typescript
const buildFolderTree = (folders: any[]): Folder[] => {
  const folderMap = new Map<number, Folder>();
  const rootFolders: Folder[] = [];

  // First pass: create folder objects
  folders.forEach(folder => {
    folderMap.set(folder.id, { ...folder, children: [] });
  });

  // Second pass: build tree structure
  folders.forEach(folder => {
    const folderObj = folderMap.get(folder.id)!;
    if (folder.parent_id === null || folder.parent_id === undefined) {
      rootFolders.push(folderObj);
    } else {
      const parent = folderMap.get(folder.parent_id);
      if (parent) {
        parent.children!.push(folderObj);
      }
    }
  });

  return rootFolders;
};
```

### Drag & Drop Events

#### Project to Folder
```typescript
window.dispatchEvent(new CustomEvent('moveProjectToFolder', {
  detail: { projectId: data.projectId, folderId }
}));
```

#### Folder to Folder
```typescript
window.dispatchEvent(new CustomEvent('moveFolderToFolder', {
  detail: { folderId: data.folderId, targetParentId: folderId }
}));
```

## Security & Validation

### Circular Reference Prevention
The backend prevents circular references by:
1. Checking if target parent is the same as the folder being moved
2. Traversing up the tree to ensure no descendant becomes a parent
3. Returning 400 error for invalid moves

### User Authorization
- All folder operations verify user ownership
- Folders can only be moved by their owner
- Parent folders must belong to the same user

## Usage Examples

### Creating Nested Folders

1. **Create Root Folder**
   ```javascript
   await fetch('/api/custom-projects-backend/projects/folders', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ name: 'My Root Folder' })
   });
   ```

2. **Create Nested Folder**
   ```javascript
   await fetch('/api/custom-projects-backend/projects/folders', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ 
       name: 'Subfolder', 
       parent_id: rootFolderId 
     })
   });
   ```

### Moving Folders

```javascript
await fetch(`/api/custom-projects-backend/projects/folders/${folderId}/move`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ parent_id: newParentId })
});
```

## Testing

### Test Script
Run the test script to verify functionality:
```bash
python test_nested_folders.py
```

### Test Coverage
- ✅ Create root folders
- ✅ Create nested folders
- ✅ Create deeply nested folders
- ✅ List folder structure
- ✅ Move folders between parents
- ✅ Prevent circular references
- ✅ Visual tree display

## Migration Notes

### Backward Compatibility
- Existing folders will have `parent_id = null` (root level)
- No data migration required
- Existing API calls continue to work

### Database Migration
The schema changes are applied automatically on startup:
- Adds `parent_id` column if not exists
- Creates index for performance
- Handles existing data gracefully

## Performance Considerations

### Database Indexes
- `idx_project_folders_parent_id` for parent lookups
- `idx_project_folders_onyx_user_id` for user filtering
- Composite indexes for common queries

### Frontend Optimization
- Folder tree built once from API response
- Lazy loading of nested content
- Efficient drag and drop handling

## Future Enhancements

### Potential Improvements
1. **Bulk Operations**
   - Move multiple folders at once
   - Bulk project assignment

2. **Advanced Features**
   - Folder templates
   - Folder sharing between users
   - Folder permissions

3. **UI Enhancements**
   - Drag preview with folder tree
   - Keyboard navigation
   - Search within folders

## Troubleshooting

### Common Issues

1. **Circular Reference Error**
   - Ensure you're not moving a folder into its own descendant
   - Check the folder hierarchy before moving

2. **Folder Not Found**
   - Verify the folder ID exists
   - Ensure the folder belongs to the current user

3. **Drag and Drop Not Working**
   - Check browser console for errors
   - Verify event listeners are properly attached
   - Ensure proper data format in drag events

### Debug Information
- Check browser console for drag/drop events
- Verify API responses in network tab
- Use test script to validate backend functionality 