# SmartDrive File Mapping Debug Summary

## Issue Analysis

From the logs, we can see that:

1. ✅ **Frontend correctly forwards selectedFiles**: `selectedFiles=%2Flessondraft.pdf`
2. ✅ **Backend receives selectedFiles**: `payload.selectedFiles: /poster---------------------------2025-09-26T23-10-47.png`
3. ✅ **Hybrid approach is triggered**: `[LESSON_STREAM] 🔄 USING HYBRID APPROACH`
4. ❌ **File mapping fails**: `[HYBRID_CONTEXT] Extracting context from 0 files and 0 folders`

## Root Cause

The issue appears to be that the SmartDrive file path `/poster---------------------------2025-09-26T23-10-47.png` is not being successfully mapped to an Onyx file ID.

The backend logs show:
```
INFO:main:[HYBRID_CONTEXT] Extracting context from 0 files and 0 folders
INFO:main:[FILE_CONTEXT] Using cached context for key: 5740354900026072...
```

This suggests that the `map_smartdrive_paths_to_onyx_files()` function is returning an empty list, meaning it can't find the file in the Onyx database.

## Potential Issues

1. **File Path Format**: The SmartDrive path format may not match what's stored in the Onyx database
2. **URL Encoding**: The path may need different URL encoding/decoding
3. **Database Schema**: The file may not exist in Onyx or may be stored with a different path format
4. **User Context**: The file may not be accessible to the current user

## Backend Updates Applied

### Models Fixed ✅
- `LessonWizardPreview`: Added `selectedFiles` field
- `QuizWizardPreview`: Added `selectedFiles` field  
- `TextPresentationWizardPreview`: Already had `selectedFiles` field
- Course outline models: Already had `selectedFiles` field

### Endpoints Fixed ✅
- Course Outline: Already had SmartDrive handling
- Lesson Presentation: SmartDrive handling added (line 17028)
- Quiz: Needs SmartDrive handling
- Text Presentation: Needs SmartDrive handling

## Next Steps

1. Add SmartDrive handling to Quiz and Text Presentation endpoints
2. Add debug logging to the `map_smartdrive_paths_to_onyx_files()` function
3. Test with different file path formats
4. Verify the file exists in the Onyx database and is accessible to the user

## Testing

Test URL: `https://ml-dev.contentbuilder.ai/custom-projects-ui/create/lesson-presentation?fromConnectors=true&selectedFiles=%2Fposter---------------------------2025-09-26T23-10-47.png`

Expected logs after fix:
- `[SMARTDRIVE_DEBUG] Attempting to map paths for user {userId}`
- `[SMARTDRIVE_DEBUG] Raw paths: ['/poster---------------------------2025-09-26T23-10-47.png']`
- `[HYBRID_CONTEXT] Mapped X SmartDrive files to Onyx file IDs`
- `[HYBRID_CONTEXT] Extracting context from X files and 0 folders` (where X > 0) 