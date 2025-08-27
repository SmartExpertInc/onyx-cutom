# API URL Testing Guide

## Problem
The frontend is getting a 404 error when trying to access the video generation API.

## Current Error
```
GET https://dev4.contentbuilder.ai/api/custom/video/avatars 404 (Not Found)
```

## Expected URL
Based on the nginx configuration, the frontend should be accessing:
```
https://dev4.contentbuilder.ai/api/custom-projects-backend/video/avatars
```

## Testing Steps

### 1. Test the Correct URL in Browser Console
Open the browser console on `https://dev4.contentbuilder.ai` and run:

```javascript
// Test the correct URL
fetch('/api/custom-projects-backend/video/avatars')
  .then(response => response.json())
  .then(data => console.log('✅ Success:', data))
  .catch(error => console.error('❌ Error:', error));
```

### 2. Test the Wrong URL (for comparison)
```javascript
// Test the wrong URL
fetch('/api/custom/video/avatars')
  .then(response => response.json())
  .then(data => console.log('✅ Success:', data))
  .catch(error => console.error('❌ Error:', error));
```

### 3. Check Backend Logs
Look for these log entries in the backend:
```
INFO:app.services.video_generation_service:HTTP client initialized successfully
INFO:main:Video generation service imported successfully
```

### 4. Verify Nginx Configuration
The nginx config should have:
```nginx
location ^~ /api/custom-projects-backend/ {
    rewrite ^/api/custom-projects-backend/(.*)$ /api/custom/$1 break;
    proxy_pass http://custom_backend:8001;
}
```

## Expected Results
- ✅ `/api/custom-projects-backend/video/avatars` should return avatar data
- ❌ `/api/custom/video/avatars` should return 404

## Fix Applied
The VideoDownloadButton component has been updated to use:
```javascript
const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
const avatarResponse = await fetch(`${CUSTOM_BACKEND_URL}/video/avatars`);
```

This should now correctly access: `/api/custom-projects-backend/video/avatars`







