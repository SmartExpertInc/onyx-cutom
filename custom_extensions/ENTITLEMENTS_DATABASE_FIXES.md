# Entitlements Database Fixes

## Issues Fixed

### 1. Email Column Error in Entitlements Tab
**Error:**
```
ERROR:main:Error listing entitlements: column uc.email does not exist
```

**Root Cause:**
The query in `admin_list_entitlements` was trying to access `uc.email` from the `user_credits` table, but this column doesn't exist in the schema.

**Solution:**
Changed the email field to use `onyx_user_id` as a fallback since we don't store email in the custom backend tables:

```python
# Before:
COALESCE(uc.email, ub.email, uc.onyx_user_id) AS email,

# After:
uc.onyx_user_id AS email,
```

**Location:** `custom_extensions/backend/main.py` - Line ~27701

---

### 2. Connector Count Always Shows 0
**Error:**
The connectors progress bar on the SmartDrive tab always displayed 0, even when users had active connectors.

**Root Cause:**
The backend was querying the `user_connectors` table which may not be synchronized with the actual Onyx connector system. The frontend successfully loads connectors from `/api/manage/admin/connector/status`, but the backend was using a different data source.

**Solution:**
Updated the connector count logic to call the same Onyx API endpoint that the frontend uses:

```python
# Connector count - Call Onyx API to get real connector count
conn_count = 0
try:
    # Get session cookie from request to authenticate with Onyx API
    session_cookie = request.cookies.get(ONYX_SESSION_COOKIE_NAME)
    if session_cookie:
        connector_status_url = f"{ONYX_API_SERVER_URL}/manage/admin/connector/status"
        cookies_to_forward = {ONYX_SESSION_COOKIE_NAME: session_cookie}
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(connector_status_url, cookies=cookies_to_forward)
            if response.status_code == 200:
                connectors_data = response.json()
                # Count only private connectors (same as frontend logic)
                conn_count = len([c for c in connectors_data if c.get('access_type') == 'private'])
                logger.info(f"[ENTITLEMENTS] Fetched {conn_count} private connectors from Onyx API for user {onyx_user_id}")
            else:
                logger.warning(f"[ENTITLEMENTS] Failed to fetch connectors from Onyx API: {response.status_code}")
except Exception as e:
    logger.warning(f"[ENTITLEMENTS] Error fetching connectors from Onyx API: {e}")
```

**Key Changes:**
- Calls Onyx API at `/manage/admin/connector/status` (same as frontend)
- Filters only `access_type === 'private'` connectors (same as frontend logic in `page.tsx`)
- Uses user's session cookie for authentication
- Gracefully handles errors by defaulting to 0 if API call fails

**Location:** `custom_extensions/backend/main.py` - Lines ~27663-27681

---

## Testing

After these fixes:

1. **Entitlements Tab:** Should load without errors and display user information correctly
2. **Connector Progress Bar:** Should show the correct number of private connectors the user has created

## Related Files

- `custom_extensions/backend/main.py` - Backend API with fixes applied
- `custom_extensions/frontend/src/app/create/from-files/specific/page.tsx` - Frontend reference for connector API usage

## Date
October 8, 2025
