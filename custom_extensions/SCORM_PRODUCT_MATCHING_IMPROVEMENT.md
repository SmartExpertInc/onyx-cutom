# SCORM Product Matching Improvement

## Date
October 22, 2025

## Problem
SCORM export was sometimes only including 2 out of 3 products from lessons. For example, lessons with onepager + quiz + presentation would only export presentation + quiz, missing the onepager.

## Root Cause
The `_match_connected_product` function uses strict pattern matching to find products associated with each lesson. If a product's name doesn't exactly match one of the expected patterns, it would be skipped entirely, resulting in incomplete SCORM packages.

### Original Matching Patterns
1. **Pattern A (Quizzes)**: `"Quiz - {outline}: {lesson}"`
2. **Pattern A2 (Prefixed)**: `"{Type} - {outline}: {lesson}"` (e.g., "Presentation - Course: Lesson 1")
3. **Pattern B**: `"{outline}: {lesson}"`
4. **Pattern C**: `microproduct_name` equals lesson title
5. **Pattern E**: `project_name == outline` AND `microproduct_name == lesson`
6. **Pattern D**: `project_name` equals lesson title

If none of these patterns matched, the product was not included in the SCORM package.

## Solution

### 1. Added Enhanced Logging
Added comprehensive logging to diagnose matching issues:

```python
# Log available candidates for this type
candidates = [p for p in projects if _project_type_matches(p, target_mtypes) and is_unused(p.get('id'))]
logger.info(f"[SCORM-MATCH] Looking for type='{desired_type}' (mtypes={target_mtypes}) for lesson='{lesson_title}' | {len(candidates)} unused candidates")
if candidates and len(candidates) <= 5:
    for c in candidates:
        logger.info(f"[SCORM-MATCH]   Candidate: id={c.get('id')}, pname='{pname(c)}', mname='{mname(c)}', type={c.get('microproduct_type')}")
```

### 2. Added Pattern F (Fuzzy Matching)
Added a new fallback pattern that performs fuzzy matching:

```python
# Pattern F (NEW): Fuzzy match - project_name contains lesson title
for proj in projects:
    if _project_type_matches(proj, target_mtypes) and is_unused(proj.get('id')):
        pn = pname(proj).lower()
        lt = lesson_title.lower()
        if lt in pn or pn in lt:
            logger.info(f"[SCORM-MATCH] ✓ Matched Pattern F (Fuzzy) id={proj.get('id')}, pname='{pname(proj)}'")
            return dict(proj)
```

This pattern catches products where:
- The lesson title is contained somewhere in the project name
- The project name is contained somewhere in the lesson title

### 3. Added Match Success Logging
Each pattern now logs when it successfully matches:

```python
logger.info(f"[SCORM-MATCH] ✓ Matched Pattern A (Quiz) id={proj.get('id')}")
logger.info(f"[SCORM-MATCH] ✓ Matched Pattern A2 (Prefixed) id={proj.get('id')}, pattern='{target_name_prefixed}'")
# ... etc for all patterns
```

### 4. Added No-Match Warning
When no pattern matches, a clear warning is logged:

```python
logger.warning(f"[SCORM-MATCH] ✗ No match found for type='{desired_type}' lesson='{lesson_title}' outline='{outline_name}'")
```

## Files Modified

- `custom_extensions/backend/app/services/scorm_packager.py`
  - Function: `_match_connected_product` (lines 112-198)
  - Added diagnostic logging for candidates
  - Added success logging for each pattern
  - Added Pattern F (fuzzy matching) as fallback
  - Added warning for no-match cases

## Matching Logic Flow (After Fix)

1. **Check for candidates**: Log all unused products that match the desired type
2. **Try Pattern A** (Quiz-specific naming)
3. **Try Pattern A2** (Prefixed naming: "Presentation - Course: Lesson")
4. **Try Pattern B** (Outline:Lesson format)
5. **Try Pattern C** (microproduct_name == lesson title)
6. **Try Pattern E** (project_name == outline AND microproduct_name == lesson)
7. **Try Pattern D** (project_name == lesson title)
8. **Try Pattern F (NEW)** (Fuzzy match - contains/contained by)
9. **Log warning** if still no match

## Benefits

1. **Better Coverage**: Fuzzy matching catches products with slightly different naming conventions
2. **Better Diagnostics**: Detailed logging helps identify why products aren't being matched
3. **Backward Compatible**: All existing patterns still work exactly as before
4. **Graceful Degradation**: If fuzzy matching creates false positives, it's easy to adjust the logic

## Example Log Output

```
[SCORM-MATCH] Looking for type='one-pager' (mtypes=['One Pager', 'Text Presentation', 'PDF Lesson']) for lesson='Introduction to Safety' | 2 unused candidates
[SCORM-MATCH]   Candidate: id=123, pname='Course Name: Introduction to Safety - Onepager', mname='', type=One Pager
[SCORM-MATCH]   Candidate: id=124, pname='Introduction to Safety Overview', mname='Introduction to Safety', type=Text Presentation
[SCORM-MATCH] ✓ Matched Pattern F (Fuzzy) id=123, pname='Course Name: Introduction to Safety - Onepager'
```

## Testing

To verify the fix works:

1. Create a training plan with lessons that have 3 products (onepager + quiz + presentation)
2. Export to SCORM
3. Check backend logs for `[SCORM-MATCH]` entries
4. Verify all 3 products are included in the SCORM package
5. Check which patterns matched each product

## Notes

- **Fuzzy matching order matters**: Pattern F runs AFTER all strict patterns, so exact matches are always preferred
- **Type checking still applies**: Fuzzy matching still requires the correct product type
- **Used IDs tracking**: Products can only be matched once per SCORM package (prevents duplicates)
- **Case insensitive**: Fuzzy matching is case-insensitive for better flexibility

## Related Files

- `custom_extensions/backend/app/services/scorm_packager.py` - Main SCORM packaging service
- `custom_extensions/SCORM_VERSION_AWARE_TEMPLATE_SELECTION.md` - Related SCORM improvements

## Future Improvements

If fuzzy matching is too broad and creates false positives:
1. Add minimum length requirements (e.g., lesson title must be at least 5 chars)
2. Use more sophisticated string matching (e.g., Levenshtein distance)
3. Add explicit exclusion patterns
4. Allow configuration of matching strictness

