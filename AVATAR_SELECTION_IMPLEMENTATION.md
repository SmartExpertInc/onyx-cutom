# Avatar Selection Implementation

## Overview

This document describes the implementation of dynamic avatar selection functionality for the video generation application. The feature allows users to select from a list of available AI avatars instead of using a hardcoded avatar.

## Features Implemented

### 1. Frontend Avatar Selector Component

**File**: `onyx-cutom/custom_extensions/frontend/src/components/AvatarSelector.tsx`

**Features**:
- Fetches available avatars from the backend API
- Displays avatars in a dropdown with thumbnails
- Supports avatar variants (e.g., "Gia - Business", "Gia - Casual")
- Shows loading states and error handling
- Responsive design with proper accessibility

**Key Components**:
- `AvatarSelector`: Main dropdown component
- `Avatar` interface: TypeScript interface for avatar data
- `AvatarVariant` interface: TypeScript interface for avatar variants

### 2. Enhanced Video Generation Buttons

**Files**:
- `onyx-cutom/custom_extensions/frontend/src/components/VideoDownloadButton.tsx`
- `onyx-cutom/custom_extensions/frontend/src/components/ProfessionalVideoPresentationButton.tsx`

**Enhancements**:
- Added avatar selection before video generation
- Integrated with existing video generation workflow
- Maintains backward compatibility
- Proper error handling for missing avatar selection

### 3. Backend Avatar Processing

**File**: `onyx-cutom/custom_extensions/backend/app/services/video_generation_service.py`

**Enhancements**:
- Enhanced avatar code parsing to support variants (e.g., "gia.casual")
- Dynamic canvas URL selection (uses variant canvas if available)
- Improved error handling and logging
- Maintains compatibility with existing avatar codes

## API Endpoints

### GET `/api/custom/video/avatars`

**Purpose**: Fetch available avatars from Elai API

**Response Format**:
```json
{
  "success": true,
  "avatars": [
    {
      "id": "65841fc2c10c114a3d348cf7",
      "code": "gia",
      "name": "Gia",
      "gender": "female",
      "thumbnail": "https://...",
      "canvas": "https://...",
      "variants": [
        {
          "code": "business",
          "name": "Business",
          "thumbnail": "https://...",
          "canvas": "https://..."
        },
        {
          "code": "casual",
          "name": "Casual",
          "thumbnail": "https://...",
          "canvas": "https://..."
        }
      ]
    }
  ]
}
```

### POST `/api/custom/presentations`

**Enhanced Parameters**:
- `avatarCode`: Avatar code (e.g., "gia" or "gia.casual")
- `useAvatarMask`: Boolean flag for avatar masking
- Other existing parameters remain unchanged

## Avatar Code Format

The system supports two avatar code formats:

1. **Base Avatar**: `"gia"` - Uses the main avatar
2. **Avatar with Variant**: `"gia.casual"` - Uses a specific variant of the avatar

### Code Parsing Logic

```python
if '.' in avatar_code:
    base_code, variant_code = avatar_code.split('.', 1)
    # Search for avatar with base_code and variant with variant_code
else:
    # Search for avatar with exact avatar_code match
```

## User Interface

### Avatar Selection Flow

1. **Page Load**: Avatar selector fetches available avatars
2. **Avatar Selection**: User selects an avatar from the dropdown
3. **Variant Selection**: If available, user can select a variant (e.g., Business, Casual)
4. **Video Generation**: Selected avatar is used for video generation

### Visual Elements

- **Avatar Thumbnails**: Small circular images for each avatar
- **Variant Indicators**: Bullet points for avatar variants
- **Selection State**: Visual feedback for selected avatar
- **Loading States**: Spinner during avatar fetching
- **Error Handling**: Retry button for failed requests

## Technical Implementation

### Frontend Architecture

```typescript
interface Avatar {
  id: string;
  code: string;
  name: string;
  gender: string;
  thumbnail?: string;
  canvas?: string;
  variants?: AvatarVariant[];
}

interface AvatarVariant {
  code: string;
  id: string;
  name: string;
  thumbnail?: string;
  canvas?: string;
}
```

### Backend Processing

1. **Avatar Code Parsing**: Split variant codes and find matching avatars
2. **Canvas URL Selection**: Use variant canvas if available, fallback to main avatar
3. **API Request Construction**: Build Elai API request with selected avatar data
4. **Error Handling**: Graceful fallbacks for missing avatars or variants

### Error Handling

**Frontend**:
- Network errors during avatar fetching
- Invalid avatar selection
- Missing avatar data

**Backend**:
- Avatar not found
- Invalid avatar code format
- Missing canvas URLs
- API communication errors

## Testing

### Test Script

**File**: `onyx-cutom/test_avatar_selection.py`

**Test Coverage**:
1. Avatar fetching from API
2. Avatar code parsing (base and variant)
3. Data structure validation
4. Error handling scenarios

### Manual Testing

1. **Avatar Loading**: Verify avatars load correctly on page refresh
2. **Avatar Selection**: Test selecting different avatars and variants
3. **Video Generation**: Verify selected avatar is used in video
4. **Error Scenarios**: Test network failures and invalid selections

## Configuration

### Environment Variables

No new environment variables required. Uses existing:
- `NEXT_PUBLIC_CUSTOM_BACKEND_URL`: Backend API URL
- Elai API credentials (already configured)

### Backend Configuration

The backend automatically handles:
- Avatar fetching from Elai API
- Code parsing and validation
- Canvas URL selection
- Error fallbacks

## Migration Guide

### For Existing Users

- **No Breaking Changes**: Existing functionality remains unchanged
- **Optional Feature**: Avatar selection is optional, defaults to auto-selection
- **Backward Compatibility**: All existing avatar codes continue to work

### For Developers

1. **Frontend Integration**: Import and use `AvatarSelector` component
2. **Backend Integration**: Avatar codes are automatically processed
3. **Testing**: Use provided test script for validation

## Future Enhancements

### Potential Improvements

1. **Avatar Preview**: Show avatar preview in video generation
2. **Avatar Categories**: Group avatars by gender, style, etc.
3. **Favorite Avatars**: Allow users to save preferred avatars
4. **Custom Avatars**: Support for user-uploaded avatars
5. **Avatar Voice Matching**: Match avatar appearance with voice characteristics

### Performance Optimizations

1. **Avatar Caching**: Cache avatar data to reduce API calls
2. **Lazy Loading**: Load avatar thumbnails on demand
3. **Image Optimization**: Compress and optimize avatar images
4. **CDN Integration**: Serve avatar images from CDN

## Troubleshooting

### Common Issues

1. **Avatars Not Loading**
   - Check network connectivity
   - Verify Elai API credentials
   - Check browser console for errors

2. **Avatar Selection Not Working**
   - Verify avatar code format
   - Check backend logs for parsing errors
   - Ensure avatar exists in Elai API

3. **Video Generation Fails**
   - Verify selected avatar has valid canvas URL
   - Check backend logs for API errors
   - Ensure avatar code is correctly passed

### Debug Information

**Frontend Logging**:
- Avatar fetching status
- Selection events
- Error messages

**Backend Logging**:
- Avatar code parsing
- Canvas URL selection
- API request details

## Conclusion

The avatar selection feature provides users with greater control over their video presentations while maintaining the existing functionality. The implementation is robust, user-friendly, and extensible for future enhancements.
