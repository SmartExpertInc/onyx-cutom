# Products Page Share Button Implementation

## Change Summary

Modified the 3-dots menu on the main products page to:
1. **For course outlines**: Make the "Share" button work exactly like the share button on the view-new-2 page
2. **For other products**: Remove the "Share" button entirely from the 3-dots menu

## Implementation

### Modified File
`custom_extensions/frontend/src/components/ProjectsTable.tsx`

### Changes Made

#### 1. Added Share State Variables
Added share-related state to the `ProjectRowMenu` component:

```typescript
// Share state for course outlines
const [isSharing, setIsSharing] = React.useState(false);
const [shareData, setShareData] = React.useState<{
  shareToken: string;
  publicUrl: string;
  expiresAt: string;
} | null>(null);
const [shareError, setShareError] = React.useState<string | null>(null);
const [showShareModal, setShowShareModal] = React.useState(false);
```

#### 2. Added Share Handler Function
Implemented `handleShareCourse` function that mirrors the functionality from view-new-2:

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

#### 3. Made Share Button Conditional
Updated the Share button to only show for course outlines:

```typescript
{/* Share button - only for course outlines */}
{isOutline && (
  <Button 
    onClick={handleShareCourse}
    disabled={isSharing}
    className="flex items-center justify-start gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-none cursor-pointer border-0 shadow-none disabled:opacity-60"
  >
    <Share2 size={16} className="text-gray-500" />
    <span>{isSharing ? t("actions.sharing", "Sharing...") : t("actions.share", "Share...")}</span>
  </Button>
)}
```

#### 4. Added Share Modals
Added success and error modals for the share functionality:

- **Share Success Modal**: Shows the public URL with copy functionality and expiration date
- **Share Error Modal**: Shows error messages if sharing fails

#### 5. Added Required Imports
Added `X` icon import for modal close buttons:

```typescript
import {
  // ... existing imports
  X,
  // ... other imports
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

### For Course Outlines
1. **3-dots menu** shows "Share..." option
2. **Clicking Share** triggers the sharing process
3. **Success modal** shows public URL with copy button
4. **Error modal** shows error message if sharing fails
5. **Loading state** shows "Sharing..." while processing

### For Other Products
1. **3-dots menu** shows standard options (Rename, Duplicate, Send to trash)
2. **No Share button** - cleaner interface for non-shareable products
3. **Consistent experience** with other product types

## API Integration

The implementation uses the same backend endpoint as the view-new-2 page:

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

## Testing Checklist

- ✅ Share button only appears for course outlines
- ✅ Share button hidden for other product types
- ✅ Share functionality works correctly
- ✅ Success modal shows public URL
- ✅ Copy button works in success modal
- ✅ Error modal shows appropriate error messages
- ✅ Loading states work correctly
- ✅ Modal close functionality works
- ✅ Consistent styling with existing UI

## Related Files

- `custom_extensions/frontend/src/app/projects/view-new-2/[productId]/page.tsx` - Reference implementation
- `custom_extensions/backend/main.py` - Backend API endpoints
- `custom_extensions/frontend/src/app/public/course/[share_token]/page.tsx` - Public viewer

## Conclusion

The Share button has been successfully implemented on the main products page with conditional visibility and full functionality for course outlines, while being completely hidden for other product types. This provides a consistent and intuitive user experience across the platform.

