# Entitlements System Implementation Summary

## Overview
Implemented a complete tier-based entitlements system that enforces limits on connectors, storage, and slides per presentation based on Stripe subscription features with admin override capabilities.

## Database Schema

### Tables Created
1. **`user_entitlement_base`** - Stores base entitlements derived from Stripe subscription features
   - `connectors_limit` (INT)
   - `storage_gb` (INT)
   - `slides_max` (INT)

2. **`user_entitlement_overrides`** - Admin overrides for specific users
   - `connectors_limit` (INT, nullable)
   - `storage_gb` (INT, nullable)
   - `slides_max` (INT, nullable)

3. **`user_connectors`** - Tracks user's active connectors for quota enforcement
   - `onyx_connector_id` (INT, unique)
   - `status` (TEXT)

4. **`user_storage_usage`** - Tracks SmartDrive storage usage
   - `used_bytes` (BIGINT)

5. **`user_email_cache`** - Caches user emails for admin UI
   - `email` (TEXT)

## Tier Limits

### Starter (Free)
- Connectors: 0
- Storage: 1 GB
- Slides: 20 max

### Pro
- Connectors: 2 (via `connectors_2` Stripe feature)
- Storage: 5 GB (via `storage_5gb` Stripe feature)
- Slides: 40 max (options: 25, 30, 35, 40)

### Business
- Connectors: 5 (via `connectors_5` Stripe feature)
- Storage: 10 GB (via `storage_10gb` Stripe feature)
- Slides: 40 max (options: 25, 30, 35, 40)

## Backend Implementation

### Stripe Webhook Integration
- `checkout.session.completed` - Derives entitlements from subscription items and stores in `user_entitlement_base`
- `customer.subscription.updated` - Refreshes entitlements when subscription changes
- Caches user email from Stripe customer data

### API Endpoints

#### User Endpoints
- `GET /api/custom/entitlements/me` - Returns effective entitlements for current user

#### Admin Endpoints
- `GET /api/custom/admin/entitlements` - Lists all users with base/overrides/effective entitlements
- `POST /api/custom/admin/entitlements/{userId}` - Updates overrides for specific user

### Enforcement Points

1. **Connectors** (`custom_extensions/backend/app/api/connectors.py`)
   - Checks limit before creating connector
   - Tracks active connectors in `user_connectors` table
   - Removes from tracking on deletion

2. **Storage** (`custom_extensions/backend/app/services/smartdrive_uploader.py`)
   - Checks quota before upload
   - Updates `user_storage_usage` after successful upload
   - Raises 403 if quota exceeded

3. **Slides** (`custom_extensions/backend/main.py` - `/api/custom/presentations`)
   - Counts slides in presentation request
   - Compares against `slides_max` entitlement
   - Returns error if limit exceeded

## Frontend Implementation

### Admin UI Tab
**Location:** `custom_extensions/frontend/src/app/admin/main/components/EntitlementsTab.tsx`

**Features:**
- Displays all users with their email, plan, and entitlements
- Shows override fields (empty = use default)
- Shows effective limits (after applying overrides)
- Save button per user to update overrides
- Darker text for better readability

**Columns:**
- Email
- Plan
- Override Connectors (input)
- Override Storage (input)
- Override Slides (input)
- Effective Connectors (read-only)
- Effective Storage (read-only)
- Effective Slides (read-only)
- Save button

### Override Logic
- Empty field = `null` = use Stripe/Plan defaults
- Numeric value = override for that specific user
- Admin can give any user custom limits regardless of plan

## How It Works

### Entitlement Calculation Flow
1. Check `user_entitlement_overrides` for user-specific overrides
2. If no override, check `user_entitlement_base` for Stripe-derived limits
3. If no base, fall back to plan defaults (starter/pro/business)
4. Return effective entitlements

### Stripe Feature Metadata
Features are identified by name in Stripe product metadata:
- `connectors_2` → 2 connectors
- `connectors_5` → 5 connectors
- `storage_5gb` → 5 GB storage
- `storage_10gb` → 10 GB storage
- `unlimited_slides` → 40 slides max (Pro/Business)

## Usage

### For Users
- Limits are automatically enforced based on subscription
- Error messages shown when limits exceeded
- Upgrade prompts can be added to UI

### For Admins
1. Go to Admin Dashboard → Entitlements tab
2. Find user by email
3. Enter override values (or leave empty for defaults)
4. Click Save
5. Changes take effect immediately

## Testing

### Test Connector Limits
1. Create connectors until limit reached
2. Verify error message on next attempt
3. Admin can override to allow more

### Test Storage Limits
1. Upload files to SmartDrive
2. Monitor usage in `user_storage_usage`
3. Verify 403 error when quota exceeded

### Test Slides Limits
1. Create presentation with slides
2. Verify error if exceeding `slides_max`
3. Pro/Business users can create up to 40 slides

## Files Modified

### Backend
- `custom_extensions/backend/main.py` - DB schema, entitlements logic, admin endpoints, enforcement
- `custom_extensions/backend/app/api/connectors.py` - Connector limit enforcement
- `custom_extensions/backend/app/services/smartdrive_uploader.py` - Storage quota enforcement

### Frontend
- `custom_extensions/frontend/src/app/admin/main/page.tsx` - Added Entitlements tab
- `custom_extensions/frontend/src/app/admin/main/components/EntitlementsTab.tsx` - New admin UI component

## Future Enhancements
- Real-time storage usage display for users
- Connector count display in SmartDrive tab
- Upgrade prompts when limits reached
- Usage analytics dashboard
- Bulk override operations
- Email notifications on limit approach
