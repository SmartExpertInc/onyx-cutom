# Product Access 403 Forbidden Error Fix

## Issue Identified
When trying to grant product access via the access modal, requests were failing with `403 Forbidden` errors:

```
INFO:     172.18.0.10:35052 - "POST /api/custom/products/22/access HTTP/1.1" 403 Forbidden
INFO:     172.18.0.10:35066 - "POST /api/custom/products/22/access HTTP/1.1" 403 Forbidden
INFO:     172.18.0.10:48540 - "POST /api/custom/products/22/access HTTP/1.1" 403 Forbidden
```

## Root Cause
**Hardcoded User ID in Product Access API**: 
- The `product_access.py` file had a hardcoded `get_current_user_id()` function that always returned `"current_user_123"`
- The workspace membership check was looking for `"current_user_123"` in the workspace members table
- Since workspace members are stored with email addresses, the check failed
- This caused the `403 Forbidden` response on line 34: `raise HTTPException(status_code=403, detail="Access denied to workspace")`

## Fix Applied

### 1. Replaced Hardcoded User Identification
**Before** (in `app/api/product_access.py`):
```python
async def get_current_user_id() -> str:
    # TODO: Integrate with your authentication system
    # For now, return a placeholder user ID
    return "current_user_123"

@router.post("/{product_id}/access")
async def grant_product_access(
    current_user_id: str = Depends(get_current_user_id)  # ❌ Always "current_user_123"
):
    member = await WorkspaceService.get_workspace_member(access_data.workspace_id, current_user_id)
```

**After**:
```python
async def get_user_identifiers_for_workspace(request: Request) -> tuple[str, str]:
    """Get both UUID and email for workspace operations."""
    # ... proper user identification logic from session cookies ...

@router.post("/{product_id}/access")
async def grant_product_access(
    request: Request = None  # ✅ Get real user from request
):
    user_uuid, user_email = await get_user_identifiers_for_workspace(request)
    member = await WorkspaceService.get_workspace_member(access_data.workspace_id, user_email)  # ✅ Use email
```

### 2. Updated All Product Access Endpoints
Fixed all endpoints in `product_access.py`:
- `grant_product_access` - Grant access to products
- `get_product_access_list` - Get access records
- `revoke_product_access` - Revoke access
- `check_user_product_access` - Check user access
- `get_user_accessible_products` - Get accessible products
- `bulk_grant_product_access` - Bulk grant access
- `get_workspace_product_access` - Get workspace access

### 3. Consistent User ID Usage
- **Email for workspace membership checks**: `get_workspace_member(workspace_id, user_email)`
- **UUID for product access operations**: `grant_access(access_data, user_email)`
- **Proper authentication**: Real user identification from session cookies

## Expected Result
After this fix, the product access modal should work correctly:
```
✅ POST /api/custom/products/22/access HTTP/1.1" 200 OK
✅ User can grant workspace/role/individual access to projects
✅ Access modal functions properly
```

## Testing
1. **Go to any project** (course outline)
2. **Click the access/sharing button** 
3. **Try to grant access** to workspace, role, or individual user
4. **Should succeed** without 403 errors
5. **Check backend logs** for success messages

## Files Modified
- `custom_extensions/backend/app/api/product_access.py` - Fixed user identification and workspace membership checks

## Status
✅ **FIXED** - Product access API now uses proper user identification instead of hardcoded values, allowing workspace members to grant product access correctly. 