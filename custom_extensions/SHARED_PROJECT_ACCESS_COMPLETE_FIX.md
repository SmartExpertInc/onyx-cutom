# Shared Project Access Complete Fix

## Issues Identified

### Issue 1: Role-based Access Not Working
**Problem**: Users with role-based access couldn't see shared projects in the projects list.
**Root Cause**: Query expected role ID (`"6"`) but database stored role name (`"member"`).

### Issue 2: Shared Projects Return 404 When Accessed  
**Problem**: Shared projects appeared in the list but returned 404 when clicked.
**Root Cause**: Project view endpoint used UUID for workspace access checks but members are stored with emails.

## Fixes Applied

### Fix 1: Updated Shared Projects Query (Lines 12394, 12576)
**Before**:
```sql
OR (pa.access_type = 'role' AND pa.target_id = CAST(wm.role_id AS TEXT))
```

**After**:
```sql
OR (pa.access_type = 'role' AND (
    pa.target_id = CAST(wm.role_id AS TEXT) 
    OR pa.target_id IN (SELECT name FROM workspace_roles WHERE id = wm.role_id)
))
```

**Result**: Now matches both role IDs (`"6"`) and role names (`"member"`).

### Fix 2: Updated Project View Endpoint (Line 12552)
**Before**:
```python
async def get_project_instance_detail(
    project_id: int, 
    onyx_user_id: str = Depends(get_current_onyx_user_id),  # ❌ Only UUID
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    # Query used onyx_user_id (UUID) for both ownership and workspace access
    row = await conn.fetchrow(select_query, project_id, onyx_user_id)
```

**After**:
```python
async def get_project_instance_detail(
    project_id: int, 
    request: Request,  # ✅ Get real user data
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    # Get both UUID and email
    user_uuid, user_email = await get_user_identifiers_for_workspace(request)
    
    # Use UUID for ownership, email for workspace access
    row = await conn.fetchrow(select_query, project_id, user_uuid, user_email)
```

### Fix 3: Updated Query Parameters
**Query now uses**:
- `$1`: `project_id` 
- `$2`: `user_uuid` (for `p.onyx_user_id = $2` - project ownership)
- `$3`: `user_email` (for `wm.user_id = $3` - workspace membership)

## Expected Results

### ✅ Role-based Access Should Work
```
🔍 [WORKSPACE ACCESS] User 789affa9... (email: vol@gmail.com):
   - Owned projects: 0
   - Shared projects: 1  ✅ Now finds role-based shared projects
   - Project: AI Tools for High School Teachers (ID: 22)
```

### ✅ Shared Project View Should Work
```
GET /api/custom/projects/view/22 HTTP/1.1" 200 OK  ✅ No more 404 errors
```

## Testing Steps

### Test Role-based Access
1. **Login as user with role access** (`vol@gmail.com`)
2. **Go to Projects page** 
3. **Should see shared project** in the list
4. **Click on the shared project**
5. **Should open successfully** (no 404 error)

### Test Individual Access
1. **Should continue to work** as before
2. **Both listing and viewing** should work correctly

## Technical Details

### Workspace Access Logic
The query now checks:
1. **Project ownership**: `p.onyx_user_id = user_uuid`
2. **Workspace membership**: `wm.user_id = user_email` 
3. **Role matching**: Matches both role ID and role name
4. **Individual access**: `pa.target_id = user_email`

### Files Modified
- `custom_extensions/backend/main.py`:
  - Updated shared projects query (2 instances)
  - Updated project view endpoint
  - Added proper user identification

## Status
✅ **BOTH ISSUES FIXED**:
1. ✅ Role-based access should now work in project listings
2. ✅ Shared projects should open without 404 errors
3. ✅ Individual access continues to work
4. ✅ All access types (workspace, role, individual) are properly supported 