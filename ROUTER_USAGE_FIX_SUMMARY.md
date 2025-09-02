# Router Usage Fix - Generate Page Buttons

## 🐛 **Issue Identified**

### Problem: Buttons Not Clickable on Generate Page When Using Connectors
**Symptoms**: Neither "Back" nor "Generate" buttons respond to clicks when coming from connector selection. The page works fine when creating with no connectors.

**Root Cause**: JavaScript execution error due to incorrect router usage order.

## 🔍 **Technical Analysis**

### The Critical Error
In `custom_extensions/frontend/src/app/create/generate/page.tsx`:

```javascript
// ❌ WRONG: router used before declaration (line 311)
router.push(`/create/course-outline?${params.toString()}`);

// ❌ WRONG: router declared after being used (line 314)
const router = useRouter();
```

This caused a **ReferenceError** when the component tried to execute `router.push()` before `router` was defined.

### Why It Only Affected Connector Flow
1. **Normal flows** (text, files, KB) worked because they likely didn't trigger the problematic code path
2. **Connector flow** triggered the `handleCourseOutlineStart()` function which tried to use `router.push()` 
3. **JavaScript error** broke the entire page's event handling, making all buttons unclickable

## ✅ **Fix Applied**

### 1. Moved Router Declaration to Top of Component

**File**: `custom_extensions/frontend/src/app/create/generate/page.tsx`

```javascript
// ✅ CORRECT: Router declared at component start (line 121)
function GenerateProductPicker() {
  const { t } = useLanguage();
  const router = useRouter(); // ← Moved here
  const searchParams = useSearchParams();
  // ... rest of component
}
```

### 2. Removed Duplicate Router Declaration

```javascript
// ❌ REMOVED: Duplicate declaration that was after usage
// const router = useRouter();
```

### 3. Fixed useEffect Dependency Array

Also fixed a potential re-rendering issue in the connector context loading:

```javascript
// ✅ IMPROVED: Stable dependency array
}, [isFromConnectors, connectorIds.join(','), connectorSources.join(',')]);
```

## 🔄 **How React Hook Rules Apply**

### React Hook Rules
1. **Hooks must be called at the top level** of functional components
2. **Hooks must be called in the same order** every time
3. **Don't call hooks inside loops, conditions, or nested functions**

### What Went Wrong
The `useRouter()` hook was declared in the middle of the component, after other logic that tried to use its return value. This violated the proper React patterns and caused runtime errors.

## 🧪 **Testing the Fix**

### Expected Behavior After Fix
1. **Connector Selection Flow**:
   - Select connectors on `/create/from-files/specific`
   - Click "Create Content from X Selected Connectors"
   - On generate page: ✅ Back button is clickable
   - On generate page: ✅ Generate button is visible and clickable
   - Click generate: ✅ Navigates to product creation page

2. **All Other Flows**:
   - ✅ Continue to work as before
   - ✅ No regression in existing functionality

### Browser Console
- ✅ No JavaScript errors
- ✅ No "router is not defined" errors
- ✅ Clean component mounting and navigation

## 📋 **Root Cause Analysis**

### Why This Happened
1. **Code Organization**: Router hook was accidentally moved during development
2. **Testing Gap**: Issue only manifested in specific user flow (connector selection)
3. **React Hook Ordering**: Violated React's hook call order requirements

### Prevention Strategies
1. **Consistent Hook Placement**: Always declare hooks at the top of components
2. **Comprehensive Testing**: Test all user flows, not just the primary path
3. **Code Review**: Check for proper React hook usage patterns

## 🎯 **Key Takeaway**

This was a classic React development issue where **hook declaration order matters**. The fix was simple (move `useRouter()` to the top), but the impact was significant - it completely broke user interaction on the generate page for connector-based workflows.

**Lesson**: Always follow React hook rules and ensure hooks are declared before any code that uses their return values. 