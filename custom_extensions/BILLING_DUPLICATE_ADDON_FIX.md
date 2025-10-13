# Billing Duplicate Addon Fix

## Issue

When a user tried to purchase an addon (storage or connectors) that they already had in their subscription, the following happened:

1. Backend tried to create a new subscription item with the same price_id
2. Stripe rejected it with error: `"A new item with Price price_XXX can't be added to this Subscription because an existing Subscription Item si_XXX is already using that Price"`
3. System fell back to creating a new checkout session
4. User perceived the addon as "free" because they were redirected to billing page without going through Stripe checkout

**User Experience:**
- Clicked "Buy 1GB Storage"
- Already had 1GB storage in subscription
- Redirected to billing page immediately
- Storage quota appeared to increase
- Thought it was "free" (no checkout screen shown)

**Reality:**
- The fallback checkout session was created but not properly handled
- Or in test mode, it auto-completed
- User may or may not have been charged depending on webhook processing

## Root Cause

The addon checkout logic didn't check if an addon with the same price_id already existed in the user's subscription before attempting to add it. Stripe prevents duplicate price_ids in a single subscription.

## Solution Implemented

### 1. Check for Existing Addon Items (Lines 28308-28320)

Before adding an addon, build a map of existing subscription items by price_id:

```python
# Build map of existing subscription items by price_id
existing_items = existing_sub.get('items', {}).get('data', [])
existing_items_map = {}
for sub_item in existing_items:
    price = sub_item.get('price')
    price_id = price.get('id')
    item_id = sub_item.get('id')
    if price_id and item_id:
        existing_items_map[price_id] = {
            'id': item_id,
            'quantity': sub_item.get('quantity', 1)
        }

logger.info(f"[BILLING] Existing subscription items: {list(existing_items_map.keys())}")
```

### 2. Update Quantity Instead of Creating Duplicate (Lines 28331-28354)

If addon already exists, update its quantity instead of creating a new item:

```python
if item['price'] in existing_items_map:
    # Update existing item quantity
    existing_item = existing_items_map[item['price']]
    new_quantity = int(existing_item['quantity']) + int(item['quantity'])
    logger.info(f"[BILLING] Addon already exists, updating quantity from {existing_item['quantity']} to {new_quantity}")
    logger.info(f"[BILLING] NOTE: Stripe will charge prorated amount immediately")
    
    sub_item = stripe.SubscriptionItem.modify(
        existing_item['id'],
        quantity=new_quantity,
    )
    addons_updated.append(item['price'])
else:
    # Create new item
    logger.info(f"[BILLING] Adding new addon item")
    sub_item = stripe.SubscriptionItem.create(
        subscription=existing_subscription_id,
        price=item['price'],
        quantity=item['quantity'],
    )
    addons_added.append(item['price'])
```

### 3. Clear Response Message (Lines 28372-28378)

Return clear message indicating what happened and that charge is immediate:

```python
action = "updated" if addons_updated else "added"
return {
    "url": f"{base_url}/custom-projects-ui/payments?addon_{action}=true",
    "message": f"Addon(s) {action}. You will be charged prorated amount immediately.",
    "immediate_charge": True
}
```

## Important: Stripe's Prorated Charging Behavior

When you modify a subscription item (add new addon or update quantity), **Stripe charges immediately** with prorated billing:

- **Adding new addon**: Prorated charge for remaining period
- **Increasing quantity**: Prorated charge for quantity difference
- **No checkout flow needed**: Charge happens directly

This is standard Stripe behavior for subscription modifications and is documented here: https://stripe.com/docs/billing/subscriptions/prorations

### Example

User has Pro plan ($50/month) with 1GB storage addon ($5/month). Subscription renews on the 1st of each month. On the 15th (halfway through month):

1. **User buys 1GB storage again**
2. **System updates quantity** from 1 to 2
3. **Stripe charges immediately**: ~$2.50 (prorated for remaining 15 days)
4. **Next invoice**: Full $10/month for 2GB storage

## Debugging

### Check if user has existing addons:
```sql
SELECT 
    addon_type, 
    quantity, 
    status, 
    stripe_subscription_item_id,
    stripe_price_id
FROM user_billing_addons
WHERE onyx_user_id = '<user_id>' AND status IN ('active', 'trialing');
```

### Check logs for addon updates:
```bash
docker logs custom_backend-1 | grep "\[BILLING\] Addon already exists"
```

### Verify Stripe subscription items:
```bash
# In Stripe Dashboard:
# Subscriptions → [subscription_id] → Items
# Should show quantity > 1 for updated addons
```

## Expected Logs

### When addon already exists (before fix):
```
ERROR:main:[BILLING] Failed to add to existing subscription: Request req_XXX: A new item with Price price_XXX can't be added to this Subscription because an existing Subscription Item si_XXX is already using that Price
WARNING:main:[BILLING] Creating NEW subscription checkout for addons
```

### After fix - updating existing addon:
```
INFO:main:[BILLING] Existing subscription items: ['price_1SEBUCH2U2KQUmUhkym5Q9TS', 'price_1SGHjIH2U2KQUmUhpWRcRxxH']
INFO:main:[BILLING] Processing addon item 1/1: price_id=price_1SGHjIH2U2KQUmUhpWRcRxxH, quantity=1
INFO:main:[BILLING] Addon already exists (item_id=si_TCnLXOAcqLpBtG), updating quantity from 1 to 2
INFO:main:[BILLING] NOTE: Stripe will charge prorated amount immediately for quantity increase
INFO:main:[BILLING] Syncing addon to DB: type=storage, quantity=2
INFO:main:[BILLING] Successfully processed 1 add-on items: 0 added, 1 updated
```

### After fix - adding new addon:
```
INFO:main:[BILLING] Existing subscription items: ['price_1SEBUCH2U2KQUmUhkym5Q9TS']
INFO:main:[BILLING] Processing addon item 1/1: price_id=price_1SGHjIH2U2KQUmUhpWRcRxxH, quantity=1
INFO:main:[BILLING] Adding new addon item: price_id=price_1SGHjIH2U2KQUmUhpWRcRxxH, quantity=1
INFO:main:[BILLING] NOTE: Stripe will charge prorated amount immediately for new addon
INFO:main:[BILLING] Successfully processed 1 add-on items: 1 added, 0 updated
```

## Frontend Integration

The response now includes an `immediate_charge` flag. The frontend can use this to show appropriate messaging:

```typescript
const response = await fetch('/api/custom/billing/addons/checkout', {
  method: 'POST',
  body: JSON.stringify({ items: [{ sku: 'storage_1gb', quantity: 1 }] })
});

const data = await response.json();

if (data.immediate_charge) {
  // Show message: "Addon updated! You will be charged prorated amount."
  // Redirect to billing page
  window.location.href = data.url;
} else {
  // Redirect to Stripe checkout
  window.location.href = data.url;
}
```

## User Behavior Considerations

### Option 1: Allow Quantity Increases (Current Implementation)
- User can buy same addon multiple times
- Each purchase increases quantity
- Stripe charges prorated immediately
- **Pro**: Flexible, allows users to scale up anytime
- **Con**: May be confusing (no checkout screen)

### Option 2: Prevent Duplicate Purchases (Alternative)
```python
if item['price'] in existing_items_map:
    raise HTTPException(
        status_code=400, 
        detail=f"You already have this addon. Please manage it from the billing page."
    )
```
- **Pro**: Clear, prevents confusion
- **Con**: Less flexible, requires separate "manage addons" UI

### Option 3: Show Quantity Selector (Better UX)
- Frontend shows current quantity
- User can increase/decrease
- Single API call to update quantity
- **Pro**: Most intuitive
- **Con**: Requires frontend changes

## Files Modified

- `custom_extensions/backend/main.py`:
  - Lines 28293-28306: Added debug logging for `current_period_end` issue
  - Lines 28308-28320: Build map of existing subscription items
  - Lines 28323-28378: Check for duplicates, update or create, return clear message

## Related Issues

- `BILLING_ADDON_PLAN_DOWNGRADE_FIX.md` - Plan preservation fix
- `BILLING_ADDON_SYNC_FIX.md` - Addon database sync fix

## Testing

1. **Buy addon first time** (should create new item):
   ```bash
   # User has Pro plan, no storage addons
   # Buys 1GB storage
   # Expected: Stripe charges prorated, storage added
   ```

2. **Buy same addon again** (should update quantity):
   ```bash
   # User has Pro plan, 1GB storage
   # Buys 1GB storage again
   # Expected: Quantity becomes 2, Stripe charges prorated for 1GB
   ```

3. **Verify entitlements** (should reflect updated quantity):
   ```bash
   curl http://domain/api/custom/entitlements/me
   # Expected: storage_gb = base + (addon_units * quantity)
   # Pro base = 5GB, addon = 1GB, quantity = 2
   # Total = 5 + (1 * 2) = 7GB
   ```

---

**Issue:** Duplicate addon purchases failed, created confusing "free" addon experience
**Status:** ✅ Fixed
**Date:** 2025-10-09
**Author:** AI Assistant (Claude Sonnet 4.5)

