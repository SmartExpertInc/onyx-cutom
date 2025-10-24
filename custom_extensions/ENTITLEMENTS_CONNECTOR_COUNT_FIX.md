# Entitlements Connector Count and Email Display Fix

## Issues Fixed

### 1. Connector Progress Bar Showing 0
**Problem:** The connector progress bar always showed 0 connectors even when users had created connectors.

**Root Cause:** The entitlements endpoint was querying the `user_connectors` tracking table, but connectors created through the UI weren't being tracked in that table. The actual connectors exist in Onyx's native `connector_credential_pair` table.

**Solution:** Modified the `/api/custom/entitlements/me` endpoint to query Onyx's native connector tables directly:
- Query `connector_credential_pair` (cc_pair) table
- Join with `connector` table
- Filter by `creator_id` (user's UUID)
- Filter by `access_type = 'private'` (SmartDrive connectors)
- Exclude connectors with `status = 'DELETING'`

### 2. Entitlements Admin Tab Showing UUIDs Instead of Emails
**Problem:** The admin entitlements tab displayed user UUIDs instead of email addresses.

**Root Cause:** The query was using `uc.onyx_user_id` as the email, but `onyx_user_id` stores the user's UUID, not their email.

**Solution:** Added a JOIN with Onyx's `"user"` table to fetch the actual email address:
```sql
LEFT JOIN "user" u ON u.id::text = uc.onyx_user_id
COALESCE(u.email, uc.onyx_user_id) AS email
```

## Changes Made

### File: `custom_extensions/backend/main.py`

#### Change 1: Connector Count Query

**Location:** `@app.get("/api/custom/entitlements/me")` endpoint (lines ~27655-27710)

**Before:**
```python
conn_count = await conn.fetchval(
    "SELECT COUNT(*) FROM user_connectors WHERE onyx_user_id = $1 AND status = 'active'",
    onyx_user_id
)
```

**After:**
```python
# Get user's UUID from user_credits
user_row = await conn.fetchrow(
    "SELECT id FROM user_credits WHERE onyx_user_id = $1",
    onyx_user_id
)
if user_row:
    user_uuid = user_row["id"]
    # Count connectors from Onyx's cc_pair table where user is the creator
    conn_count_row = await conn.fetchrow(
        """
        SELECT COUNT(*) as count 
        FROM connector_credential_pair ccp
        JOIN connector c ON ccp.connector_id = c.id
        WHERE ccp.creator_id = $1 
        AND ccp.access_type = 'private'
        AND ccp.status != 'DELETING'
        """,
        user_uuid
    )
    conn_count = int(conn_count_row["count"] or 0) if conn_count_row else 0
else:
    conn_count = 0
```

**Why This Works:**
- Queries the actual source of truth for connectors (Onyx's native tables)
- Counts only private connectors (SmartDrive connectors)
- Excludes connectors being deleted
- Matches what the UI shows (connectors with "Manage" buttons)

#### Change 2: Email Display in Admin Panel

**Location:** `@app.get("/api/custom/admin/entitlements")` endpoint (lines ~27719-27743)

**Before:**
```sql
SELECT uc.onyx_user_id,
       uc.name AS user_name,
       uc.onyx_user_id AS email,  -- This was returning UUID!
       ...
FROM user_credits uc
```

**After:**
```sql
SELECT uc.onyx_user_id,
       uc.name AS user_name,
       COALESCE(u.email, uc.onyx_user_id) AS email,  -- Now fetches actual email
       ...
FROM user_credits uc
LEFT JOIN "user" u ON u.id::text = uc.onyx_user_id  -- Join with Onyx user table
```

**Why This Works:**
- Joins with Onyx's `"user"` table which contains email addresses
- Uses `COALESCE` to fall back to UUID if email is not found
- Casts UUID to text for comparison (`u.id::text`)

## Data Flow

### Connector Count Flow
```
User creates connector via UI
  ↓
Stored in Onyx's connector_credential_pair table
  ↓
Frontend loads connectors from /api/manage/admin/connector/status
  ↓
Filters by access_type = 'private'
  ↓
Displays "Manage" button for each connector
  ↓
Backend counts same connectors from cc_pair table
  ↓
Progress bar shows accurate count
```

### Email Display Flow
```
User registers in Onyx
  ↓
Email stored in "user" table
  ↓
UUID stored in user_credits.onyx_user_id
  ↓
Admin entitlements query joins user_credits with "user" table
  ↓
Fetches email from "user" table
  ↓
Displays email in admin panel
```

## Database Schema

### Onyx Native Tables (Used)

**`"user"` table:**
- `id` (UUID) - Primary key
- `email` (TEXT) - User's email address
- `is_active` (BOOLEAN)
- `role` (TEXT)

**`connector_credential_pair` table:**
- `id` (INTEGER) - Primary key (cc_pair_id)
- `connector_id` (INTEGER) - Foreign key to connector table
- `creator_id` (UUID) - Foreign key to user.id
- `access_type` (TEXT) - 'public' or 'private'
- `status` (TEXT) - 'ACTIVE', 'PAUSED', 'DELETING', etc.

**`connector` table:**
- `id` (INTEGER) - Primary key
- `source` (TEXT) - Connector type (google_drive, slack, etc.)
- `name` (TEXT) - Connector name

### Custom Tables (Used)

**`user_credits` table:**
- `id` (SERIAL) - Primary key (UUID as integer)
- `onyx_user_id` (TEXT) - UUID of user (matches user.id)
- `name` (TEXT) - User's display name

**`user_entitlement_base` table:**
- `onyx_user_id` (TEXT) - Primary key
- `connectors_limit` (INTEGER)
- `storage_gb` (INTEGER)
- `slides_max` (INTEGER)

**`user_entitlement_overrides` table:**
- `onyx_user_id` (TEXT) - Primary key
- `connectors_limit` (INTEGER, nullable)
- `storage_gb` (INTEGER, nullable)
- `slides_max` (INTEGER, nullable)

## Testing

### Test Connector Count
1. Go to SmartDrive tab
2. Note the number of connectors with "Manage" buttons
3. Check the progress bar at the top
4. Verify the count matches

**Example:**
- If you see 2 connectors with "Manage" buttons (e.g., Google Drive, Slack)
- Progress bar should show "2 / X" where X is your limit

### Test Email Display
1. Go to Admin Dashboard → Entitlements tab
2. Verify the first column shows email addresses (e.g., `user@example.com`)
3. Should NOT show UUIDs (e.g., `550e8400-e29b-41d4-a716-446655440000`)

### Debugging

**Check connector count in database:**
```sql
-- Get your user UUID
SELECT id, onyx_user_id FROM user_credits WHERE onyx_user_id = 'your-uuid-here';

-- Count your connectors
SELECT COUNT(*) 
FROM connector_credential_pair ccp
JOIN connector c ON ccp.connector_id = c.id
WHERE ccp.creator_id = 'your-uuid-from-above'
AND ccp.access_type = 'private'
AND ccp.status != 'DELETING';
```

**Check email in database:**
```sql
-- Verify email is in user table
SELECT id, email FROM "user" WHERE id::text = 'your-uuid-here';

-- Test the join
SELECT uc.onyx_user_id, u.email, uc.name
FROM user_credits uc
LEFT JOIN "user" u ON u.id::text = uc.onyx_user_id
WHERE uc.onyx_user_id = 'your-uuid-here';
```

**Check backend logs:**
```
[ENTITLEMENTS] User <uuid>: connectors=2, storage_bytes=62914560, entitlements={...}
```

## Known Limitations

1. **Deleted Connectors:** Connectors with `status = 'DELETING'` are excluded from the count, but fully deleted connectors (removed from database) are automatically not counted.

2. **User Credits Sync:** If a user exists in Onyx's `"user"` table but not in `user_credits`, they won't appear in the entitlements admin panel.

3. **Email Changes:** If a user changes their email in Onyx, it will immediately reflect in the entitlements admin panel (no caching).

## Future Enhancements

1. **Real-time Sync:** Update connector count immediately when connectors are created/deleted without waiting for refresh
2. **Connector Details:** Show which specific connectors are counting toward the limit
3. **Historical Tracking:** Track connector creation/deletion events for analytics
4. **Bulk Operations:** Allow admins to manage multiple users' entitlements at once

## Troubleshooting

### Progress bar still shows 0 connectors

**Check 1:** Verify connectors exist in Onyx tables
```sql
SELECT * FROM connector_credential_pair WHERE creator_id = 'your-uuid';
```

**Check 2:** Verify user_credits has correct UUID
```sql
SELECT id, onyx_user_id FROM user_credits WHERE onyx_user_id = 'your-uuid';
```

**Check 3:** Check backend logs for errors
```
grep "ENTITLEMENTS" backend.log
```

**Check 4:** Verify frontend is calling the correct endpoint
- Open browser console
- Look for `[ENTITLEMENTS] Fetched data:` log
- Verify `connectors_used` field has a value

### Emails still show as UUIDs

**Check 1:** Verify user table has email
```sql
SELECT id, email FROM "user" WHERE id::text = 'your-uuid';
```

**Check 2:** Verify join is working
```sql
SELECT uc.onyx_user_id, u.email
FROM user_credits uc
LEFT JOIN "user" u ON u.id::text = uc.onyx_user_id
LIMIT 5;
```

**Check 3:** Check API response
- Open browser Network tab
- Find request to `/api/custom/admin/entitlements`
- Check response JSON for `email` field
- Should contain email address, not UUID
