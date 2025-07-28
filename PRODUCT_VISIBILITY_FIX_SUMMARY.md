# Product Visibility Fix Summary

## Problem Description

The product creation flow had inconsistent naming patterns and visibility issues where:

1. **Products created from course outlines** were not being properly linked to their outlines
2. **Products with `is_standalone = True`** were disappearing from the products page due to overly aggressive filtering
3. **Text presentations and lesson presentations** were missing the `is_standalone` flag entirely
4. **Inconsistent naming patterns** made it difficult to determine which products belonged to which outlines

## Root Causes

### 1. Missing `is_standalone` Flag in Text Presentations
- Text presentation finalization was not setting the `is_standalone` flag
- This caused text presentations to default to `NULL`, making them invisible due to filtering logic

### 2. Inconsistent Naming Patterns
- Products created from outlines used different naming conventions:
  - `"Content Type - Outline Name: Lesson Title"` (e.g., "Quiz - Course Name: Lesson Title")
  - `"Outline Name: Lesson Title"` (e.g., "Course Name: Lesson Title")
  - Direct matches with outline names
- Products created standalone used different patterns

### 3. Overly Aggressive Frontend Filtering
- The filtering logic was too complex and had hardcoded overrides
- Text presentations were being hidden incorrectly
- Legacy products without explicit `is_standalone` flags were being filtered inconsistently

## Solutions Implemented

### 1. Backend Fixes

#### A. Text Presentation Finalization (`custom_extensions/backend/main.py`)
- **Added `outlineId` field** to `TextPresentationWizardFinalize` model
- **Added `is_standalone` flag** to text presentation database insertion
- **Logic**: `is_standalone = (outlineId is None)`

```python
# Determine if this is a standalone text presentation or part of an outline
is_standalone_text_presentation = payload.outlineId is None

insert_query = """
INSERT INTO projects (
    onyx_user_id, project_name, product_type, microproduct_type,
    microproduct_name, microproduct_content, design_template_id, 
    source_chat_session_id, is_standalone, created_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
"""
```

#### B. Lesson Presentation Finalization (`custom_extensions/backend/main.py`)
- **Added `is_standalone` flag** to lesson presentation database insertion
- **Logic**: `is_standalone = (outlineProjectId is None)`
- **Replaced `add_project_to_custom_db`** with direct database insertion to avoid double parsing

```python
# Determine if this is a standalone lesson presentation or part of an outline
is_standalone_lesson = payload.outlineProjectId is None

insert_query = """
INSERT INTO projects (
    onyx_user_id, project_name, product_type, microproduct_type,
    microproduct_name, microproduct_content, design_template_id, 
    source_chat_session_id, is_standalone, created_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
"""
```

#### C. Quiz Finalization (Already Fixed)
- Quiz finalization already had proper `is_standalone` logic
- Uses `is_standalone_quiz = payload.outlineId is None`

### 2. Frontend Fixes

#### A. Text Presentation Client (`custom_extensions/frontend/src/app/create/text-presentation/TextPresentationClient.tsx`)
- **Added `outlineId` to finalization request** when creating from course outlines
- Ensures proper linking between text presentations and their parent outlines

```typescript
body: JSON.stringify({
  aiResponse: content,
  lesson: selectedLesson,
  courseName: params?.get("courseName"),
  language: language,
  outlineId: selectedOutlineId,  // NEW: Added this field
}),
```

#### B. Lesson Presentation Client (Already Fixed)
- Lesson presentation client already passes `outlineProjectId` when creating from course outlines
- Ensures proper linking between lesson presentations and their parent outlines

#### B. Projects Table Filtering (`custom_extensions/frontend/src/components/ProjectsTable.tsx`)
- **Simplified and improved filtering logic**
- **Prioritizes explicit `is_standalone` flags** over legacy pattern matching
- **Shows text presentations by default** when no explicit flag is set
- **More conservative approach** for quizzes and PDF lessons

```typescript
// Check if product has explicit is_standalone field
const hasStandaloneFlag = (proj as any).is_standalone !== undefined && (proj as any).is_standalone !== null;

if (hasStandaloneFlag) {
    // For products with explicit standalone flag: show only if standalone=true
    if ((proj as any).is_standalone === false) {
        belongsToOutline = true;
    }
} else {
    // Legacy filtering for products without explicit standalone flag
    // Only apply to quizzes and PDF lessons - show text presentations by default
    if (isQuiz || isPdfLesson) {
        // Apply legacy pattern matching
    }
    // For text presentations and video lessons without explicit standalone flag, show them by default
    else if (isTextPresentation || isVideoLesson) {
        console.log(`🔍 [FILTER] ${contentType} "${projectTitle}" shown by default (no explicit standalone flag)`);
    }
}
```

### 3. Database Migration Script (`fix_product_visibility.py`)

Created a comprehensive script to fix existing products:

#### Features:
- **Analyzes all existing products** and their relationships to training plans
- **Uses multiple detection methods**:
  1. Naming pattern analysis
  2. Chat session matching
  3. Direct name matching
  4. Content type-specific rules
- **Updates `is_standalone` flags** for products without explicit values
- **Preserves existing explicit flags** (doesn't overwrite them)
- **Batch processing** for performance

#### Detection Logic:
1. **Pattern 1**: `"Content Type - Outline Name: Lesson Title"`
2. **Pattern 2**: `"Outline Name: Lesson Title"`
3. **Pattern 3**: Direct name matching with training plans
4. **Pattern 4**: Chat session relationship matching
5. **Content type defaults**: 
   - Text presentations, lesson presentations, video lessons → standalone
   - Quizzes, PDF lessons → outline-based

## Usage Instructions

### 1. Run the Migration Script
```bash
# Set database environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=your_password
export DB_NAME=onyx_custom

# Run the fix script
python fix_product_visibility.py
```

### 2. Verify the Fixes
- Check that text presentations created from course outlines are properly linked
- Verify that standalone products appear on the products page
- Confirm that outline-based products are accessible through course outlines

## Expected Results

### Before Fix:
- ❌ Text presentations and lesson presentations created from outlines disappeared from products page
- ❌ Inconsistent naming patterns caused linking failures
- ❌ Products with `is_standalone = True` were incorrectly filtered out
- ❌ Legacy products had unpredictable visibility

### After Fix:
- ✅ Text presentations and lesson presentations properly linked to outlines with `is_standalone = False`
- ✅ Standalone text presentations and lesson presentations appear on products page with `is_standalone = True`
- ✅ Consistent naming patterns and relationship detection
- ✅ Clear visibility rules based on explicit `is_standalone` flags
- ✅ Legacy products handled gracefully with sensible defaults

## Testing Recommendations

1. **Create a text presentation from a course outline** - verify it appears in the outline
2. **Create a standalone text presentation** - verify it appears on the products page
3. **Create a lesson presentation from a course outline** - verify it appears in the outline
4. **Create a standalone lesson presentation** - verify it appears on the products page
5. **Create a quiz from a course outline** - verify it appears in the outline
6. **Create a standalone quiz** - verify it appears on the products page
7. **Run the migration script** - verify existing products are properly categorized
8. **Check console logs** - verify filtering logic is working correctly
9. **Test edge cases** - products with unusual naming patterns

## Files Modified

1. `custom_extensions/backend/main.py` - Added `outlineId` field and `is_standalone` logic for text presentations and lesson presentations
2. `custom_extensions/frontend/src/app/create/text-presentation/TextPresentationClient.tsx` - Added `outlineId` to requests
3. `custom_extensions/frontend/src/components/ProjectsTable.tsx` - Improved filtering logic
4. `fix_product_visibility.py` - Migration script for existing products (updated for all product types)
5. `PRODUCT_VISIBILITY_FIX_SUMMARY.md` - This documentation

## Future Improvements

1. **Standardize naming patterns** across all product types
2. **Add explicit relationship tracking** in the database schema
3. **Implement product grouping** in the UI for better organization
4. **Add migration validation** to ensure data integrity
5. **Create admin tools** for manual relationship management 