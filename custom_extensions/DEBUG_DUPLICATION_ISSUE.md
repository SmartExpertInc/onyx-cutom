# Debugging Course Duplication mainTitle Issue

## Current Problem

After duplicating a course created AFTER the fix:
- Course name shows: `"Copy of Junior AI/ML Engineer Training"` ✅
- BUT mainTitle in database shows: `"Junior AI/ML Engineer Training"` ❌
- Result: Duplicated course finds original products instead of copied products

## Root Cause Investigation

The mainTitle update code is in place, but something is preventing it from being saved to the database correctly.

## Enhanced Debug Logging Added

### Location
`custom_extensions/backend/main.py` (lines 34413-34480)

### What to Look For in Logs

When you duplicate a course, you should see these messages:

#### 1. Content Type Check
```
[DUPLICATE] Original content type: <class 'dict'>, has mainTitle: True
```
**Expected**: `<class 'dict'>` and `has mainTitle: True`
**If different**: This indicates the content structure is unexpected

#### 2. After Deep Copy
```
[DUPLICATE] After deepcopy, content type: <class 'dict'>
```
**Expected**: `<class 'dict'>`
**If different**: Deep copy failed

#### 3. mainTitle Update
```
[DUPLICATE] ✅ Updated mainTitle: 'Junior AI/ML Engineer Training' -> 'Copy of Junior AI/ML Engineer Training'
```
**Expected**: Shows old and new mainTitle
**Alternative**: `⚠️ mainTitle didn't exist, added: 'Copy of...'`
**Error**: `❌ Content is not a dict! Type: ...`

#### 4. Database Verification
```
[DUPLICATE] ✅ VERIFIED: Database has mainTitle = 'Copy of Junior AI/ML Engineer Training'
```
**Expected**: mainTitle matches the new course name
**Error**: `❌ VERIFICATION FAILED: Database mainTitle not found...`

## Test Steps

1. **Duplicate the course** that was showing the wrong products
2. **Check backend logs** for the messages above
3. **Note the new course ID** from logs: `Created new Training Plan with ID {new_outline_id}`
4. **Manually query database**:
   ```sql
   SELECT 
       id, 
       project_name, 
       microproduct_content->>'mainTitle' as main_title
   FROM projects
   WHERE id = {new_outline_id};
   ```

## Possible Issues and Solutions

### Issue #1: Content is not a dict
**Symptom**: `❌ Content is not a dict! Type: <class 'str'>`
**Cause**: `microproduct_content` is stored as JSON string, not JSONB
**Solution**: Need to parse it before updating

### Issue #2: mainTitle doesn't exist
**Symptom**: `⚠️ mainTitle didn't exist, added:`
**Cause**: Old course structure without mainTitle field
**Solution**: Code now adds it if missing

### Issue #3: Database verification fails
**Symptom**: `❌ VERIFICATION FAILED: Database mainTitle not found`
**Cause**: INSERT is not saving the updated content correctly
**Solution**: Check asyncpg JSONB handling

### Issue #4: JSON string vs JSONB
**Symptom**: Database shows string instead of JSONB
**Solution**: May need to explicitly cast or use `json.dumps()`

## Quick Fix Test

If the logs show the update is happening in memory but not persisting, try:

```python
# Before INSERT, explicitly serialize if needed
if isinstance(new_content, dict):
    import json
    new_content_for_db = json.dumps(new_content)  # Force string
else:
    new_content_for_db = new_content
```

## Next Steps

1. Duplicate a course and capture the complete log output
2. Share the logs showing all 4 checkpoints above
3. Query the database to verify what was actually stored
4. Based on logs, we can determine the exact issue

## Logs to Capture

When duplicating, capture from log start:
```
Starting duplication of project X (type: Training Plan) for user Y
```

Through to:
```
📋 [DUPLICATION SUMMARY]
```

This will show the complete flow and where it's failing.

