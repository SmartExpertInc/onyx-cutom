# Avatar Selection Implementation

## Overview

This document describes the implementation of dynamic avatar selection functionality for the video generation application. The feature allows users to select from a list of available AI avatars instead of using a hardcoded avatar, with full state management and persistence.

## Features Implemented

### 1. Global Avatar State Management

**File**: `onyx-cutom/custom_extensions/frontend/src/components/AvatarDisplayManager.tsx`

**Features**:
- **Context Provider**: Provides global avatar state to all components
- **Persistence**: Saves selected avatar to localStorage for persistence across page reloads
- **State Updates**: Provides methods to update the selected avatar globally
- **Error Handling**: Comprehensive error handling and fallback mechanisms
- **Loading States**: Proper loading states during avatar fetching

**Key Methods**:
- `updateSelectedAvatar(avatar, variant)`: Updates the global avatar state
- `clearSelectedAvatar()`: Clears the selected avatar
- `refreshAvatars()`: Refreshes the avatar list from the API
- `loadSavedAvatar()`: Loads saved avatar from localStorage
- `saveAvatarToStorage(avatar)`: Saves avatar to localStorage

### 2. Enhanced Avatar Selector Component

**File**: `onyx-cutom/custom_extensions/frontend/src/components/AvatarSelector.tsx`

**Features**:
- **Global Integration**: Integrates with the global avatar context
- **Dual State Update**: Updates both local state (for video generation) and global state (for slide previews)
- **Type Safety**: Uses consistent TypeScript types from `elaiTypes.ts`
- **Error Handling**: Comprehensive error handling with retry functionality
- **Loading States**: Proper loading and error states

**Key Enhancements**:
- Calls `updateSelectedAvatar()` when an avatar is selected
- Updates slide previews immediately when selection changes
- Maintains backward compatibility with existing video generation components

### 3. Avatar Image Display Component

**File**: `onyx-cutom/custom_extensions/frontend/src/components/AvatarImageDisplay.tsx`

**Features**:
- **Global State Integration**: Automatically updates when global avatar state changes
- **Responsive Design**: Multiple size and position options
- **Fallback Handling**: Graceful fallback when images fail to load
- **Loading States**: Proper loading and error states

### 4. Enhanced Video Generation Buttons

**Files**:
- `onyx-cutom/custom_extensions/frontend/src/components/VideoDownloadButton.tsx`
- `onyx-cutom/custom_extensions/frontend/src/components/ProfessionalVideoPresentationButton.tsx`

**Enhancements**:
- **Avatar Selection**: Integrated avatar selection before video generation
- **State Management**: Proper state management for selected avatar and variant
- **Validation**: Ensures avatar is selected before allowing video generation
- **Logging**: Comprehensive logging for debugging

### 5. Backend Avatar Processing

**File**: `onyx-cutom/custom_extensions/backend/app/services/video_generation_service.py`

**Enhancements**:
- **Variant Support**: Enhanced avatar code parsing to support variants (e.g., "gia.casual")
- **Dynamic Canvas URL**: Uses variant canvas URL if available
- **Error Handling**: Improved error handling and logging
- **Validation**: Comprehensive avatar validation before video generation

## API Endpoints

### GET `/api/custom/video/avatars`

**Purpose**: Fetch available avatars from Elai API

**Response Format**:
```json
{
  "success": true,
  "avatars": [
    {
      "id": "avatar_id",
      "code": "gia",
      "name": "Gia",
      "gender": "female",
      "thumbnail": "https://...",
      "canvas": "https://...",
      "variants": [
        {
          "code": "casual",
          "id": "variant_id",
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

**Purpose**: Create video presentations with selected avatar

**Request Format**:
```json
{
  "projectName": "Video Presentation",
  "voiceoverTexts": ["Text 1", "Text 2", "Text 3"],
  "avatarCode": "gia.casual",
  "useAvatarMask": true,
  "layout": "picture_in_picture",
  "theme": "dark-purple",
  "duration": 30.0,
  "quality": "high",
  "resolution": [1920, 1080]
}
```

## State Management Flow

### 1. Initialization
```
App Load → AvatarDisplayManager → Fetch Avatars → Load Saved Avatar → Set Global State
```

### 2. Avatar Selection
```
User Selects Avatar → AvatarSelector → updateSelectedAvatar() → Global State Update → Slide Preview Update
```

### 3. Persistence
```
Avatar Selection → saveAvatarToStorage() → localStorage → Page Reload → loadSavedAvatar() → Restore State
```

### 4. Video Generation
```
User Clicks Generate → Validate Avatar Selection → Send Request with avatarCode → Backend Processing
```

## Local Storage Structure

**Key**: `selected_avatar_data`

**Value**:
```json
{
  "avatar": {
    "id": "avatar_id",
    "code": "gia",
    "name": "Gia",
    "gender": "female",
    "variants": [...]
  },
  "selectedVariant": {
    "code": "casual",
    "id": "variant_id",
    "name": "Casual",
    "thumbnail": "https://...",
    "canvas": "https://..."
  }
}
```

## Component Integration

### Root Layout Integration

**File**: `onyx-cutom/custom_extensions/frontend/src/app/layout.tsx`

The `AvatarDisplayManager` is wrapped at the root level to ensure global availability:

```tsx
<LanguageProvider>
  <AvatarDisplayManager>
    {children}
  </AvatarDisplayManager>
</LanguageProvider>
```

### Component Usage

**Avatar Selector**:
```tsx
<AvatarSelector
  onAvatarSelect={handleAvatarSelect}
  selectedAvatar={selectedAvatar}
  selectedVariant={selectedVariant}
  className="w-full"
/>
```

**Avatar Display**:
```tsx
<AvatarImageDisplay
  size="MEDIUM"
  position="CENTER"
  className="avatar-preview"
/>
```

**Global State Access**:
```tsx
const { defaultAvatar, updateSelectedAvatar, clearSelectedAvatar } = useAvatarDisplay();
```

## Error Handling

### Frontend Error Handling
- **API Failures**: Graceful fallback with retry options
- **Image Loading**: Fallback placeholders for failed images
- **Type Errors**: Comprehensive TypeScript type checking
- **State Errors**: Validation and fallback mechanisms

### Backend Error Handling
- **Avatar Not Found**: Detailed error messages with available options
- **API Failures**: Comprehensive logging and error responses
- **Validation**: Input validation with clear error messages
- **Fallback**: Automatic fallback to available avatars

## Testing

### Test Script
**File**: `onyx-cutom/test_avatar_selection.py`

**Tests**:
1. **Avatar Fetching**: Tests API connectivity and response structure
2. **Avatar Variants**: Tests variant functionality and structure
3. **Avatar Code Parsing**: Tests avatar code parsing (including variants)
4. **Persistence Simulation**: Tests localStorage persistence functionality

### Manual Testing
1. **Avatar Selection**: Select different avatars and variants
2. **Persistence**: Reload page and verify avatar selection is maintained
3. **Slide Preview**: Verify slide previews update immediately
4. **Video Generation**: Test video generation with selected avatar

## Performance Considerations

### Optimization
- **Caching**: Avatar data is cached in global state
- **Lazy Loading**: Images are loaded on demand
- **Error Boundaries**: Graceful error handling prevents crashes
- **Memory Management**: Proper cleanup of event listeners and timeouts

### Monitoring
- **Console Logging**: Comprehensive logging for debugging
- **Error Tracking**: Error states are properly handled and logged
- **Performance Metrics**: Loading states provide user feedback

## Future Enhancements

### Planned Features
1. **Avatar Favorites**: Allow users to mark favorite avatars
2. **Recent Avatars**: Show recently used avatars
3. **Avatar Categories**: Organize avatars by category (business, casual, etc.)
4. **Custom Avatars**: Support for user-uploaded avatars
5. **Avatar Preview**: Live preview of avatar in slide context

### Technical Improvements
1. **Offline Support**: Cache avatar data for offline use
2. **Progressive Loading**: Load avatar thumbnails progressively
3. **Search Functionality**: Search avatars by name or characteristics
4. **Bulk Operations**: Select multiple avatars for different slides

## Troubleshooting

### Common Issues

1. **Avatar Not Loading**
   - Check API connectivity
   - Verify avatar data structure
   - Check console for error messages

2. **Selection Not Persisting**
   - Check localStorage availability
   - Verify data serialization
   - Check for storage quota issues

3. **Slide Preview Not Updating**
   - Verify AvatarDisplayManager is properly wrapped
   - Check useAvatarDisplay hook usage
   - Verify state update flow

4. **Video Generation Fails**
   - Verify avatar code format
   - Check backend logs for errors
   - Validate avatar selection before generation

### Debug Commands

```bash
# Test avatar selection system
python onyx-cutom/test_avatar_selection.py

# Check localStorage (browser console)
localStorage.getItem('selected_avatar_data')

# Clear avatar selection
localStorage.removeItem('selected_avatar_data')
```

## Conclusion

The avatar selection system provides a comprehensive solution for dynamic avatar management with full state persistence and global integration. The implementation ensures a smooth user experience while maintaining code quality and performance.
