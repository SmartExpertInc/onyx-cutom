# Entitlements Slides Options Fix

## Problem
The slides dropdown in the generate page was showing only up to 15 slides for all users, regardless of their entitlements. Users with Pro/Business plans should see options for 25, 30, 35, and 40 slides.

## Solution

### Backend (Already Implemented)
The backend endpoint `/api/custom/entitlements/me` returns a `slides_options` array based on user's plan:
- Starter: `[20]`
- Pro/Business or users with `slides_max > 20`: `[25, 30, 35, 40]`

This is computed in `_fetch_effective_entitlements()`:
```python
if result["slides_max"] > 20 or plan in ("pro", "business"):
    result["slides_options"] = [25, 30, 35, 40]
else:
    result["slides_options"] = [20]
```

### Frontend Updates

**File:** `custom_extensions/frontend/src/app/create/generate/page.tsx`

#### 1. Added Entitlements State
```typescript
const [slidesOptions, setSlidesOptions] = useState<number[]>([5,6,7,8,9,10,12,15]);
const [entitlements, setEntitlements] = useState<any | null>(null);
```

#### 2. Added Entitlements Fetch on Component Mount
```typescript
useEffect(() => {
  const loadEntitlements = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const res = await fetch(`${backendUrl}/entitlements/me`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setEntitlements(data);
      
      // If user has extended slides options (25-40), expose them in presentation UI
      const opts = Array.isArray(data?.slides_options) && data.slides_options.length > 0
        ? data.slides_options
        : (data?.slides_max > 20 ? [25, 30, 35, 40] : [20]);
      setSlidesOptions(opts);
    } catch {}
  };
  loadEntitlements();
}, []);
```

#### 3. Updated All Slides Dropdowns

Updated **three** locations where slides dropdowns appear:

**Location 1:** Presentation - When lesson is selected from existing outline (Line ~1429)
```typescript
options={(slidesOptions || [20]).map((n) => ({ value: n.toString(), label: `${n} ${t('interface.generate.slides', 'slides')}` }))}
```

**Location 2:** Presentation - Standalone mode (Line ~1456)
```typescript
options={(slidesOptions || [20]).map((n) => ({ value: n.toString(), label: `${n} ${t('interface.generate.slides', 'slides')}` }))}
```

**Location 3:** Video Lesson (Line ~1811)
```typescript
options={(slidesOptions || [20]).map((n) => ({ value: n.toString(), label: `${n} ${t('interface.generate.slides', 'slides')}` }))}
```

## Benefits

1. **Pro/Business Users:** Can now create presentations with 25, 30, 35, or 40 slides
2. **Starter Users:** Continue to see standard options (5-15 slides)
3. **Consistent Behavior:** All presentation and video lesson slides dropdowns respect entitlements
4. **Fallback Protection:** If entitlements fetch fails, defaults to `[20]` to ensure UI works

## Testing

To test:
1. Log in as a Pro/Business user
2. Navigate to `/create/generate`
3. Select "Presentation" or "Video Lesson"
4. Open the "Slides" dropdown
5. Verify options include 25, 30, 35, and 40

For Starter users:
1. Log in as a Starter user
2. Navigate to `/create/generate`
3. Select "Presentation"
4. Open the "Slides" dropdown
5. Verify options are standard (5-15 slides, or default options)

## Files Modified
- `custom_extensions/frontend/src/app/create/generate/page.tsx`

## Date
October 9, 2025

