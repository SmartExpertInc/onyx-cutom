# Course Duplication Fix - Verification Guide

## Problem Fixed

Both original and duplicated courses were sharing the same products due to two critical bugs:

1. **Product names** weren't being updated correctly for all naming patterns
2. **Course `mainTitle`** in `microproduct_content` wasn't being updated (THE MAIN ISSUE!)

## What Was Fixed

### Fix #1: Pattern-Aware Product Duplication
- Products are now duplicated with correct names for 5 different patterns
- Comprehensive logging added for debugging

### Fix #2: mainTitle Synchronization
- The `microproduct_content.mainTitle` field is now updated to match the new course name
- This ensures product matching works correctly for both courses

## How to Verify the Fix

### Step 1: Check Backend Logs During Duplication

When you duplicate a course, look for these log messages:

```
[DUPLICATE] Updated mainTitle: 'My Course' -> 'Copy of My Course'
Found X connected products to duplicate
  - Product ID 123: 'My Course: Lesson 1' (micro: 'Lesson 1')
  - Product ID 124: 'My Course: Lesson 2' (micro: 'Lesson 2')
[DUPLICATE] Processing product 123: project_name='My Course: Lesson 1', microproduct_name='Lesson 1'
Pattern 1 (Outline:Lesson) detected: 'My Course: Lesson 1' -> 'Copy of My Course: Lesson 1'
✅ Duplicated Slide Deck 'My Course: Lesson 1' -> 'Copy of My Course: Lesson 1' (ID: 456)
   Original microproduct_name: 'Lesson 1' -> New: 'Lesson 1'
```

### Step 2: Verify in Database

Query the database to check:

```sql
-- Check the original course
SELECT id, project_name, microproduct_content->>'mainTitle' as main_title
FROM projects
WHERE id = <original_course_id>;

-- Check the duplicated course
SELECT id, project_name, microproduct_content->>'mainTitle' as main_title
FROM projects
WHERE id = <new_course_id>;

-- Check original products
SELECT id, project_name, microproduct_name
FROM projects
WHERE project_name LIKE 'My Course:%';

-- Check duplicated products
SELECT id, project_name, microproduct_name
FROM projects
WHERE project_name LIKE 'Copy of My Course:%';
```

### Step 3: View Both Courses in UI

1. **Open the original course** (`/projects/view-new-2/[original_id]`)
   - Should show products named like: `"My Course: Lesson Title"`
   - Check browser console for: `mainTitle: "My Course"`

2. **Open the duplicated course** (`/projects/view-new-2/[new_id]`)
   - Should show products named like: `"Copy of My Course: Lesson Title"`
   - Check browser console for: `mainTitle: "Copy of My Course"`

### Step 4: Test Independence

1. **Edit a product in the original course**
   - Change some content
   - Save changes

2. **View the duplicated course**
   - The product should be **unchanged**
   - It should be a completely separate product

3. **Check Product IDs**
   - Original course products: IDs 123, 124, 125...
   - Duplicated course products: IDs 456, 457, 458... (different IDs!)

## Expected Behavior

### ✅ CORRECT Behavior (After Fix)

**Original Course**:
- Course Name: `"My Course"`
- Main Title: `"My Course"`
- Products: 
  - `"My Course: Lesson 1"` (ID: 123)
  - `"My Course: Lesson 2"` (ID: 124)

**Duplicated Course**:
- Course Name: `"Copy of My Course"`
- Main Title: `"Copy of My Course"` ← **NOW UPDATED!**
- Products:
  - `"Copy of My Course: Lesson 1"` (ID: 456) ← **NEW PRODUCT!**
  - `"Copy of My Course: Lesson 2"` (ID: 457) ← **NEW PRODUCT!**

### ❌ WRONG Behavior (Before Fix)

**Original Course**:
- Course Name: `"My Course"`
- Main Title: `"My Course"`
- Products: IDs 123, 124

**Duplicated Course**:
- Course Name: `"Copy of My Course"`
- Main Title: `"My Course"` ← **BUG: Not updated!**
- Products: **IDs 123, 124** ← **BUG: Same products!**

## Troubleshooting

### If Both Courses Still Show the Same Products

1. **Check backend logs** - Look for the duplication messages above
2. **Verify mainTitle was updated** - Check database query results
3. **Clear browser cache** - The frontend might be caching old data
4. **Refresh the page** - Force reload with Ctrl+F5

### If You See This in Logs:

```
[DUPLICATE] Updated mainTitle: 'My Course' -> 'Copy of My Course'
✅ Duplicated Slide Deck 'My Course: Lesson 1' -> 'Copy of My Course: Lesson 1' (ID: 456)
```

Then the fix is working correctly! The products are being duplicated with new names.

### If Products Aren't Being Duplicated At All

Check if products were found:
```
Found 0 connected products to duplicate  ← BUG: Products not detected
```

This would indicate a different issue with product detection logic.

## Contact

If the issue persists after verification, provide:
1. Backend logs from the duplication operation
2. Database query results showing the `mainTitle` values
3. Screenshots of both courses showing the products

## Files Modified

- `custom_extensions/backend/main.py` (lines 34408-34418, 34530-34573, 34636-34644)
- `custom_extensions/PHASE_1_DUPLICATION_FIX_IMPLEMENTATION.md`
- `custom_extensions/DUPLICATION_VERIFICATION_GUIDE.md` (this file)

