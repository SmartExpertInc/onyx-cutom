# 🧪 Workspace Testing Guide

## Current Issues & Solutions

### ✅ **Fixes Applied**
1. **Enhanced User ID Detection** - Now tries multiple sources for user ID
2. **User Data Caching** - Caches user info from `/api/me` endpoint
3. **Comprehensive Backend Logging** - Shows owned vs shared projects
4. **Debug Tools** - Easy user switching and debugging utilities

### 🔧 **Step-by-Step Testing**

## **Step 1: Test User ID Detection**

### **A. Check Current User ID**
1. Open browser DevTools (F12)
2. Go to Workspace tab
3. Look for logs:
```javascript
🔍 [USER SERVICE] Using dev user ID from sessionStorage: your-email@example.com
// OR
🔍 [USER SERVICE] Using fallback user ID: current_user_123
```

### **B. Set Test User ID**
In browser console:
```javascript
// Set a test user
setTestUser('admin@test.com');

// Check what user is set
showCurrentUser();

// Refresh page to see changes
location.reload();
```

### **C. Try Real User from Backend**
```javascript
// Check what the backend thinks the current user is
fetch('/api/me', { credentials: 'same-origin' })
  .then(r => r.json())
  .then(user => {
    console.log('Backend user:', user);
    // Use this user ID for testing
    if (user.id || user.email) {
      setTestUser(user.id || user.email);
      location.reload();
    }
  });
```

## **Step 2: Debug Backend Workspace Access**

### **A. Check Backend Logs**
```bash
# Restart backend and watch logs
docker-compose restart custom_backend
docker-compose logs -f custom_backend | grep "WORKSPACE ACCESS"
```

Expected logs:
```
🔍 [WORKSPACE ACCESS] User admin@test.com projects query results:
   - Owned projects: 2
   - Shared projects: 1  # <- Should be > 0 if user has access
```

### **B. Run Debug Script**
```bash
# From the backend directory
cd custom_extensions/backend
python debug_workspace_access.py current_user_123

# Or test with specific user
python debug_workspace_access.py admin@test.com
```

This will show:
- ✅ Workspace memberships
- ✅ Product access records  
- ✅ Query results for each access type
- ❌ Specific issues and solutions

## **Step 3: Create Test Data**

If the debug script shows missing data, create test workspace and access:

### **A. Create Workspace & Add User**
1. Go to Workspace tab
2. Click "Create Workspace" 
3. Name: "Test Workspace"
4. Click "Add Member"
5. Email: your test user ID (e.g., `admin@test.com`)
6. Role: Admin
7. Click "Add"

### **B. Grant Project Access**
1. Go to any project (Course Outline)
2. Click "Access" button
3. Select workspace and roles/users to grant access
4. Click "Grant Access"

### **C. Test Access**
1. Set user: `setTestUser('admin@test.com')`
2. Refresh page
3. Go to Products page
4. Should see shared projects

## **Step 4: Verify Different User Roles**

### **Test Admin User**
```javascript
setTestUser('admin@test.com');
// Refresh page
// Go to Workspace tab
// Should see: "Manage Roles", "Add Member" buttons
```

### **Test Member User**
```javascript
setTestUser('member@test.com');
// Refresh page  
// Go to Workspace tab
// Should NOT see management buttons
```

### **Test Shared Project Access**
```javascript
setTestUser('user@test.com');
// Refresh page
// Go to Products page
// Should see projects user has access to
```

## **Step 5: Debug Common Issues**

### **Issue: Still using fallback user ID**

**Symptoms:**
```javascript
🔍 [USER SERVICE] Using fallback user ID: current_user_123
⚠️ [USER SERVICE] Using hardcoded fallback user ID
```

**Solutions:**
1. **Set dev user:** `setTestUser('your-email@example.com')`
2. **Check `/api/me`:** `fetch('/api/me').then(r=>r.json()).then(console.log)`
3. **Manually cache:** `localStorage.setItem('onyx_user_id', 'your-email@example.com')`

### **Issue: 0 shared projects in backend logs**

**Symptoms:**
```
🔍 [WORKSPACE ACCESS] User admin@test.com projects query results:
   - Owned projects: 1
   - Shared projects: 0  # <- Problem!
```

**Solutions:**
1. **Run debug script:** `python debug_workspace_access.py admin@test.com`
2. **Check workspace membership:** User might not be in any workspace
3. **Check product access:** No access records might exist
4. **Check user ID match:** Frontend/backend user ID mismatch

### **Issue: Admin can't manage workspace**

**Symptoms:**
```javascript
Current user role determined: {
  userId: "admin@test.com",
  roleName: "Member",  // <- Should be "Admin"
  isAdmin: false       // <- Should be true
}
```

**Solutions:**
1. **Check user's role in workspace:** Might not be Admin
2. **Case sensitivity:** Role must be exactly "Admin"
3. **Workspace membership:** User might not be workspace member

## **Step 6: Production Integration**

### **Replace Hardcoded User ID**
In `userService.ts`, replace the fallback logic with your actual auth integration:

```typescript
// Instead of:
const fallbackUserId = "current_user_123";

// Use your auth system:
const authUser = getAuthenticatedUser(); // Your auth function
const userId = authUser?.id || authUser?.email;
```

### **Integration Points**
1. **User Context:** Import from your main app's user provider
2. **Auth Cookies:** Read from authentication cookies
3. **JWT Tokens:** Decode user info from tokens
4. **Session Storage:** Use your app's user storage pattern

## **Step 7: Verification Checklist**

- [ ] User ID detection works (not using fallback)
- [ ] Backend logs show shared projects > 0
- [ ] Frontend logs show projects from API
- [ ] Admin users see management options
- [ ] Non-admin users don't see management options  
- [ ] Users with access see shared projects
- [ ] Role detection works correctly
- [ ] Test user switching works
- [ ] Debug script shows correct data

## **Quick Debug Commands**

```javascript
// In browser console:

// Check current user
showCurrentUser();

// Test different users
setTestUser('admin@test.com');
setTestUser('member@test.com');  
setTestUser('user@example.com');

// Clear test user
clearTestUser();

// Check backend user
fetch('/api/me').then(r=>r.json()).then(console.log);

// Check projects API
fetch('/api/custom-projects-backend/projects')
  .then(r=>r.json())
  .then(data => console.log('Projects:', data));

// Force user data refresh
initializeUser().then(() => location.reload());
```

## **Expected Final State**

### **✅ Working System Should Show:**

**Backend Logs:**
```
🔍 [WORKSPACE ACCESS] User admin@test.com projects query results:
   - Owned projects: 2
   - Shared projects: 3
```

**Frontend Console:**
```javascript
🔍 [USER SERVICE] Using dev user ID from sessionStorage: admin@test.com
Current user role determined: {
  userId: "admin@test.com",
  roleName: "Admin", 
  isAdmin: true
}
🔍 [PROJECTS DEBUG] Raw projects data from API: {
  totalProjects: 5,  // owned + shared
  projects: [...]
}
```

**UI Behavior:**
- ✅ Products page shows owned + shared projects
- ✅ Admin users see workspace management options
- ✅ Non-admin users see read-only workspace view
- ✅ Access modal actually grants/removes access
- ✅ User switching works for testing

---

**Status**: 🧪 **READY FOR TESTING** - Use this guide to systematically debug and fix workspace access issues 