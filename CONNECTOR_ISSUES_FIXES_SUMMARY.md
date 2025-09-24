# Connector Issues - Fixes Applied

## 🐛 **Issues Identified**

### Issue 1: Generation Not Starting with Connectors
**Problem**: When users select connectors and click "Generate", nothing happens (no generation starts).

**Root Cause**: The `OutlineWizardPreview` model in the backend was missing the connector fields (`fromConnectors`, `connectorIds`, `connectorSources`), so the frontend requests were being rejected or the connector context was not being processed.

### Issue 2: Non-Admin Users Getting 403 Error
**Problem**: Non-admin users see "GET /api/manage/admin/connector/status 403 (Forbidden)" error when trying to view connectors.

**Root Cause**: The admin connector status endpoint was using `current_user` dependency which enforces role restrictions, instead of `current_chat_accessible_user` which allows broader access.

## ✅ **Fixes Applied**

### Fix 1: Added Missing Connector Fields to Backend Models

**File**: `custom_extensions/backend/main.py`

**Changes**:
1. **OutlineWizardPreview Model** (Lines 13644-13649):
   ```python
   # NEW: connector context for creation from selected connectors
   fromConnectors: Optional[bool] = None
   connectorIds: Optional[str] = None  # comma-separated connector IDs
   connectorSources: Optional[str] = None  # comma-separated connector sources
   ```

2. **TextPresentationWizardPreview Model** - Verified connector fields are present

3. **Other Models** - Verified that `LessonWizardPreview` and `QuizWizardPreview` already had connector fields

### Fix 2: Updated Connector Status Endpoint Permissions

**File**: `backend/onyx/server/documents/connector.py`

**Change** (Line 660):
```python
# Before
user: User = Depends(current_user),

# After  
user: User = Depends(current_chat_accessible_user),
```

**Impact**: This allows all authenticated users (not just admins) to access their connector status, which aligns with the existing comment: "All authenticated users can view their own connector status".

## 🔄 **How the Fixes Work**

### Backend Model Fix
1. **Frontend** sends connector data in API requests:
   ```json
   {
     "fromConnectors": true,
     "connectorIds": "1,2,3",
     "connectorSources": "slack,confluence"
   }
   ```

2. **Backend** now properly receives and validates the connector fields in the Pydantic models

3. **Hybrid Approach** detects connector context and uses `extract_connector_context_from_onyx()` function

4. **Content Generation** proceeds with filtered context from selected connectors

### Permissions Fix
1. **Non-admin users** can now access `/api/manage/admin/connector/status` without getting 403 errors

2. **Connector selection page** works for all user types (admin and non-admin)

3. **User isolation** is maintained - users only see their own connectors via `get_connector_credential_pairs_for_user()`

## 🧪 **Testing the Fixes**

### Test 1: Connector-Based Generation
1. Go to `/create/from-files/specific`
2. Select one or more connectors
3. Click "Create Content from X Selected Connectors"
4. Choose a product type on `/create/generate`
5. Verify that generation starts and uses connector context

### Test 2: Non-Admin Access
1. Login with a non-admin user account
2. Navigate to `/create/from-files/specific`
3. Verify that connectors are visible (no 403 error)
4. Check browser network tab - `/api/manage/admin/connector/status` should return 200

## 📋 **Expected Results**

After these fixes:
- ✅ **Generation works** when connectors are selected
- ✅ **Non-admin users** can see and select connectors
- ✅ **Hybrid approach** properly detects and processes connector context
- ✅ **Content generation** is filtered by selected connector sources
- ✅ **Backward compatibility** maintained for all other creation methods

## 🔍 **Technical Details**

### Data Flow
```
Frontend Selection → URL Parameters → Backend Models → Hybrid Detection → Context Extraction → Content Generation
```

### Key Components Updated
1. **Pydantic Models**: Added connector fields to preview models
2. **Authentication**: Changed from `current_user` to `current_chat_accessible_user`
3. **Hybrid Approach**: Already supported connector filtering (no changes needed)
4. **Frontend**: Already correctly implemented (no changes needed)

The fixes address the core issues while maintaining the existing architecture and ensuring all user types can access the connector-based content creation feature. 