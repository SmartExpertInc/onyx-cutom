# Entitlements UI and Progress Bar Fixes

## Summary
Fixed three issues with the entitlements system:
1. Made progress bars thinner and more visually appealing
2. Fixed entitlements admin tab to display user emails instead of IDs
3. Fixed override field state management to properly handle clearing values
4. Fixed progress bars to show accurate data by tracking file uploads and connector creation

## Changes Made

### 1. Progress Bar Styling

**File:** `custom_extensions/frontend/src/components/SmartDrive/SmartDriveConnectors.tsx`

**Changes:**
- Changed progress bar height from `h-3` to `h-2` for a sleeker appearance
- Added a "Refresh" button to manually update usage data
- Added console logging to debug data fetching
- Set up auto-refresh every 10 seconds for both connectors and entitlements

**Visual Improvements:**
- Thinner progress bars (8px → 6px)
- Color coding:
  - Green/Blue: Normal usage (< 80%)
  - Yellow: Warning (80-99%)
  - Red: At or over limit (≥ 100%)

### 2. Email Display in Entitlements Tab

**File:** `custom_extensions/backend/main.py`

**Issue:** The entitlements admin tab was showing user IDs instead of emails because `user_email_cache` was empty.

**Solution:** 
- Simplified the SQL query to use `onyx_user_id` directly as the email (since in this system, `onyx_user_id` IS the user's email)
- Removed dependency on `user_email_cache` table
- Added `user_name` and `user_email` fields to the response

**SQL Changes:**
```sql
-- Before: Complex join with user_email_cache
LEFT JOIN user_email_cache ub_user ON ub_user.onyx_user_id = uc.onyx_user_id

-- After: Direct use of onyx_user_id as email
uc.onyx_user_id AS email
```

### 3. Override Field State Management

**File:** `custom_extensions/frontend/src/app/admin/main/components/EntitlementsTab.tsx`

**Issue:** When an admin cleared an override field and clicked save, the field would revert to the last value instead of clearing.

**Solution:**
- Added `React.useEffect` hook to reset local state when row data changes
- This ensures that after a save operation, the fields reflect the actual stored values
- Empty fields now properly send `null` to the backend, which triggers fallback to default tier values

**Code Added:**
```typescript
// Reset state when row data changes (after save)
React.useEffect(() => {
  setConn(row.overrides.connectors_limit?.toString() ?? "");
  setStor(row.overrides.storage_gb?.toString() ?? "");
  setSlides(row.overrides.slides_max?.toString() ?? "");
}, [row.overrides.connectors_limit, row.overrides.storage_gb, row.overrides.slides_max]);
```

### 4. Progress Bar Data Tracking

**Files:**
- `custom_extensions/backend/main.py` (upload endpoint)
- `custom_extensions/backend/main.py` (entitlements endpoint)

**Issue:** Progress bars showed 0 for both connectors and storage despite users having created connectors and uploaded files.

**Root Cause:** The main SmartDrive upload endpoint (`/api/custom/smartdrive/upload`) was using streaming uploads but not tracking file sizes in the `user_storage_usage` table.

**Solutions:**

#### A. Storage Tracking
- Modified the streaming upload to count bytes as they're streamed
- Added `file_size` tracking using a `nonlocal` variable in the async generator
- After successful upload, update `user_storage_usage` table with the file size

**Code Changes:**
```python
# Track file size during streaming
file_size = 0
async def aiter():
    nonlocal file_size
    while True:
        chunk = await f.read(1024 * 64)
        if not chunk:
            break
        file_size += len(chunk)
        yield chunk

# After successful upload
await conn2.execute(
    """
    INSERT INTO user_storage_usage (onyx_user_id, used_bytes, updated_at)
    VALUES ($1, $2, now())
    ON CONFLICT (onyx_user_id)
    DO UPDATE SET used_bytes = user_storage_usage.used_bytes + EXCLUDED.used_bytes, updated_at = now()
    """,
    str(onyx_user_id),
    file_size,
)
```

#### B. Enhanced Logging
- Added detailed logging to the entitlements endpoint to help debug issues
- Logs show: user ID, connector count, storage bytes, and full entitlements object

**Code Added:**
```python
logger.info(f"[ENTITLEMENTS] User {onyx_user_id}: connectors={conn_count}, storage_bytes={storage_row}, entitlements={ent}")
```

#### C. Frontend Debugging
- Added console logging to track entitlements API calls
- Shows fetched data and any errors
- Helps identify if the issue is frontend or backend

## Testing

### Test Storage Tracking
1. Go to SmartDrive tab
2. Upload a file (e.g., 60MB)
3. Click "Refresh" button or wait 10 seconds
4. Storage progress bar should update to show used space

### Test Connector Tracking
1. Create a new connector (e.g., Google Drive)
2. Wait for it to become active
3. Click "Refresh" button or wait 10 seconds
4. Connectors progress bar should show 1/X (where X is your limit)

### Test Email Display
1. Go to Admin Dashboard → Entitlements tab
2. Verify that the first column shows email addresses, not UUIDs
3. Emails should match the user's login email

### Test Override Clearing
1. Go to Admin Dashboard → Entitlements tab
2. Find a user with an override value
3. Clear the override field (delete all text)
4. Click "Save"
5. Refresh the page
6. Field should remain empty, and "Effective" column should show the default tier value

## Data Flow

### Storage Usage Flow
```
User uploads file
  ↓
Stream chunks through async generator
  ↓
Count bytes in file_size variable
  ↓
Upload to Nextcloud
  ↓
Update user_storage_usage table
  ↓
Frontend fetches /api/custom/entitlements/me
  ↓
Progress bar displays used/limit
```

### Connector Usage Flow
```
User creates connector
  ↓
custom_extensions/backend/app/api/connectors.py
  ↓
Insert into user_connectors table with status='active'
  ↓
Frontend fetches /api/custom/entitlements/me
  ↓
Query counts active connectors
  ↓
Progress bar displays used/limit
```

## Known Limitations

1. **Historical Data**: Existing uploads before this fix won't be counted. Storage usage starts from 0 after this update.
2. **File Deletions**: Currently not tracked. Deleting files won't decrease the storage usage counter.
3. **Connector Deletions**: When a connector is deleted, it should update the status in `user_connectors` to 'deleted' or remove the row.

## Future Enhancements

1. **Backfill Storage Usage**: Query Nextcloud to calculate existing storage usage for all users
2. **Track File Deletions**: Hook into SmartDrive delete operations to decrease storage counter
3. **Connector Cleanup**: Ensure deleted connectors are properly removed from `user_connectors` table
4. **Real-time Updates**: Use WebSockets to push usage updates without polling
5. **Usage History**: Track storage and connector usage over time for analytics
6. **Quota Warnings**: Show warnings when approaching limits (e.g., at 80%, 90%)

## Troubleshooting

### Progress bars still show 0
1. Check browser console for `[ENTITLEMENTS] Fetched data:` log
2. Check backend logs for `[ENTITLEMENTS] User X: connectors=Y, storage_bytes=Z`
3. Verify `user_connectors` table has entries: `SELECT * FROM user_connectors WHERE onyx_user_id = 'your-email@example.com';`
4. Verify `user_storage_usage` table has entries: `SELECT * FROM user_storage_usage WHERE onyx_user_id = 'your-email@example.com';`

### Emails still show as IDs
1. Check if `onyx_user_id` in `user_credits` table is actually the email
2. Verify the SQL query is returning the email field correctly
3. Check browser network tab for the API response from `/api/custom/admin/entitlements`

### Override fields don't clear
1. Check that the `useEffect` hook is present in `EntRow` component
2. Verify that the save operation returns updated data
3. Check that the backend is correctly setting overrides to `null` when empty string is sent
