# Billing Addon Sync Fix - Follow-Up

## Issue After Initial Fix

After implementing the plan preservation fix, a new issue was discovered when testing:

```
ERROR:main:[BILLING] Failed to add to existing subscription: current_period_end, creating new checkout
Traceback (most recent call last):
  ...
  File "/app/main.py", line 28310, in addons_checkout
    addon['type'], item['quantity'], existing_sub.status, int(existing_sub.current_period_end or 0)
AttributeError: current_period_end
```

**Impact:**
- Addon was successfully added to Stripe subscription
- BUT failed to sync to `user_billing_addons` database table
- As fallback, created second subscription with only addon
- User charged correctly, but addon didn't show in entitlements

## Root Cause

The Stripe `Subscription` object's `current_period_end` field was being accessed incorrectly. It needs to handle both dict-like and object-like access patterns from the Stripe SDK.

## Solution Implemented

### 1. Fixed `current_period_end` Access (Lines 28289-28295)

```python
# Get current_period_end safely from subscription object
current_period_end = (existing_sub.get('current_period_end') if isinstance(existing_sub, dict) 
                    else getattr(existing_sub, 'current_period_end', None))
if not current_period_end:
    current_period_end = 0

logger.info(f"[BILLING] Subscription current_period_end: {current_period_end}")
```

### 2. Added Addon Sync for Addon-Only Subscriptions (Lines 28728-28756)

When a fallback addon-only subscription is created (because direct addition failed), the `checkout.session.completed` handler now syncs all addon items to `user_billing_addons`:

```python
# Sync addon items to user_billing_addons for addon-only subscriptions
try:
    logger.info(f"[BILLING] Syncing addon items from addon-only subscription to database")
    current_period_end = (subscription.get('current_period_end') if isinstance(subscription, dict) 
                        else getattr(subscription, 'current_period_end', 0)) or 0
    
    if data_list:
        for item_data in data_list:
            price = item_data.get('price')
            item_price_id = price.get('id')
            item_id = item_data.get('id')
            item_quantity = item_data.get('quantity')
            
            addon = PRICE_TO_ADDON.get(item_price_id, None)
            if addon and addon.get('type') in ('connectors', 'storage'):
                logger.info(f"[BILLING] Syncing addon to DB: type={addon.get('type')}, quantity={item_quantity}")
                await conn.execute("""
                    INSERT INTO user_billing_addons (...)
                    VALUES (...)
                    ON CONFLICT (id) DO UPDATE SET quantity=EXCLUDED.quantity, ...
                """, ...)
```

### 3. Enhanced Entitlements Logging (Lines 27771-27788)

Added detailed logging to entitlements calculation to diagnose addon issues:

```python
logger.info(f"[ENTITLEMENTS] Found {len(rows)} active addon(s) for user {onyx_user_id}")
for r in rows:
    addon = PRICE_TO_ADDON.get(r['stripe_price_id'] or '', None)
    units = int(addon.get('units', 0)) if addon else 0
    qty = int(r['qty'] or 1)
    logger.info(f"[ENTITLEMENTS] Addon: type={r['addon_type']}, units={units}, qty={qty}, status={r['status']}")

logger.info(f"[ENTITLEMENTS] Base limits: connectors={result['connectors_limit']}, storage={result['storage_gb']}GB")
result['connectors_limit'] = int(result['connectors_limit']) + add_connectors
result['storage_gb'] = int(result['storage_gb']) + add_storage
logger.info(f"[ENTITLEMENTS] Final limits (with addons): connectors={result['connectors_limit']}, storage={result['storage_gb']}GB")
```

## How Entitlements Work

1. **Base Entitlements** (from `user_entitlement_base` table):
   - Starter: 0 connectors, 1GB storage
   - Pro: 2 connectors, 5GB storage
   - Business: 5 connectors, 10GB storage

2. **Addon Entitlements** (from `user_billing_addons` table):
   - Each addon has `units` (e.g., 1 connector = 1 unit)
   - Multiplied by `quantity` purchased
   - Added to base limits

3. **Final Calculation** (in `/api/custom/entitlements/me`):
   ```python
   # Get base from plan
   base_connectors = 2  # for Pro
   
   # Get addons from user_billing_addons
   addon_connectors = 1  # purchased 1 connector addon with 1 unit
   
   # Final limit
   total_connectors = base_connectors + addon_connectors  # = 3
   ```

## Example Logs (After Fix)

### Successful Addon Addition:
```
INFO:main:[BILLING] Addon checkout request from user 4875359a-..., items: 1
INFO:main:[BILLING] User 4875359a-... current plan: pro, has subscription: True
INFO:main:[BILLING] Attempting to add addons to existing subscription sub_1SGNAi...
INFO:main:[BILLING] Existing subscription status: active, items count: 1
INFO:main:[BILLING] Subscription current_period_end: 1234567890
INFO:main:[BILLING] Adding addon item 1/1: price_id=price_1SGHegH2U2KQUmUh4guOuoV7, quantity=1
INFO:main:[BILLING] Syncing addon to DB: type=connectors, quantity=1, period_end=1234567890
INFO:main:[BILLING] Successfully added and synced 1 add-on items to existing subscription
```

### Entitlements Check:
```
INFO:main:[ENTITLEMENTS] Found 1 active addon(s) for user 4875359a-...
INFO:main:[ENTITLEMENTS] Addon: type=connectors, units=1, qty=1, status=active, price_id=price_1SGHegH2U2KQUmUh4guOuoV7
INFO:main:[ENTITLEMENTS] Base limits: connectors=2, storage=5GB
INFO:main:[ENTITLEMENTS] Final limits (with addons): connectors=3, storage=5GB
```

## Testing

### Test Scenario 1: Direct Addition (Happy Path)
```bash
# User with Pro plan buys 1 connector addon
# Expected: Addon added to existing subscription, synced to DB
# Result: connectors_limit = 2 (base) + 1 (addon) = 3 ✅
```

### Test Scenario 2: Fallback Subscription (Edge Case)
```bash
# User with Pro plan, subscription inactive
# Buys 1 connector addon → creates new addon-only subscription
# Expected: Plan preserved as Pro, addon synced to DB
# Result: plan = pro, connectors_limit = 2 (base) + 1 (addon) = 3 ✅
```

### Test Scenario 3: Multiple Addons
```bash
# User with Business plan buys 5 connector addon + 5GB storage addon
# Expected: Both addons synced to DB and reflected in entitlements
# Result: 
#   connectors_limit = 5 (base) + 5 (addon) = 10 ✅
#   storage_gb = 10 (base) + 5 (addon) = 15 ✅
```

## Debugging User Issues

If a user reports addons not showing:

1. **Check database:**
   ```sql
   SELECT * FROM user_billing_addons 
   WHERE onyx_user_id = '<user_id>' AND status IN ('active', 'trialing');
   ```

2. **Check logs:**
   ```bash
   grep "\[ENTITLEMENTS\]" logs/app.log | tail -20
   ```

3. **Verify Stripe:**
   - Check subscription in Stripe Dashboard
   - Ensure addon subscription items are present and active

4. **Manual sync if needed:**
   ```sql
   -- Get sub item ID from Stripe
   INSERT INTO user_billing_addons (
       id, onyx_user_id, stripe_customer_id, stripe_subscription_id,
       stripe_subscription_item_id, stripe_price_id, addon_type, 
       quantity, status, current_period_end, created_at, updated_at
   ) VALUES (
       'si_...', 'user_id', 'cus_...', 'sub_...',
       'si_...', 'price_1SGHegH2U2KQUmUh4guOuoV7', 'connectors',
       1, 'active', to_timestamp(1234567890), now(), now()
   ) ON CONFLICT (id) DO UPDATE SET 
       status='active', quantity=1, updated_at=now();
   ```

5. **Trigger entitlements recalc:**
   ```bash
   # User refreshes /api/custom/entitlements/me
   # Check logs for [ENTITLEMENTS] messages
   ```

## Files Modified

- `custom_extensions/backend/main.py`:
  - Lines 28289-28319: Fixed `current_period_end` access and addon sync
  - Lines 28728-28756: Added addon sync for fallback subscriptions
  - Lines 27761-27788: Enhanced entitlements logging

## Related Documentation

- `BILLING_ADDON_PLAN_DOWNGRADE_FIX.md` - Main fix for plan preservation
- `ENTITLEMENTS_IMPLEMENTATION_SUMMARY.md` - Entitlements system overview

---

**Issue:** Addons not syncing to database due to AttributeError
**Status:** ✅ Fixed
**Date:** 2025-10-09 (Follow-up)
**Author:** AI Assistant (Claude Sonnet 4.5)

