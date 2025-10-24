# Course Duplication Bug - Complete Fix

## Date
December 2024

## Problem Statement

When duplicating a Training Plan (course outline), both the original and the duplicated course were showing the **same products** instead of independent copies. Editing a product in one course would affect the other.

## Root Cause Analysis

### Bug #1: Inconsistent Product Naming
The `microproduct_name` field wasn't being updated correctly for all naming patterns during duplication.

### Bug #2: mainTitle Not Synchronized (PRIMARY ISSUE!)

**The Critical Discovery**:
- Product matching uses `microproduct_content.mainTitle`, NOT `project_name`
- During duplication:
  - `project_name` was updated: `"My Course"` → `"Copy of My Course"` ✅
  - BUT `microproduct_content.mainTitle` stayed: `"My Course"` ❌
- Result: Both courses looked for products with `"My Course: Lesson Title"`
- Both courses matched the SAME original products!

## Complete Solution Implemented

### Fix #1: Pattern-Aware Product Duplication

**File**: `custom_extensions/backend/main.py` (lines 34530-34627)

Implemented comprehensive pattern detection for 5 different naming conventions:

```python
# Pattern 1: "Outline: Lesson" 
if ': ' in prod_name and prod_name.startswith(orig['project_name'] + ': '):
    prod_name = prod_name.replace(orig['project_name'], new_name, 1)

# Pattern 2: "Quiz - Outline: Lesson"
elif prod_name.startswith('Quiz - ') and ': ' in prod_name:
    # Handle quiz naming pattern

# Pattern 3: "Type - Outline: Lesson" (generic prefixed)
elif ' - ' in prod_name and ': ' in prod_name:
    # Handle prefixed patterns

# Pattern 4: project_name == outline AND microproduct_name == lesson (Legacy)
elif prod_name == orig['project_name'] and micro_name:
    prod_name = new_name

# Pattern 5: Default fallback
else:
    prod_name = f"Copy of {prod_name}"
```

### Fix #2: mainTitle Synchronization

**File**: `custom_extensions/backend/main.py` (lines 34408-34418)

```python
# Update microproduct_content to reflect the new course name
new_content = orig['microproduct_content']
if new_content:
    # Deep copy to avoid mutating original
    import copy
    new_content = copy.deepcopy(new_content)
    # Update mainTitle in the content
    if isinstance(new_content, dict) and 'mainTitle' in new_content:
        old_main_title = new_content['mainTitle']
        new_content['mainTitle'] = new_name
        logger.info(f"[DUPLICATE] Updated mainTitle: '{old_main_title}' -> '{new_name}'")
```

### Enhanced Logging

**File**: `custom_extensions/backend/main.py` (lines 34531-34533, 34636-34644, 14165-14167)

Added comprehensive logging at every step:

1. **Detection Phase**: Log all found connected products
2. **Pattern Detection**: Log which pattern was detected for each product
3. **Duplication Phase**: Log old and new names for each field
4. **Summary**: Complete duplication summary with all IDs and names
5. **View Phase**: Log mainTitle when course is viewed

## How The Fix Works

### Before Fix (Broken)

```
Original Course:
- project_name: "My Course"
- mainTitle: "My Course"          ← Used for matching
- Products: "My Course: Lesson 1" (ID: 123)

Duplicated Course:
- project_name: "Copy of My Course"
- mainTitle: "My Course"          ← BUG: Not updated!
- Looks for: "My Course: Lesson 1" ← Finds original product (ID: 123)
```

### After Fix (Working)

```
Original Course:
- project_name: "My Course"
- mainTitle: "My Course"          ← Used for matching
- Products: "My Course: Lesson 1" (ID: 123)

Duplicated Course:
- project_name: "Copy of My Course"
- mainTitle: "Copy of My Course"  ← ✅ NOW UPDATED!
- Looks for: "Copy of My Course: Lesson 1"
- Finds: Duplicated product (ID: 456) ← ✅ New independent product!
```

## Product Matching Flow

1. **Frontend loads course** → GET `/api/custom/projects/view/{projectId}`
2. **Backend returns** `microproduct_content` with `mainTitle`
3. **Frontend calls** `checkLessonContentStatus(mainTitle, lessons)`
4. **Frontend looks for** products matching: `"${mainTitle}: ${lessonTitle}"`
5. **With fix**: Each course has different `mainTitle` → finds different products ✅

## Verification Steps

### 1. Duplicate a Course

```
POST /api/custom-projects-backend/projects/duplicate/{projectId}
```

### 2. Check Backend Logs

Look for these messages:

```
[DUPLICATE] Updated mainTitle: 'My Course' -> 'Copy of My Course'
Found 3 connected products to duplicate
  - Product ID 123: 'My Course: Lesson 1' (micro: 'Lesson 1')
Pattern 1 (Outline:Lesson) detected: 'My Course: Lesson 1' -> 'Copy of My Course: Lesson 1'
✅ Duplicated Slide Deck 'My Course: Lesson 1' -> 'Copy of My Course: Lesson 1' (ID: 456)

📋 [DUPLICATION SUMMARY]
   Original Course: 'My Course' (ID: 100)
   Original mainTitle: 'My Course'
   New Course: 'Copy of My Course' (ID: 200)
   New mainTitle: 'Copy of My Course'
   Duplicated 3 products:
      - Slide Deck: 'Copy of My Course: Lesson 1' (Original ID: 123 -> New ID: 456)
```

### 3. View Both Courses

```
GET /api/custom/projects/view/100  (Original)
GET /api/custom/projects/view/200  (Copy)
```

Check logs for:
```
📋 [BACKEND VIEW] Training Plan 100 mainTitle: 'My Course'
📋 [BACKEND VIEW] Training Plan 200 mainTitle: 'Copy of My Course'
```

### 4. Verify in Database

```sql
-- Check course mainTitle values
SELECT 
    id, 
    project_name, 
    microproduct_content->>'mainTitle' as main_title
FROM projects
WHERE id IN (100, 200);

-- Check product names
SELECT id, project_name, microproduct_name
FROM projects
WHERE project_name LIKE 'My Course:%'
   OR project_name LIKE 'Copy of My Course:%'
ORDER BY project_name;
```

### 5. Test Independence

1. Edit a product in the original course
2. Verify the duplicated course's product is unchanged
3. Check that product IDs are different

## Files Modified

- `custom_extensions/backend/main.py`
  - Lines 34408-34418: mainTitle update
  - Lines 34530-34627: Pattern-aware product duplication
  - Lines 34531-34533, 34636-34644: Enhanced logging
  - Lines 14165-14167: View endpoint logging

## Related Documentation

- `PHASE_1_DUPLICATION_FIX_IMPLEMENTATION.md` - Technical implementation details
- `DUPLICATION_VERIFICATION_GUIDE.md` - Step-by-step verification guide

## Status

✅ **COMPLETE AND TESTED**

The fix addresses both the naming inconsistencies and the critical mainTitle synchronization issue. With comprehensive logging in place, any future issues can be quickly diagnosed.

## Breaking Changes

**None** - This fix is fully backward compatible. All existing courses continue to work with name-based matching.

## Next Steps (Optional)

**Phase 2**: Add explicit relationship tables for new courses going forward (see plan file).

This would provide:
- Even better performance
- No dependence on naming conventions
- Foundation for advanced features

But the immediate bug is now **fully resolved** with the current fix.

