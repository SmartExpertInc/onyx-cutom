# Course Sharing Production Fix

## Issues Identified

### Issue 1: User Permission Check
**Problem**: The original query checked `onyx_user_id` in the WHERE clause, which caused courses to not be found if there was a user ID mismatch.

**Fix**: Changed to first find the course, then check ownership separately with better error messages.

```python
# OLD (caused 404 errors)
WHERE id = $1 AND onyx_user_id = $2 AND microproduct_type = 'Training Plan'

# NEW (better error handling)
WHERE id = $1 AND (microproduct_type = 'Training Plan' OR microproduct_type ILIKE '%training%plan%')
# Then check ownership separately with 403 error
```

### Issue 2: Public Course Retrieval
**Problem**: The public endpoint required `is_public = TRUE` which might fail if the column doesn't exist or wasn't set properly.

**Fix**: Removed the strict `is_public` check and made the microproduct_type matching more lenient.

```python
# OLD (strict check)
WHERE share_token = $1 AND is_public = TRUE AND microproduct_type = 'Training Plan'

# NEW (more lenient)
WHERE share_token = $1 
AND (microproduct_type = 'Training Plan' OR microproduct_type ILIKE '%training%plan%')
```

## Changes Made

### File: `custom_extensions/backend/main.py`

#### 1. Share Endpoint (Line ~18196)
```python
# Added logging
logger.info(f"🔍 [COURSE SHARING] User {onyx_user_id} attempting to share course {course_id}")

# Changed query to be more flexible
query = """
SELECT id, project_name, microproduct_content, onyx_user_id, microproduct_type
FROM projects 
WHERE id = $1 
AND (microproduct_type = 'Training Plan' OR microproduct_type ILIKE '%training%plan%')
"""

# Separate ownership check with better error
if str(course["onyx_user_id"]) != str(onyx_user_id):
    logger.error(f"❌ [COURSE SHARING] User {onyx_user_id} does not own course {course_id} (owner: {course['onyx_user_id']})")
    raise HTTPException(status_code=403, detail="You do not have permission to share this course outline")
```

#### 2. Public Course Endpoint (Line ~18280)
```python
# Removed is_public check and made microproduct_type more lenient
query = """
SELECT id, project_name, microproduct_content, shared_at, expires_at, is_public, onyx_user_id
FROM projects 
WHERE share_token = $1 
AND (microproduct_type = 'Training Plan' OR microproduct_type ILIKE '%training%plan%')
"""

# Added error logging
if not course:
    logger.error(f"❌ [COURSE SHARING] No course found for share_token: {share_token}")
    raise HTTPException(status_code=404, detail="Shared course outline not found")
```

## Deployment Steps

### Step 1: Restart Backend Service
```bash
cd custom_extensions
python restart.py
```

Or manually:
```bash
docker compose restart custom_backend
```

### Step 2: Check Logs
```bash
docker compose logs -f custom_backend
```

Look for:
- `🔍 [COURSE SHARING] User X attempting to share course Y`
- `🔗 [COURSE SHARING] Created share token for course X: TOKEN`
- Any error messages with `❌`

### Step 3: Test the Flow

#### 3.1 Test Sharing
1. Go to products page
2. Click 3-dots menu on a course outline
3. Click "Share..."
4. Should see success modal with public URL

Expected logs:
```
🔍 [COURSE SHARING] User 123 attempting to share course 1000
🔗 [COURSE SHARING] Created share token for course 1000: cf1615a6-1a13-41de-ba06-0570dc85c947
INFO: 172.18.0.10:33690 - "POST /api/custom/course-outlines/1000/share HTTP/1.1" 200 OK
```

#### 3.2 Test Public Access
1. Copy the public URL from the success modal
2. Open it in an incognito/private window
3. Should see the course outline without logging in

Expected logs:
```
INFO: 172.18.0.10:44314 - "GET /api/custom/public/course-outlines/cf1615a6-1a13-41de-ba06-0570dc85c947 HTTP/1.1" 200 OK
```

## Troubleshooting

### Error: "Course outline not found"
Check logs for:
```
❌ [COURSE SHARING] Course {id} not found or not a Training Plan
```

**Solution**: Verify the course ID and microproduct_type in database:
```sql
SELECT id, project_name, microproduct_type, onyx_user_id 
FROM projects 
WHERE id = YOUR_COURSE_ID;
```

### Error: "You do not have permission to share this course outline"
Check logs for:
```
❌ [COURSE SHARING] User {user_id} does not own course {course_id} (owner: {owner_id})
```

**Solution**: This is correct behavior - only the course owner can share it. Log in with the correct account.

### Error: "Shared course outline not found" (after sharing)
Check logs for:
```
❌ [COURSE SHARING] No course found for share_token: {token}
```

**Possible causes**:
1. Share token wasn't saved to database
2. Database connection issue
3. Wrong share token being used

**Debug steps**:
```sql
-- Check if share_token was saved
SELECT id, project_name, share_token, is_public, expires_at 
FROM projects 
WHERE id = YOUR_COURSE_ID;

-- Verify the token matches
SELECT * FROM projects WHERE share_token = 'YOUR_TOKEN';
```

### Database Column Issues

If you get errors about missing columns:

#### Check for `share_token` column:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('share_token', 'is_public', 'shared_at', 'expires_at');
```

#### Add missing columns if needed:
```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS share_token VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS shared_at TIMESTAMP;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_projects_share_token ON projects(share_token);
```

## Expected Behavior After Fix

### Sharing Flow
1. ✅ User clicks "Share" on their course outline
2. ✅ Backend validates ownership (403 if not owner, 404 if course doesn't exist)
3. ✅ Share token generated and saved
4. ✅ Success modal shows public URL
5. ✅ Logs show successful sharing

### Public Access Flow
1. ✅ User visits public URL
2. ✅ Backend retrieves course by share token (no auth required)
3. ✅ Course outline loads with all products
4. ✅ Products are clickable and viewable
5. ✅ No login required

## Key Improvements

1. **Better Error Messages**: 
   - 404: "Course outline not found"
   - 403: "You do not have permission to share this course outline"
   - 410: "Shared course outline link has expired"

2. **Better Logging**:
   - Shows user attempting to share
   - Shows ownership mismatches
   - Shows missing courses

3. **More Lenient Matching**:
   - Accepts various "Training Plan" variations
   - Removes strict `is_public` requirement

4. **Separate Permission Checks**:
   - First checks if course exists
   - Then checks ownership
   - Provides specific error for each case

## Monitoring

After deployment, monitor:
1. **Share success rate**: Should be 100% for course owners
2. **Public access rate**: Should work for all valid share tokens
3. **Error logs**: Should see specific error messages, not generic 404s
4. **Database**: Share tokens should be saved correctly

## Conclusion

The fixes improve error handling, logging, and flexibility of the course sharing system. The main issues were:
- Too strict permission checking in one query
- Inflexible microproduct_type matching
- Lack of detailed logging for debugging

These have all been addressed with the changes above.
