# Entitlements Email Display and UI Improvements

## Overview
Enhanced the admin panel to display actual user emails instead of IDs in both the Entitlements and Features tables, and improved the SmartDrive UI by removing the manual refresh button from progress bars.

## Changes Made

### 1. Display Emails in Entitlements Table

**Location:** `custom_extensions/backend/main.py` - Lines ~27706-27778

**Problem:** The entitlements table was showing user IDs instead of email addresses, making it difficult for admins to identify users.

**Solution:** Updated the `admin_list_entitlements` endpoint to fetch user emails from the Onyx API:

```python
# Fetch user emails from Onyx API
user_emails_map = {}
try:
    session_cookie = request.cookies.get(ONYX_SESSION_COOKIE_NAME)
    if session_cookie:
        users_url = f"{ONYX_API_SERVER_URL}/manage/users"
        cookies_to_forward = {ONYX_SESSION_COOKIE_NAME: session_cookie}
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(users_url, cookies=cookies_to_forward)
            if response.status_code == 200:
                users_data = response.json()
                # Map user IDs to emails
                for user in users_data:
                    user_id = str(user.get('id', ''))
                    email = user.get('email', '')
                    if user_id and email:
                        user_emails_map[user_id] = email
```

**Benefits:**
- Admins can now see actual email addresses
- Easier user identification and management
- Falls back to user ID if email fetch fails
- Uses admin session to authenticate with Onyx API

---

### 2. Display Emails in Features Table

**Location:** `custom_extensions/backend/main.py` - Lines ~28619-28697

**Problem:** Similar to entitlements, the features table was also showing user IDs instead of emails.

**Solution:** Applied the same email fetching logic to the `get_users_with_features` endpoint:

```python
# Get email from map, fallback to user_id
user_email = user_emails_map.get(user_id, user_id)
users_features[user_id] = {
    'user_id': user_id,
    'user_email': user_email,
    'user_name': row['user_name'] or 'Unknown User',
    'features': []
}
```

**Benefits:**
- Consistent user identification across admin tabs
- Better user experience for feature management
- Same fallback behavior as entitlements

---

### 3. Remove Manual Refresh Button from Progress Bars

**Location:** `custom_extensions/frontend/src/components/SmartDrive/SmartDriveConnectors.tsx` - Lines ~581-586

**Problem:** The progress bars on the SmartDrive tab had a "Refresh" button that was redundant since they update automatically.

**Solution:** Removed the refresh button UI:

```typescript
// Before:
<div className="flex justify-between items-center mb-4">
  <h3 className="text-lg font-semibold text-gray-900">Usage & Limits</h3>
  <button onClick={() => fetchEntitlements()}>Refresh</button>
</div>

// After:
<div className="flex justify-between items-center mb-4">
  <h3 className="text-lg font-semibold text-gray-900">Usage & Limits</h3>
</div>
```

**Benefits:**
- Cleaner UI without redundant controls
- Progress bars still update automatically when:
  - Component mounts
  - User creates/deletes connectors
  - User uploads/deletes files

---

## Technical Details

### Email Fetching Strategy
1. Admin makes request with session cookie
2. Backend calls Onyx API `/manage/users` endpoint with admin session
3. Response is parsed and mapped (user_id → email)
4. Map is used to populate email fields in response
5. Falls back to showing user_id if email not found

### API Endpoints Updated
- `GET /api/custom/admin/entitlements` - Now returns real emails
- `GET /api/custom/admin/features/users` - Now returns real emails

### Frontend Components Updated
- `EntitlementsTab.tsx` - Already displays `user_email` field (no changes needed)
- `FeaturesTab.tsx` - Already displays `user_email` field (no changes needed)
- `SmartDriveConnectors.tsx` - Removed refresh button from progress bars

---

## Testing

After these changes:

1. **Entitlements Tab:**
   - Should display actual user email addresses
   - Falls back to user ID if email fetch fails
   
2. **Features Tab:**
   - Should display actual user email addresses
   - Consistent with entitlements display

3. **SmartDrive Progress Bars:**
   - No longer shows refresh button
   - Still updates automatically on connector/file changes

---

## Error Handling

Both endpoints include proper error handling:
- Logs warnings if email fetch fails
- Falls back to user_id display
- Does not block main functionality if Onyx API is unavailable

---

## Performance Considerations

- Email fetching adds one additional API call per admin request
- Uses 15-second timeout for Onyx API calls
- Emails are fetched in bulk (one call for all users)
- Map lookup is O(1) for each user

---

## Date
October 8, 2025
