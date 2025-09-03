# 🚨 IMMEDIATE FIX REQUIRED

## Current Issues in main.py

The `get_user_projects_list_from_db` function has several problems:

1. **Function calls `get_user_identifiers` but it's named `get_user_identifiers_for_workspace`**
2. **Variables `user_uuid, user_email` are defined but code uses `onyx_user_id`**
3. **Duplicate query executions and logic**
4. **User email lookup happens after queries (wrong order)**

## IMMEDIATE FIXES NEEDED

### **Fix 1: Update Function Call**
**Line ~12360:**
```python
# CHANGE FROM:
user_uuid, user_email = await get_user_identifiers(request)

# CHANGE TO:
user_uuid, user_email = await get_user_identifiers_for_workspace(request)
```

### **Fix 2: Add Missing Variable**
**After line ~12360, ADD:**
```python
# For backward compatibility with existing code
onyx_user_id = user_uuid
```

### **Fix 3: Fix Parameter Logic**
**Around line ~12393, FIND:**
```python
folder_filter = ""
params = [onyx_user_id]
```

**REPLACE WITH:**
```python
folder_filter = ""
owned_params = [user_uuid]  # Use UUID for owned projects
shared_params = [user_email if user_email else user_uuid]  # Use email for shared projects
```

### **Fix 4: Update Folder Filter Logic**
**FIND:**
```python
if folder_id is not None:
    folder_filter = "AND p.folder_id = $2"
    params.append(folder_id)
```

**REPLACE WITH:**
```python
if folder_id is not None:
    folder_filter = "AND p.folder_id = $2"
    owned_params.append(folder_id)
    shared_params.append(folder_id)
```

### **Fix 5: Update Query Execution**
**FIND the database query section and REPLACE with:**
```python
async with pool.acquire() as conn:
    # Get owned projects (use UUID)
    owned_rows = await conn.fetch(owned_query, *owned_params)
    
    # Get shared projects (use email)
    shared_rows = await conn.fetch(shared_query, *shared_params)
    
    # 🔍 DEBUG: Log workspace access results
    logger.info(f"🔍 [WORKSPACE ACCESS] User {user_uuid} (email: {user_email}) projects query results:")
    logger.info(f"   - Owned projects: {len(owned_rows)}")
    logger.info(f"   - Shared projects: {len(shared_rows)}")
    logger.info(f"   - Folder filter: {folder_id}")
    logger.info(f"   - Using email for workspace access: {user_email}")
```

### **Fix 6: Remove Duplicate Code**
**DELETE any duplicate query executions and user email lookups**

## EXPECTED RESULT

After applying these fixes, the logs should show:
```
🔍 [WORKSPACE ACCESS] User 2fcc283c-3df3-4bc5-af6b-2d7cd3afdcb2 (email: admin@test.com) projects query results:
   - Owned projects: X
   - Shared projects: Y  # Should be > 0 now!
   - Using email for workspace access: admin@test.com
```

## QUICK TEST

After applying fixes:
1. Restart backend: `docker-compose restart custom_backend`
2. Go to Products page
3. Check backend logs for the corrected output
4. Verify shared projects appear in the UI

---

**Status: 🚨 URGENT FIX REQUIRED** - Apply these changes to fix the user ID mismatch issue 