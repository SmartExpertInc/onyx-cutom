# Generate Button & SmartDrive Connector Fixes

## 🐛 **Issues Identified**

### Issue 1: Generate Button Not Working When Using Connectors
**Problem**: When users select connectors and go to the generate page, the generate button doesn't appear and clicking doesn't work.

**Root Cause**: The generate button visibility condition didn't include `isFromConnectors` - it only checked for `isFromFiles`, `isFromText`, `isFromKnowledgeBase`, etc.

### Issue 2: SmartDrive Tab Not Showing Connectors for Non-Admin Users
**Problem**: Non-admin users see empty SmartDrive tab with no connectors, even though they can see connectors on the "Create From Specific Files" page.

**Root Cause**: The SmartDrive component was using `/api/manage/admin/connector/indexing-status` endpoint which requires admin/curator privileges, instead of the `/api/manage/admin/connector/status` endpoint which allows all authenticated users.

## ✅ **Fixes Applied**

### Fix 1: Updated Generate Button Visibility Logic

**File**: `custom_extensions/frontend/src/app/create/generate/page.tsx`

**Changes**:
1. **Added `isFromConnectors` to all product type conditions** (Lines 1894-1901):
   ```javascript
   // Before
   (activeProduct === "Course Outline" && (prompt.trim() || isFromFiles || isFromText || isFromKnowledgeBase))
   
   // After
   (activeProduct === "Course Outline" && (prompt.trim() || isFromFiles || isFromText || isFromKnowledgeBase || isFromConnectors))
   ```

2. **Added connector subtitle** (Line 1041):
   ```javascript
   isFromConnectors ? t('interface.generate.subtitleFromConnectors', 'Create content from your selected connectors') :
   ```

3. **Added connector context indicator** (Lines 1110-1134):
   ```jsx
   {/* Connector context indicator */}
   {isFromConnectors && connectorContext && (
     <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-6 shadow-sm">
       <div className="flex items-center gap-3 mb-3">
         <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
           <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2-2 2m-2 8l2 2-2 2" />
           </svg>
         </div>
         <div>
           <h3 className="text-lg font-semibold text-purple-900">
             {t('interface.generate.creatingFromConnectors', 'Creating from Selected Connectors')}
           </h3>
           <p className="text-sm text-purple-700 mt-1">
             {t('interface.generate.aiWillUseConnectorData', 'The AI will use data from your selected connectors to create educational content.')}
           </p>
         </div>
       </div>
       <div className="flex flex-wrap gap-2">
         {connectorContext.connectorSources.map((source, index) => (
           <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
             {source}
           </span>
         ))}
       </div>
     </div>
   )}
   ```

### Fix 2: Updated SmartDrive Connector Data Source

**File**: `custom_extensions/frontend/src/components/SmartDrive/SmartDriveConnectors.tsx`

**Changes**:
1. **Changed API endpoint** (Line 373):
   ```javascript
   // Before
   const connectorsResponse = await fetch('/api/manage/admin/connector/indexing-status', { 
     credentials: 'same-origin' 
   });
   
   // After
   const connectorsResponse = await fetch('/api/manage/admin/connector/status', { 
     credentials: 'same-origin' 
   });
   ```

2. **Updated data mapping** to match the status endpoint structure (Lines 409-418):
   ```javascript
   const userConnectors = smartDriveConnectors.map((connectorStatus: any) => ({
     id: connectorStatus.cc_pair_id,
     name: connectorStatus.name || `Connector ${connectorStatus.cc_pair_id}`,
     source: connectorStatus.connector.source,
     status: connectorStatus.connector.status || 'unknown', // Use simple status
     last_sync_at: connectorStatus.last_sync_at,
     total_docs_indexed: connectorStatus.total_docs_indexed || 0,
     last_error: connectorStatus.last_error,
     access_type: connectorStatus.access_type || 'unknown',
   }));
   ```

3. **Simplified filtering logic** (Lines 403-406):
   ```javascript
   // Before: Complex status logic with DELETING checks
   const smartDriveConnectors = allConnectorStatuses.filter((connectorStatus: any) => {
     const actualStatus = getActualConnectorStatus(connectorStatus);
     return connectorStatus.access_type === 'private' && actualStatus !== 'DELETING';
   });
   
   // After: Simple private access filter
   const smartDriveConnectors = allConnectorStatuses.filter((connectorStatus: any) => {
     return connectorStatus.access_type === 'private';
   });
   ```

## 🔄 **How the Fixes Work**

### Generate Button Fix
1. **Connector Detection**: When users come from connector selection, `isFromConnectors` is true
2. **Button Visibility**: Generate button now appears when `isFromConnectors` is true (even without a prompt)
3. **Visual Feedback**: Users see a purple connector context indicator showing selected sources
4. **Click Handling**: Generate button now properly responds to clicks and navigates to product creation

### SmartDrive Connector Fix
1. **Unified API**: Both SmartDrive and "Create From Specific Files" now use the same endpoint
2. **Consistent Permissions**: All authenticated users can see their connectors (not just admins)
3. **Data Consistency**: Both components use the same data structure and filtering logic
4. **User Isolation**: Users only see their own private connectors

## 🧪 **Testing the Fixes**

### Test 1: Generate Button Functionality
1. Navigate to `/create/from-files/specific`
2. Select one or more connectors
3. Click "Create Content from X Selected Connectors"
4. On the generate page, verify:
   - Purple connector context indicator is visible
   - Selected connector sources are shown as badges
   - Generate button is visible and clickable
   - Clicking generate navigates to the product creation page

### Test 2: SmartDrive Connector Visibility
1. Login with a non-admin user account
2. Navigate to the SmartDrive tab
3. Verify:
   - Connectors are visible (no empty state)
   - No 403 errors in browser console
   - Same connectors visible as on "Create From Specific Files" page

## 📋 **Expected Results**

After these fixes:
- ✅ **Generate button works** when coming from connector selection
- ✅ **Visual feedback** shows selected connectors on generate page
- ✅ **Non-admin users** can see connectors in SmartDrive tab
- ✅ **Consistent behavior** between SmartDrive and "Create From Specific Files"
- ✅ **No permission errors** for authenticated users
- ✅ **Backward compatibility** maintained for all other creation methods

## 🔍 **Technical Details**

### Key Changes Summary
1. **Frontend UI Logic**: Added `isFromConnectors` conditions throughout generate page
2. **API Consistency**: Unified both components to use the same non-admin endpoint
3. **Data Mapping**: Standardized connector data structure between components
4. **Visual Enhancements**: Added connector context indicator with selected sources

### UI/UX Improvements
- **Clear Visual Feedback**: Users see exactly which connectors they selected
- **Consistent Experience**: Same connector data across all UI sections
- **Proper Button States**: Generate button appears when appropriate and responds to clicks
- **Error Elimination**: No more 403 errors for non-admin users

The fixes ensure a seamless experience for all users regardless of their role, while maintaining the existing functionality for other content creation methods. 