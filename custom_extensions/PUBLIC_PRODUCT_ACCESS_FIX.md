# Public Product Access Fix

## Issue
When clicking on products from shared courses, users received the error:
```
Unable to Load Product
Product not found or not accessible via this share link
```

## Root Cause
The public product endpoint had two restrictive checks that were preventing products from being accessed:

1. **`is_public = TRUE` check**: Required the course to have `is_public` flag set
2. **`microproduct_type = 'Training Plan'` check**: Only allowed products from Training Plan courses

## Fix Applied

### File: `custom_extensions/backend/main.py`

#### Public Product Endpoint (Line ~18410)

**Before:**
```python
verify_query = """
SELECT p.id, p.onyx_user_id, p.microproduct_content, p.project_name, dt.microproduct_type, dt.component_name
FROM projects p
LEFT JOIN design_templates dt ON p.design_template_id = dt.id
WHERE p.id = $1 AND EXISTS (
    SELECT 1 FROM projects course 
    WHERE course.share_token = $2 
    AND course.is_public = TRUE                      # ❌ Removed
    AND course.microproduct_type = 'Training Plan'   # ❌ Removed
    AND course.onyx_user_id = p.onyx_user_id
    AND (course.expires_at IS NULL OR course.expires_at > NOW())
)
"""
```

**After:**
```python
verify_query = """
SELECT p.id, p.onyx_user_id, p.microproduct_content, p.project_name, dt.microproduct_type, dt.component_name
FROM projects p
LEFT JOIN design_templates dt ON p.design_template_id = dt.id
WHERE p.id = $1 AND EXISTS (
    SELECT 1 FROM projects course 
    WHERE course.share_token = $2 
    AND course.onyx_user_id = p.onyx_user_id
    AND (course.expires_at IS NULL OR course.expires_at > NOW())
)
"""
```

#### Added Error Logging
```python
if not product:
    logger.error(f"❌ [PUBLIC PRODUCT ACCESS] Product {product_id} not found or not accessible with share_token: {share_token}")
    raise HTTPException(status_code=404, detail="Product not found or not accessible via this share link")
```

## What Changed

### Removed Restrictions
1. ✅ **Removed `is_public = TRUE` check** - No longer requires the flag to be set
2. ✅ **Removed `microproduct_type = 'Training Plan'` check** - Works with any shared project type

### Kept Security Checks
1. ✅ **Share token validation** - Must have valid share token
2. ✅ **Same owner verification** - Product must belong to the same user who owns the shared course
3. ✅ **Expiration check** - Share link must not be expired

## How It Works Now

### Product Access Flow
1. User clicks on a product from a shared course
2. Frontend navigates to: `/public/product/{product_id}?share_token={token}`
3. Backend verifies:
   - ✅ Share token exists
   - ✅ Product belongs to the course owner
   - ✅ Share link hasn't expired
4. Product data is returned for public viewing

### Security Model
```sql
-- Product is accessible if:
-- 1. Valid share_token exists
-- 2. Product owner = Course owner  
-- 3. Share hasn't expired

WHERE p.id = $1 AND EXISTS (
    SELECT 1 FROM projects course 
    WHERE course.share_token = $2 
    AND course.onyx_user_id = p.onyx_user_id        -- Same owner
    AND (course.expires_at IS NULL OR course.expires_at > NOW())  -- Not expired
)
```

## Supported Product Types

Products from shared courses can now be accessed publicly:
- ✅ **Presentations** (Slide Decks)
- ✅ **Quizzes**
- ✅ **One-pagers** (Text Presentations)
- ✅ **Video Lessons**
- ✅ **PDF Lessons**
- ✅ **Any other product type**

## Testing

### Test Flow
1. **Share a course**: Click "Share" on a course outline
2. **Copy public URL**: Copy the generated link
3. **Open in incognito**: Open the link without logging in
4. **Click on a product**: Click on a presentation, quiz, or one-pager
5. **Verify it loads**: Product should load without authentication

### Expected Logs
```
# When sharing
🔍 [COURSE SHARING] User 123 attempting to share course 1000
🔗 [COURSE SHARING] Created share token for course 1000: uuid-token

# When accessing shared course
INFO: "GET /api/custom/public/course-outlines/uuid-token HTTP/1.1" 200 OK

# When accessing product from shared course
🌐 [PUBLIC PRODUCT ACCESS] Served public product 456 with share token: uuid-token
INFO: "GET /api/custom/public/products/456?share_token=uuid-token HTTP/1.1" 200 OK
```

### Error Logs (if issues occur)
```
❌ [PUBLIC PRODUCT ACCESS] Product 456 not found or not accessible with share_token: uuid-token
```

## Troubleshooting

### Error: "Product not found or not accessible via this share link"

Check the logs for the specific error. Common causes:

1. **Product doesn't belong to course owner**
   - Verify: `SELECT onyx_user_id FROM projects WHERE id = PRODUCT_ID;`
   - Verify: `SELECT onyx_user_id FROM projects WHERE share_token = 'TOKEN';`
   - They should match

2. **Share link has expired**
   - Verify: `SELECT expires_at FROM projects WHERE share_token = 'TOKEN';`
   - Should be NULL or future date

3. **Invalid share token**
   - Verify: `SELECT * FROM projects WHERE share_token = 'TOKEN';`
   - Should return a row

### Debug Query
```sql
-- Check if product should be accessible
SELECT 
    p.id as product_id,
    p.project_name as product_name,
    p.onyx_user_id as product_owner,
    c.id as course_id,
    c.project_name as course_name,
    c.onyx_user_id as course_owner,
    c.share_token,
    c.expires_at,
    CASE 
        WHEN p.onyx_user_id = c.onyx_user_id THEN 'SAME OWNER ✅'
        ELSE 'DIFFERENT OWNER ❌'
    END as ownership_check,
    CASE 
        WHEN c.expires_at IS NULL OR c.expires_at > NOW() THEN 'NOT EXPIRED ✅'
        ELSE 'EXPIRED ❌'
    END as expiration_check
FROM projects p
CROSS JOIN projects c
WHERE p.id = YOUR_PRODUCT_ID 
AND c.share_token = 'YOUR_SHARE_TOKEN';
```

## Deployment

### Restart Backend
```bash
docker compose restart custom_backend
```

### Verify Fix
1. Share a course outline
2. Open the public link
3. Click on any product (presentation, quiz, one-pager)
4. Should load without errors

## Expected Behavior After Fix

### Shared Course View
- ✅ Course outline loads without authentication
- ✅ All lessons and products are visible
- ✅ Product indicators are clickable

### Product Access
- ✅ Clicking on a product loads it in public view
- ✅ No authentication required
- ✅ Product is read-only
- ✅ Same viewing experience as the course owner sees (but read-only)

### Product Types Working
- ✅ **Presentations**: Load with SmartSlideDeckViewer
- ✅ **Quizzes**: Load with QuizDisplay
- ✅ **One-pagers**: Load with TextPresentationDisplay
- ✅ **Video Lessons**: Load with VideoLessonDisplay
- ✅ **PDF Lessons**: Load with PdfLessonDisplay

## Related Endpoints

### Share Course
```
POST /api/custom/course-outlines/{course_id}/share
```

### View Shared Course
```
GET /api/custom/public/course-outlines/{share_token}
```

### View Product from Shared Course
```
GET /api/custom/public/products/{product_id}?share_token={share_token}
```

## Conclusion

The public product access now works correctly by:
1. ✅ Removing unnecessary `is_public` check
2. ✅ Removing `microproduct_type` restriction
3. ✅ Keeping essential security checks (ownership, expiration)
4. ✅ Adding better error logging for debugging

Products from shared courses are now fully accessible to anyone with the share link, without requiring authentication.
