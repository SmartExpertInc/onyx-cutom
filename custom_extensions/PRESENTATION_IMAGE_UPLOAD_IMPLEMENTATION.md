# Presentation Image Upload Implementation

## Overview

This document provides a comprehensive analysis and implementation of image upload functionality for presentations, extending the existing One Pagers image upload system to support clickable image placeholders in presentation templates.

## Analysis Summary

### Current One Pagers Image Upload Flow

#### 1. Frontend Flow
- **User Interaction**: User clicks upload button in `TextPresentationDisplay.tsx`
- **Modal Component**: `ImageUploadModal` handles file selection/drag-drop
- **API Call**: Uses `uploadOnePagerImage()` function from `designTemplateApi.ts`
- **Data Transfer**: FormData is created and sent to `/api/custom/onepager/upload_image`

#### 2. Backend Flow
- **Endpoint**: `/api/custom/onepager/upload_image` in `main.py`
- **Validation**: File type (PNG, JPG, JPEG, GIF, WebP) and size (10MB max)
- **File Storage**: Generates unique filename with `onepager_` prefix
- **Storage Location**: Saves to `static_design_images/` directory
- **Response**: Returns `{"file_path": "/static_design_images/filename"}`

#### 3. Database Storage
- **File Storage**: Images stored as files in `static_design_images/` directory
- **Metadata Storage**: Image paths stored in JSON format in `projects.microproduct_content` column
- **Data Structure**: Image blocks have structure: `{type: 'image', src: '/static_design_images/...', ...}`

#### 4. PDF Integration
- **Processing**: `pdf_generator.py` processes image blocks during PDF generation
- **Conversion**: Converts image paths to base64 data URLs for PDF embedding
- **Embedding**: Images embedded directly in PDF using data URLs

### Current Presentation Template Structure
- **Static Placeholders**: Templates use hardcoded gray blocks with text
- **No Upload Functionality**: No click-to-upload capability exists
- **Template Examples**: `BulletPointsTemplate.tsx`, `BigImageTopTemplate.tsx`, etc.

## Implementation Details

### 1. Backend API Extension

#### New Endpoint: `/api/custom/presentation/upload_image`
```python
@app.post("/api/custom/presentation/upload_image")
async def upload_presentation_image(file: UploadFile = File(...)):
    """Upload an image for use in presentations"""
    allowed_extensions = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
    max_file_size = 10 * 1024 * 1024  # 10MB for presentation images
    
    # Validation and file processing logic
    # Generates unique filename with 'presentation_' prefix
    # Returns {"file_path": "/static_design_images/presentation_uuid.ext"}
```

**Key Features:**
- Same validation logic as One Pagers (file type, size limits)
- Unique filename generation with `presentation_` prefix for organization
- Consistent error handling and response format
- File storage in same `static_design_images/` directory

### 2. Frontend API Integration

#### New Function: `uploadPresentationImage()`
```typescript
export async function uploadPresentationImage(imageFile: File): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch(`${API_BASE_URL}/presentation/upload_image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to upload presentation image');
  }

  return response.json();
}
```

### 3. Reusable Components

#### A. PresentationImageUpload Component
**File**: `frontend/src/components/PresentationImageUpload.tsx`

**Features:**
- Drag-and-drop file upload
- File type validation
- Loading states and error handling
- Consistent UI with existing upload modals
- Reusable across all presentation templates

**Usage:**
```tsx
<PresentationImageUpload
  isOpen={showUploadModal}
  onClose={() => setShowUploadModal(false)}
  onImageUploaded={handleImageUploaded}
  title="Upload Presentation Image"
/>
```

#### B. ClickableImagePlaceholder Component
**File**: `frontend/src/components/ClickableImagePlaceholder.tsx`

**Features:**
- Displays placeholder when no image is uploaded
- Shows uploaded image when available
- Click-to-upload functionality
- Configurable size, position, and styling
- Hover effects and visual feedback

**Usage:**
```tsx
<ClickableImagePlaceholder
  imagePath={imagePath}
  onImageUploaded={handleImageUploaded}
  size="LARGE"
  position="CENTER"
  description="Click to upload image"
  prompt={displayPrompt}
  isEditable={isEditable}
/>
```

### 4. Template Integration

#### Updated BulletPointsTemplate
**File**: `frontend/src/components/templates/BulletPointsTemplate.tsx`

**Changes:**
- Added `imagePath` prop to interface
- Replaced static placeholder with `ClickableImagePlaceholder`
- Added `handleImageUploaded` function
- Integrated with existing `onUpdate` callback

**Key Integration Points:**
```tsx
// Added to props interface
imagePath?: string;

// Added handler function
const handleImageUploaded = (newImagePath: string) => {
  if (onUpdate) {
    onUpdate({ imagePath: newImagePath });
  }
};

// Replaced static placeholder
<ClickableImagePlaceholder
  imagePath={imagePath}
  onImageUploaded={handleImageUploaded}
  size="LARGE"
  position="CENTER"
  description="Click to upload image"
  prompt={displayPrompt}
  isEditable={isEditable}
/>
```

### 5. Type System Updates

#### Updated Interfaces
**File**: `frontend/src/types/slideTemplates.ts`

**Changes:**
- Added `imagePath?: string` to `BulletPointsProps`
- Added `imagePath?: string` to `BigImageLeftProps`
- Maintains backward compatibility

### 6. Database Integration

#### Storage Strategy
- **File Storage**: Images stored in `static_design_images/` directory
- **Database Storage**: Image paths stored in `projects.microproduct_content` JSON
- **Naming Convention**: `presentation_uuid.ext` for organization
- **Consistency**: Same approach as One Pagers for maintainability

#### Data Flow
1. User uploads image → Backend saves file → Returns file path
2. Frontend receives path → Updates template props → Saves to database
3. PDF generation reads image path → Converts to base64 → Embeds in PDF

### 7. PDF Integration

#### Existing PDF Generation
The existing PDF generation system in `pdf_generator.py` already supports:
- Processing image blocks from content
- Converting image paths to base64 data URLs
- Embedding images directly in PDF output

#### No Changes Required
Since presentation images use the same storage pattern as One Pagers:
- Same file path format (`/static_design_images/...`)
- Same image block structure
- Same PDF processing logic

## Usage Instructions

### For Developers

#### 1. Adding Image Upload to New Templates
```tsx
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

// Add imagePath to props interface
interface MyTemplateProps {
  // ... existing props
  imagePath?: string;
}

// Add handler function
const handleImageUploaded = (newImagePath: string) => {
  if (onUpdate) {
    onUpdate({ imagePath: newImagePath });
  }
};

// Replace static placeholder
<ClickableImagePlaceholder
  imagePath={imagePath}
  onImageUploaded={handleImageUploaded}
  size="MEDIUM"
  position="LEFT"
  isEditable={isEditable}
/>
```

#### 2. Customizing Image Placeholder
```tsx
<ClickableImagePlaceholder
  imagePath={imagePath}
  onImageUploaded={handleImageUploaded}
  size="LARGE" // SMALL, MEDIUM, LARGE
  position="CENTER" // LEFT, RIGHT, CENTER, BACKGROUND
  description="Custom description"
  prompt="AI prompt for image generation"
  isEditable={true}
  className="custom-class"
  style={{ customStyles: 'here' }}
/>
```

### For Users

#### 1. Uploading Images
1. Click on any image placeholder in a presentation template
2. Choose file from computer or drag-and-drop
3. Supported formats: PNG, JPG, JPEG, GIF, WebP (max 10MB)
4. Image automatically replaces placeholder

#### 2. Replacing Images
1. Click on existing image to open upload modal
2. Select new image file
3. New image replaces current image

#### 3. PDF Generation
- Uploaded images automatically included in PDF output
- No additional steps required
- Images embedded as base64 data for portability

## Technical Benefits

### 1. Consistency
- Same upload flow as One Pagers
- Same file storage and database patterns
- Same PDF integration approach

### 2. Maintainability
- Reusable components across templates
- Centralized upload logic
- Consistent error handling

### 3. User Experience
- Intuitive click-to-upload interface
- Visual feedback during upload
- Drag-and-drop support
- Immediate preview of uploaded images

### 4. Performance
- Efficient file storage
- Optimized PDF generation
- Minimal database overhead

## Future Enhancements

### 1. Image Editing
- Crop and resize functionality
- Basic image filters
- Alt text editing

### 2. Multiple Images
- Support for multiple image placeholders per slide
- Image gallery functionality

### 3. AI Integration
- Automatic image generation from prompts
- Image style matching

### 4. Advanced Features
- Image compression
- WebP conversion
- CDN integration

## Testing

### Backend Testing
```bash
# Test presentation image upload endpoint
curl -X POST -F "file=@test-image.png" http://localhost:8000/api/custom/presentation/upload_image
```

### Frontend Testing
1. Test image upload in BulletPointsTemplate
2. Verify PDF generation includes uploaded images
3. Test error handling for invalid files
4. Test drag-and-drop functionality

## Conclusion

This implementation successfully extends the existing One Pagers image upload system to support presentation templates while maintaining consistency, reusability, and user experience. The modular approach allows for easy extension to additional templates and future enhancements. 