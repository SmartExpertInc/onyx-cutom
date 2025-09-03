# 🔧 User ID Mismatch Fix

## Problem Identified

**Backend Logs Show:**
```
🔍 [WORKSPACE ACCESS] User 2fcc283c-3df3-4bc5-af6b-2d7cd3afdcb2 projects query results:
   - Owned projects: 0
   - Shared projects: 0
   - User workspace memberships: 0
   ❌ User 2fcc283c-3df3-4bc5-af6b-2d7cd3afdcb2 is not a member of any workspace!
```

**Root Cause:**
- Backend gets UUID `2fcc283c-3df3-4bc5-af6b-2d7cd3afdcb2` from Onyx auth system
- Workspace members are stored with **email addresses** (e.g., `admin@test.com`)
- Query fails: `WHERE wm.user_id = '2fcc283c-3df3-4bc5-af6b-2d7cd3afdcb2'` finds nothing
- But workspace member exists with `user_id = 'admin@test.com'`

## Solution: Dual Lookup Strategy

### **Step 1: Update Projects Endpoint in main.py**

Find the `get_user_projects_list_from_db` function (around line 12354) and replace this section:

**FIND:**
```python
    async with pool.acquire() as conn:
        # Get both owned and shared projects
        owned_rows = await conn.fetch(owned_query, *params)
        shared_rows = await conn.fetch(shared_query, *params)
        
        # 🔍 DEBUG: Log workspace access results
        logger.info(f"🔍 [WORKSPACE ACCESS] User {onyx_user_id} projects query results:")
```

**REPLACE WITH:**
```python
    # Get user email for workspace access (workspace members stored with emails)
    user_email = None
    try:
        session_cookie_value = request.cookies.get(ONYX_SESSION_COOKIE_NAME)
        if session_cookie_value:
            onyx_user_info_url = f"{ONYX_API_SERVER_URL}/me"
            cookies_to_forward = {ONYX_SESSION_COOKIE_NAME: session_cookie_value}
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(onyx_user_info_url, cookies=cookies_to_forward)
                if response.status_code == 200:
                    user_data = response.json()
                    user_email = user_data.get("email")
    except Exception as e:
        logger.warning(f"Could not get user email for workspace access: {e}")
    
    # Use email for workspace queries if available
    user_for_workspace = user_email if user_email else onyx_user_id
    
    async with pool.acquire() as conn:
        # Get owned projects (use UUID)
        owned_rows = await conn.fetch(owned_query, *params)
        
        # Get shared projects (use email)
        shared_params = [user_for_workspace] + (params[1:] if len(params) > 1 else [])
        shared_rows = await conn.fetch(shared_query, *shared_params)
        
        # 🔍 DEBUG: Log workspace access results
        logger.info(f"🔍 [WORKSPACE ACCESS] User {onyx_user_id} (email: {user_email}) projects query results:")
```

### **Step 2: Update Individual Access Query**

In the shared_projects_query, also update individual access to use email:

**FIND:**
```sql
OR (pa.access_type = 'individual' AND pa.target_id = $1)
```

**REPLACE WITH:**
```sql
OR (pa.access_type = 'individual' AND (pa.target_id = $1 OR pa.target_id = $2))
```

But since we're now passing the email as $1 in shared_params, this becomes:
```sql
OR (pa.access_type = 'individual' AND pa.target_id = $1)
```

### **Step 3: Update Project View Endpoint**

Find the `get_project_instance_detail` function and apply similar changes for the EXISTS subquery.

## Alternative Solution: Update Workspace Member Storage

If you prefer to fix the storage layer instead:

### **Option A: Store Both UUID and Email**

Add a new column to workspace_members:
```sql
ALTER TABLE workspace_members ADD COLUMN onyx_user_uuid VARCHAR(36);

-- Update existing records with UUIDs (requires mapping)
-- UPDATE workspace_members SET onyx_user_uuid = '...' WHERE user_id = 'email@example.com';
```

### **Option B: Use UUID Consistently**

Update workspace member creation to use UUIDs instead of emails:
1. Modify workspace service to store UUIDs
2. Update frontend to pass UUIDs instead of emails
3. Update UI to display emails but store UUIDs

## Testing the Fix

### **1. Apply the Fix**
- Make the code changes above
- Restart backend: `docker-compose restart custom_backend`

### **2. Test with Debug Script**
```bash
cd custom_extensions/backend
python debug_user_mismatch.py
```

### **3. Check Backend Logs**
Should now show:
```
🔍 [WORKSPACE ACCESS] User 2fcc283c-3df3-4bc5-af6b-2d7cd3afdcb2 (email: admin@test.com) projects query results:
   - Owned projects: X
   - Shared projects: Y  # <- Should be > 0 now!
```

### **4. Test Frontend**
- Go to Products page
- Should now see shared projects
- Check browser console for project logs

## Expected Results After Fix

### **Backend Logs:**
```
🔍 [WORKSPACE ACCESS] User 2fcc283c-3df3-4bc5-af6b-2d7cd3afdcb2 (email: admin@test.com) projects query results:
   - Owned projects: 1
   - Shared projects: 2  # ✅ Now finds shared projects!
   - User workspace memberships: 1  # ✅ Now finds membership!
```

### **Frontend:**
```javascript
🔍 [PROJECTS DEBUG] Raw projects data from API: {
  totalProjects: 3,  // owned + shared
  projects: [
    { id: 1, name: "My Project" },      // owned
    { id: 2, name: "Shared Project 1" }, // shared
    { id: 3, name: "Shared Project 2" }  // shared
  ]
}
```

## Why This Happens

1. **Onyx Auth System** returns UUID for `user.id`
2. **Workspace UI** uses emails for user identification  
3. **Database Storage** stores `workspace_members.user_id = email`
4. **Backend Query** looks for `workspace_members.user_id = UUID`
5. **Result:** No match found, 0 shared projects

## Long-term Solution

For production, consider:
1. **Consistent ID Strategy** - Use UUIDs everywhere
2. **User Mapping Table** - Map UUIDs to emails
3. **Dual Storage** - Store both UUID and email in workspace_members
4. **Auth Integration** - Use the same user identification across all systems

---

**Status:** 🔧 **READY TO APPLY** - Apply the code changes above to fix the user ID mismatch issue 