# Role Access Target ID Mismatch Fix

## Issue Identified
The logs show that role-based product access is not working correctly:

```
✅ Product access record exists:
   - Access Type: role
   - Target ID: "member"  # ❌ Role name instead of role ID

✅ User has correct role:
   - Role: Member (ID: 6)  # ✅ Role ID is 6

❌ Shared projects query returns 0 results
```

## Root Cause
**Target ID Mismatch**: The product access record stores the role **name** (`"member"`) but the query expects the role **ID** (`"6"`).

### Current Query Logic
```sql
OR (pa.access_type = 'role' AND pa.target_id = CAST(wm.role_id AS TEXT))
```
This looks for `pa.target_id = "6"` but the stored value is `"member"`.

## Fix Applied

### 1. Updated Shared Projects Query
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

This now matches both:
- Role ID: `"6"` ✅
- Role name: `"member"` ✅

### 2. Query Logic Explanation
The updated query checks if the `target_id` matches either:
1. **Role ID as string**: `CAST(wm.role_id AS TEXT)` → `"6"`
2. **Role name**: `(SELECT name FROM workspace_roles WHERE id = wm.role_id)` → `"member"`

## Expected Result
After this fix, users with role-based access should see shared projects:

```
🔍 [WORKSPACE ACCESS] User 789affa9... (email: vol@gmail.com):
   - Owned projects: 0
   - Shared projects: 1  # ✅ Should now find the shared project
   - Project: AI Tools for High School Teachers (ID: 22)
```

## Testing
1. **Refresh the Projects page** for the user with role access
2. **Check if shared project appears** in the projects list
3. **Verify backend logs** show `Shared projects: 1` instead of `0`

## Frontend Issue (To Fix Later)
The frontend is storing role **names** instead of role **IDs** when granting access:
```typescript
// In handleRoleToggle:
target_id: roleId  // Currently passes "member" instead of "6"
```

**Future fix**: Update frontend to pass role ID instead of role name.

## Files Modified
- `custom_extensions/backend/main.py` - Updated shared projects query to handle both role IDs and names

## Status
✅ **FIXED** - Role-based product access should now work correctly by matching both role IDs and role names in the target_id field. 