# Lesson Presentation Edit Implementation

## Overview

This implementation adds section-specific regeneration functionality to lesson presentations, similar to the existing quiz and text presentation edit capabilities. When a user edits a section title in the preview, the system automatically regenerates the content for that specific section to match the updated title.

## Key Features

1. **Section-Specific Regeneration**: When a user edits a slide title, only that section's content is regenerated
2. **Change Detection**: The system tracks whether user edits were made and optimizes processing accordingly
3. **Streaming Response**: Edit operations use streaming responses for real-time feedback
4. **Context Preservation**: All original context (files, text, outline) is preserved during regeneration

## Backend Changes

### 1. Data Models

#### LessonWizardFinalize (Updated)
```python
class LessonWizardFinalize(BaseModel):
    # ... existing fields ...
    # NEW: fields for tracking user edits
    hasUserEdits: Optional[bool] = False
    originalContent: Optional[str] = None  # Original content before user edits
    isCleanContent: Optional[bool] = False  # Whether content is clean titles only
```

#### LessonPresentationEditRequest (New)
```python
class LessonPresentationEditRequest(BaseModel):
    currentContent: str
    editPrompt: str
    outlineProjectId: Optional[int] = None
    lessonTitle: Optional[str] = None
    language: str = "en"
    fromFiles: bool = False
    fromText: bool = False
    folderIds: Optional[str] = None
    fileIds: Optional[str] = None
    textMode: Optional[str] = None
    userText: Optional[str] = None
    slidesCount: Optional[int] = 5
    theme: Optional[str] = None
    chatSessionId: Optional[str] = None
    isCleanContent: Optional[bool] = False
```

### 2. New Endpoints

#### `/api/custom/lesson-presentation/edit`
- **Purpose**: Handle section-specific content regeneration
- **Method**: POST
- **Response**: Streaming response with regenerated content
- **Features**:
  - Uses OpenAI directly for content generation
  - Preserves all original context (files, text, outline)
  - Caches content for later finalization
  - Supports keep-alive for long operations

### 3. Updated Endpoints

#### `/api/custom/lesson-presentation/finalize`
- **Changes**: Added change detection logic
- **New Logic**:
  - Checks if user made edits using `hasUserEdits` and `originalContent`
  - Uses `_any_lesson_presentation_changes_made()` for change detection
  - Optimizes processing based on whether changes were detected
  - Uses direct parser path when no changes detected (faster)
  - Uses AI parser path when changes detected

### 4. Utility Functions

#### `_any_lesson_presentation_changes_made()`
```python
def _any_lesson_presentation_changes_made(original_content: str, edited_content: str) -> bool:
    """Compare original and edited lesson presentation content to detect changes"""
    # Normalizes content and performs text comparison
    # Returns True if changes detected, False if identical
```

### 5. Caching

#### LESSON_PRESENTATION_PREVIEW_CACHE
```python
LESSON_PRESENTATION_PREVIEW_CACHE: Dict[str, str] = {}  # chat_session_id -> raw lesson presentation content
```

## Frontend Changes

### 1. State Management

#### New State Variables
```typescript
const [originalContent, setOriginalContent] = useState<string>(""); // Track original content
const [hasUserEdits, setHasUserEdits] = useState<boolean>(false); // Track if user made edits
```

### 2. Content Tracking

#### Original Content Capture
```typescript
// Track original content when first receiving data
if (!originalContent) {
  setOriginalContent(accumulatedText);
}
```

### 3. Section-Specific Regeneration

#### handleSectionTitleEdit Function
```typescript
const handleSectionTitleEdit = async (slideIdx: number, newTitle: string, oldTitle: string) => {
  if (newTitle === oldTitle) return; // No change
  
  // Mark that user has made edits
  setHasUserEdits(true);
  
  // Update content with new title
  const updatedContent = content.replace(slidePattern, newTitle);
  setContent(updatedContent);
  
  // Call edit endpoint to regenerate content for this section
  const editRequestBody = {
    currentContent: content,
    editPrompt: `Update the content for slide ${slideIdx + 1} titled "${newTitle}"...`,
    // ... other context
  };
  
  // Stream response and update content
  // ... streaming logic
};
```

### 4. Title Input Integration

#### Updated Title Input
```typescript
<input
  type="text"
  value={title}
  onChange={(e) => {
    const newTitle = e.target.value;
    // Call the section-specific regeneration function
    handleSectionTitleEdit(slideIdx, newTitle, title);
  }}
  // ... other props
/>
```

### 5. Finalize Request Enhancement

#### Updated Finalize Request
```typescript
const res = await fetch(`${CUSTOM_BACKEND_URL}/lesson-presentation/finalize`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    // ... existing fields ...
    // NEW: Include edit tracking information
    hasUserEdits: hasUserEdits,
    originalContent: originalContent,
    isCleanContent: false,
  }),
  signal: abortController.signal
});
```

## Workflow

### 1. Initial Generation
1. User creates lesson presentation
2. System generates preview content
3. Original content is captured and stored

### 2. User Edit
1. User edits a section title in the preview
2. `handleSectionTitleEdit` is triggered
3. System marks that user has made edits
4. Content is updated with new title
5. Edit endpoint is called with section-specific prompt

### 3. Section Regeneration
1. Backend receives edit request
2. AI regenerates content for the specific section
3. Streaming response updates frontend content
4. Regenerated content is cached

### 4. Finalization
1. User clicks "Generate" to finalize
2. Frontend sends finalize request with edit tracking info
3. Backend detects changes and chooses parsing strategy
4. Project is created with final content

## Benefits

1. **Improved User Experience**: Users can edit titles and see content update automatically
2. **Performance Optimization**: Change detection prevents unnecessary processing
3. **Context Preservation**: All original context is maintained during regeneration
4. **Consistency**: Follows the same pattern as quiz and text presentation editing
5. **Real-time Feedback**: Streaming responses provide immediate feedback

## Testing

A test script `test_lesson_presentation_edit.py` is provided to verify:
- Edit endpoint functionality
- Finalize endpoint with edit tracking
- Streaming response handling
- Change detection logic

## Future Enhancements

1. **Debounced Editing**: Add debouncing to prevent excessive API calls during rapid typing
2. **Undo/Redo**: Add undo/redo functionality for title edits
3. **Batch Editing**: Allow editing multiple titles at once
4. **Content Validation**: Add validation to ensure regenerated content matches the new title
5. **Progress Indicators**: Add visual indicators during section regeneration
