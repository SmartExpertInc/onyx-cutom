# Admin Credits Tab - Email Display Implementation

## Summary
Implemented comprehensive email display for all users (including Google OAuth users) in the Admin Credits tab with intelligent fallback logic.

## Problem
Previously, users who registered via Google OAuth displayed as "User" instead of showing their email address, making it difficult to identify them in the admin panel.

## Solution

### Backend Changes (`custom_extensions/backend/main.py`)

#### 1. Extended `UserCredits` Model
```python
class UserCredits(BaseModel):
    id: int
    onyx_user_id: str
    name: str
    # New fields
    email: Optional[str] = None
    display_identity: Optional[str] = None
    credits_balance: int
    total_credits_used: int
    credits_purchased: int
    last_purchase_date: Optional[datetime]
    subscription_tier: str
    created_at: datetime
    updated_at: datetime
```

#### 2. Enhanced `/admin/credits/users` Endpoint
- Fetches user emails from Onyx API (`/manage/users`) using admin session cookie
- Falls back to `user_email_cache` table for cached emails
- Computes `display_identity` with intelligent fallback:
  1. **Email** (primary - from Onyx API or cache)
  2. **Name** (if not "User")
  3. **onyx_user_id** (last resort)

```python
# Email resolution priority
resolved_email = user_emails_map.get(d["onyx_user_id"], d.get("cached_email"))

# Display identity computation
display_identity = (
    resolved_email
    or (name_val if name_val and name_val.lower() != "user" else None)
    or d["onyx_user_id"]
)
```

### Frontend Changes

#### 1. `CreditsAdministrationTable.tsx`
- Added `email` and `display_identity` to `UserCredits` interface
- Updated table to show:
  - **Primary text**: Display identity (email/name/ID)
  - **Secondary text**: Email address in smaller gray text below

```typescript
<Typography variant="body2" fontWeight="medium">
  {user.display_identity || user.email || (user.name && user.name !== 'User' ? user.name : user.onyx_user_id)}
</Typography>
{user.email && (
  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
    {user.email}
  </Typography>
)}
```

- Enhanced profile modal to show email in header

#### 2. `CreditsTab.tsx`
- Added client-side safety fallback for `display_identity` computation
- Extended search functionality to match:
  - Display identity
  - Email
  - Name
  - User ID

```typescript
const matchesSearch = (user.display_identity || '').toLowerCase().includes(term) ||
  (user.email || '').toLowerCase().includes(term) ||
  user.name.toLowerCase().includes(term) ||
  user.onyx_user_id.toLowerCase().includes(term);
```

## Data Flow

1. **Admin opens Credits tab** → Frontend fetches `/admin/credits/users`
2. **Backend receives request** → Authenticates admin via session cookie
3. **Email resolution**:
   - Calls Onyx API `/manage/users` with admin cookie
   - Parses response to map `user_id` → `email`
   - Falls back to `user_email_cache` table
4. **Display computation**:
   - Prioritizes email over generic names
   - Ensures Google OAuth users show email
5. **Frontend displays**:
   - Primary line: Best available identifier
   - Secondary line: Email (if available)

## Google OAuth Integration

Google OAuth users are guaranteed to have emails because:
- OAuth scopes include `["openid", "email", "profile"]`
- `associate_by_email=True` in OAuth router
- Email stored in Onyx `User` model
- Email returned by `/manage/users` endpoint

## Benefits

1. **Clear user identification**: Google OAuth users show email instead of "User"
2. **Flexible search**: Find users by email, name, or ID
3. **Graceful fallback**: Works even if Onyx API is unavailable (uses cache)
4. **Future-proof**: Client-side fallback ensures display even with older backend

## Testing

Test with:
1. **Local user** (email + name): Shows name, email below
2. **Google OAuth user**: Shows email as primary, email below
3. **User without email/name**: Shows user ID
4. **Search**: Type email/name/ID to filter

## Files Modified

- `custom_extensions/backend/main.py` - Backend logic
- `custom_extensions/frontend/src/components/CreditsAdministrationTable.tsx` - Table display
- `custom_extensions/frontend/src/app/admin/main/components/CreditsTab.tsx` - Search & data loading

## Onyx API Integration

The implementation leverages Onyx's existing user management:
- **Endpoint**: `GET /manage/users`
- **Authentication**: Admin session cookie
- **Response**: List of users with `id`, `email`, `role`, etc.
- **Permission**: Requires curator or admin role

This ensures emails are always fresh and accurate from the authoritative source.

