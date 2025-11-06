# Grid View Share Button Implementation

## Change Summary

Applied the same share button functionality to the grid view of the main products page:
1. **For course outlines**: Show "Share..." button in 3-dots menu with full functionality
2. **For other products**: Hide the "Share..." button entirely
3. **Fixed success modal**: Made the public URL text darker for better readability

## Implementation

### Modified Files
1. `custom_extensions/frontend/src/components/ProjectsTable.tsx` - Fixed success modal link color
2. `custom_extensions/frontend/src/components/ui/project-card.tsx` - Added share functionality to grid view

### Changes Made

#### 1. Fixed Success Modal Link Color
Updated the success modal in `ProjectsTable.tsx` to make the public URL text darker:

```typescript
<input
  type="text"
  value={shareData.publicUrl}
  readOnly
  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-900"
/>
```

#### 2. Added Share State to Grid View
Added share-related state variables to the `ProjectCard` component:

```typescript
// Share state for course outlines
const [isSharing, setIsSharing] = useState(false);
const [shareData, setShareData] = useState<{
  shareToken: string;
  publicUrl: string;
  expiresAt: string;
} | null>(null);
const [shareError, setShareError] = useState<string | null>(null);
const [showShareModal, setShowShareModal] = useState(false);
```

#### 3. Added Share Handler Function
Implemented `handleShareCourse` function that mirrors the functionality from the list view:

```typescript
const handleShareCourse = async () => {
  if (!project.id) return;
  
  setIsSharing(true);
  setShareError(null);
  setMenuOpen(false);
  
  try {
    const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";
    const response = await fetch(`${CUSTOM_BACKEND_URL}/course-outlines/${project.id}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expires_in_days: 30 // Default 30 days
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to share course: ${response.status}`);
    }

    const data = await response.json();
    setShareData({
      shareToken: data.share_token,
      publicUrl: data.public_url,
      expiresAt: data.expires_at
    });
    setShowShareModal(true);
    
    console.log('✅ [COURSE SHARING] Successfully created share link:', data.public_url);
    
  } catch (error: any) {
    console.error('❌ [COURSE SHARING] Error sharing course:', error);
    setShareError(error.message || 'Failed to create share link');
  } finally {
    setIsSharing(false);
  }
};
```

#### 4. Made Share Button Conditional
Updated the Share button in the dropdown menu to only show for course outlines:

```typescript
{/* Share button - only for course outlines */}
{isOutline && (
  <DropdownMenuItem onClick={handleShareCourse} disabled={isSharing}>
    <Share2 size={16} className="text-gray-500" />
    <span>{isSharing ? t("actions.sharing", "Sharing...") : t("actions.share", "Share...")}</span>
  </DropdownMenuItem>
)}
```

#### 5. Added Share Modals
Added success and error modals for the share functionality:

- **Share Success Modal**: Shows the public URL with copy functionality and expiration date
- **Share Error Modal**: Shows error messages if sharing fails

#### 6. Added Required Imports
Added `X` icon import for modal close buttons:

```typescript
import { 
  // ... existing imports
  X
} from "lucide-react";
```

## Product Type Detection

The implementation uses the existing `isOutline` variable to detect course outlines:

```typescript
const isOutline = (project.designMicroproductType || "").toLowerCase() === "training plan";
```

This ensures that:
- ✅ **Course outlines** (Training Plan): Show Share button with full functionality
- ❌ **Other products** (Presentations, Quizzes, One-pagers, etc.): No Share button

## User Experience

### For Course Outlines (Grid View)
1. **3-dots menu** shows "Share..." option
2. **Clicking Share** triggers the sharing process
3. **Success modal** shows public URL with copy button
4. **Error modal** shows error message if sharing fails
5. **Loading state** shows "Sharing..." while processing

### For Other Products (Grid View)
1. **3-dots menu** shows standard options (Rename, Duplicate, Send to trash)
2. **No Share button** - cleaner interface for non-shareable products
3. **Consistent experience** with other product types

## Consistency Across Views

Both list view and grid view now have identical share functionality:

### List View (`ProjectsTable.tsx`)
- ✅ Share button in 3-dots menu
- ✅ Conditional visibility (course outlines only)
- ✅ Full share functionality with modals
- ✅ Darker link text in success modal

### Grid View (`project-card.tsx`)
- ✅ Share button in dropdown menu
- ✅ Conditional visibility (course outlines only)
- ✅ Full share functionality with modals
- ✅ Darker link text in success modal

## API Integration

Both views use the same backend endpoint:

- **Endpoint**: `POST /api/custom-projects-backend/course-outlines/{id}/share`
- **Payload**: `{ "expires_in_days": 30 }`
- **Response**: `{ "share_token": "...", "public_url": "...", "expires_at": "..." }`

## Technical Details

### State Management
- Uses React state for share status, data, and error handling
- Proper loading states and error handling
- Modal state management for success/error display

### Error Handling
- Network error handling with user-friendly messages
- API error response parsing
- Fallback error messages for unknown errors

### UI/UX
- Consistent styling with existing modals
- Loading states with disabled buttons
- Copy-to-clipboard functionality
- Responsive modal design
- Darker text for better readability

## Testing Checklist

- ✅ Share button only appears for course outlines in grid view
- ✅ Share button hidden for other product types in grid view
- ✅ Share functionality works correctly in grid view
- ✅ Success modal shows public URL with darker text
- ✅ Copy button works in success modal
- ✅ Error modal shows appropriate error messages
- ✅ Loading states work correctly
- ✅ Modal close functionality works
- ✅ Consistent styling with existing UI
- ✅ Consistent behavior between list and grid views

## Related Files

- `custom_extensions/frontend/src/components/ProjectsTable.tsx` - List view implementation
- `custom_extensions/frontend/src/components/ui/project-card.tsx` - Grid view implementation
- `custom_extensions/backend/main.py` - Backend API endpoints
- `custom_extensions/frontend/src/app/public/course/[share_token]/page.tsx` - Public viewer

## Conclusion

The Share button has been successfully implemented in both list and grid views of the main products page with:
- ✅ Conditional visibility (course outlines only)
- ✅ Full share functionality with modals
- ✅ Consistent user experience across both views
- ✅ Improved readability with darker link text
- ✅ Clean interface for non-shareable products

Both views now provide identical functionality while maintaining their respective UI patterns and user interactions.
