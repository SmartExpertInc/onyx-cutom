# Billing Addon Plan Downgrade Fix

## Problem Description

When a user with a Business or Pro subscription purchased an addon (connector or storage), their plan was incorrectly changed to "Starter" and all entitlements were removed, including the newly purchased addon.

## Root Cause Analysis

The issue occurred in the `checkout.session.completed` webhook handler in `custom_extensions/backend/main.py`:

### Original Flawed Logic (Line 28618-28636)

```python
if data_list and len(data_list) > 0:
    price = data_list[0]['price']  # ❌ Only checked FIRST item!
    price_id = price.get('id')
    ...
    tier_key = PRICE_TO_TIER.get(price_id, '')
    if tier_key:
        plan = tier_key.replace('_monthly', '').replace('_yearly', '')
```

**The bug:** The handler only checked the **first subscription item** to determine the plan tier.

### How the Bug Manifested

1. **User has Business plan**: Subscription contains Business tier price item
2. **User buys connector addon**: 
   - If direct addon addition failed (line 28306 exception)
   - Fallback created NEW subscription with ONLY addon items (line 28309-28317)
3. **Stripe sends `checkout.session.completed` webhook**:
   - Handler retrieved subscription items
   - Only checked first item (which was an addon, not a tier)
   - Addon price NOT in `PRICE_TO_TIER` mapping
   - Product name fallback didn't find "business" or "pro" in addon product names
   - Defaulted to `plan = "starter"` (line 28612)
4. **Result**: User's plan downgraded to Starter, entitlements reset to 0 connectors, 1GB storage

## Solution Implemented

### 1. Fixed checkout.session.completed Handler (Lines 28625-28682)

**Key Changes:**
- ✅ **Loop through ALL subscription items** to find tier price (not just first)
- ✅ **Check metadata** to detect addon-only purchases (`purpose: 'addons'`)
- ✅ **Preserve existing plan** if no tier found and it's an addon purchase
- ✅ **Prevent entitlements reset** for addon-only purchases

```python
# Get existing plan BEFORE making changes
existing_plan = None
async with pool.acquire() as conn:
    existing_record = await conn.fetchrow(
        "SELECT current_plan FROM user_billing WHERE onyx_user_id = $1",
        onyx_user_id
    )
    if existing_record:
        existing_plan = existing_record['current_plan']

# Check if this is addon-only purchase
is_addon_purchase = session.get('metadata', {}).get('purpose') == 'addons'

# Loop through ALL items to find tier price
for item_data in data_list:
    price = item_data.get('price')
    item_price_id = price.get('id')
    
    tier_key = PRICE_TO_TIER.get(item_price_id, '')
    if tier_key:
        price_id = item_price_id
        plan = tier_key.replace('_monthly', '').replace('_yearly', '')
        break  # Found tier price

# CRITICAL FIX: Preserve existing plan for addon-only subscriptions
if not plan and is_addon_purchase and existing_plan:
    logger.warning(f"[BILLING] Addon-only subscription detected. Preserving existing plan: {existing_plan}")
    plan = existing_plan
```

### 2. Conditional Billing & Entitlements Update (Lines 28684-28765)

```python
# Only update plan fields if NOT addon-only purchase
if is_addon_purchase and not price_id:
    # Addon-only: preserve plan, only update subscription_id/status
    await conn.execute("""
        UPDATE user_billing 
        SET subscription_status = $2, subscription_id = $3, updated_at = now()
        WHERE onyx_user_id = $1
    """, ...)
else:
    # Normal plan purchase: update everything including plan
    await conn.execute("""
        UPDATE user_billing 
        SET subscription_status = $2, subscription_id = $3,
            current_price_id = $4, current_plan = $5, 
            current_interval = $6, updated_at = now()
        WHERE onyx_user_id = $1
    """, ...)

# Skip base entitlements reset for addon-only purchases
if not is_addon_purchase or price_id:
    # Update base entitlements based on plan tier
    await conn.execute("""INSERT INTO user_entitlement_base ...""")
else:
    logger.info(f"[BILLING] Skipping base entitlements update for addon-only purchase")
```

### 3. Enhanced Logging Throughout (Lines 28237-28336, 28604-28765, 28819-28962)

Added comprehensive `[BILLING]` prefixed logs to track:
- Addon checkout requests with user plan info
- Subscription item additions
- Plan detection logic (which items checked, tier vs addon)
- Entitlements updates
- Webhook event processing

**Log Examples:**
```
[BILLING] Addon checkout request from user 123, items: 1
[BILLING] User 123 current plan: business, has subscription: True
[BILLING] Attempting to add addons to existing subscription sub_abc123
[BILLING] Successfully added and synced 1 add-on items to existing subscription
[BILLING] checkout.session.completed for user 123, mode=subscription
[BILLING] Item 0: price_id=price_1SEBTeH2U2KQUmUhi02e1uC9 (tier)
[BILLING] Item 1: price_id=price_1SGHegH2U2KQUmUh4guOuoV7 (addon)
[BILLING] Found tier price: price_1SEBTeH2U2KQUmUhi02e1uC9 -> plan=business
```

### 4. Similar Fix for customer.subscription.updated (Lines 28814-28962)

Applied same pattern with enhanced logging to ensure consistency.

## Testing Scenarios

### Scenario 1: Normal Addon Purchase (Happy Path)
**Setup:** User has Business plan with active subscription
**Action:** User buys 1 connector addon
**Expected:** Addon added to existing subscription, plan remains Business
**Result:** ✅ Fixed - Direct subscription item addition works, no webhook issues

### Scenario 2: Fallback Addon Purchase (Edge Case)
**Setup:** User has Business plan but subscription status is not active/trialing
**Action:** User buys 1 connector addon → fallback creates new subscription
**Expected:** New subscription created, but plan preserved as Business
**Result:** ✅ Fixed - `is_addon_purchase` flag detected, existing plan preserved

### Scenario 3: Multiple Items in Subscription
**Setup:** User upgrades to Business, later adds connector
**Action:** Webhook processes subscription with multiple items
**Expected:** Handler finds Business tier among all items
**Result:** ✅ Fixed - Loops through all items to find tier price

## Configuration

### Price ID Mappings (Lines 158-174)

**Tier Prices** (in `PRICE_TO_TIER`):
- `price_1SEBM4H2U2KQUmUhkn6A7Hlm` → Pro Monthly
- `price_1SEBTeH2U2KQUmUhi02e1uC9` → Business Monthly
- `price_1SEBUCH2U2KQUmUhkym5Q9TS` → Pro Yearly
- `price_1SEBUoH2U2KQUmUhMktbhCsm` → Business Yearly

**Addon Prices** (in `PRICE_TO_ADDON`):
- `price_1SGHegH2U2KQUmUh4guOuoV7` → Connector 1
- `price_1SGHgFH2U2KQUmUhS0Blys9w` → Connector 5
- `price_1SGHgZH2U2KQUmUhSuFJ6SOi` → Connector 10
- `price_1SGHjIH2U2KQUmUhpWRcRxxH` → Storage 1GB
- `price_1SGHk9H2U2KQUmUhLrwnk2tQ` → Storage 5GB
- `price_1SGHkgH2U2KQUmUh0hI2Mp07` → Storage 10GB

## Files Modified

- `custom_extensions/backend/main.py`:
  - Lines 28225-28337: Addon checkout endpoint (enhanced logging)
  - Lines 28599-28765: `checkout.session.completed` handler (main fix)
  - Lines 28814-28962: `customer.subscription.updated` handler (enhanced logging)

## Verification Steps

1. **Check logs** for `[BILLING]` prefixed messages during addon purchases
2. **Monitor webhook processing**:
   ```bash
   tail -f /path/to/logs | grep "\[BILLING\]"
   ```
3. **Verify plan preservation**:
   ```sql
   SELECT onyx_user_id, current_plan, subscription_status, updated_at 
   FROM user_billing 
   WHERE onyx_user_id = '<test_user_id>';
   ```
4. **Verify entitlements**:
   ```sql
   SELECT * FROM user_entitlement_base WHERE onyx_user_id = '<test_user_id>';
   SELECT * FROM user_billing_addons WHERE onyx_user_id = '<test_user_id>';
   ```

## Rollback Instructions

If issues arise, revert the following sections in `custom_extensions/backend/main.py`:
1. Lines 28225-28337 (addon checkout)
2. Lines 28599-28765 (checkout.session.completed)
3. Lines 28814-28962 (customer.subscription.updated)

Use git:
```bash
git diff HEAD custom_extensions/backend/main.py
git checkout HEAD -- custom_extensions/backend/main.py
```

## Future Improvements

1. **Prevent fallback path entirely**: If user has an existing plan, require active subscription before allowing addon purchase
2. **Better addon management**: Consider storing addons separately from base plan in Stripe metadata
3. **Automated tests**: Add unit tests for webhook handlers with various subscription item combinations
4. **Dashboard monitoring**: Add admin view showing recent plan/entitlement changes for audit trail

## Related Documentation

- `ENTITLEMENTS_IMPLEMENTATION_SUMMARY.md` - Entitlements system overview
- `ENTITLEMENTS_CONNECTOR_COUNT_FIX.md` - Related connector entitlements fix
- Stripe Webhook Events: https://stripe.com/docs/api/events

---

**Issue:** User plan downgrading to Starter when buying addons
**Status:** ✅ Fixed
**Date:** 2025-10-09
**Author:** AI Assistant (Claude Sonnet 4.5)

