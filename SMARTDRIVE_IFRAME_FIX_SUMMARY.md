# Smart Drive Iframe White Page Fix - Implementation Summary

## Problem Analysis

The Smart Drive iframe was displaying a white page instead of the Nextcloud interface. After thorough investigation, the root cause was identified as **missing nginx proxy configuration in production**.

### Root Cause

- **Development config** (`app.conf.template.dev`) had complete Smart Drive proxy settings
- **Production configs** (`app.conf.template` and `app.conf.template.no-letsencrypt`) were missing the `/smartdrive/` location block entirely
- The frontend iframe was trying to load `/smartdrive/` which had no proxy route defined
- Result: requests fell through to default location, causing white page

## Changes Implemented

### 1. Updated `deployment/data/nginx/app.conf.template`

**Added nextcloud_server upstream:**
```nginx
upstream nextcloud_server {
    server ${NEXTCLOUD_UPSTREAM_HOST} fail_timeout=0;
}
```

**Added Smart Drive proxy location block:**
```nginx
# Location for Smart Drive (Nextcloud integration)
location ^~ /smartdrive/ {
    # Strip /smartdrive/ prefix when proxying to Nextcloud
    rewrite ^/smartdrive/(.*)$ /$1 break;
    proxy_pass http://nextcloud_server/;
    
    # Proper headers for embedding
    proxy_set_header Host nc1.contentbuilder.ai;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $forwarded_proto;
    proxy_set_header X-Forwarded-Host $forwarded_host;
    proxy_set_header X-Forwarded-Port $forwarded_port;
    
    # WebSocket support for real-time updates
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    
    # Large file upload support
    client_max_body_size 10G;
    proxy_request_buffering off;
    proxy_buffering off;
    
    # Extended timeouts for large uploads
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    
    # Override frame options to allow embedding
    proxy_hide_header X-Frame-Options;
    proxy_hide_header Content-Security-Policy;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Content-Security-Policy "frame-ancestors 'self' https://$host" always;
    
    # Handle redirects properly
    proxy_redirect ~^https?://[^/]+/(.*)$ https://$host/smartdrive/$1;
    proxy_redirect ~^/(.*)$ /smartdrive/$1;
    proxy_pass_request_headers on;
}

# DAV .well-known redirects for SmartDrive
location = /.well-known/carddav {
    return 301 $scheme://$host/smartdrive/remote.php/dav;
}

location = /.well-known/caldav {
    return 301 $scheme://$host/smartdrive/remote.php/dav;
}
```

### 2. Updated `deployment/data/nginx/app.conf.template.no-letsencrypt`

Applied identical changes to ensure consistency across all deployment scenarios.

## Key Features of the Fix

### 1. **Proxy Configuration**
- Routes `/smartdrive/` requests to Nextcloud server
- Strips the `/smartdrive/` prefix when forwarding to backend
- Uses `${NEXTCLOUD_UPSTREAM_HOST}` environment variable for flexibility

### 2. **Iframe Embedding Support**
- Removes restrictive frame headers from Nextcloud responses
- Sets appropriate `X-Frame-Options` and `Content-Security-Policy` headers
- Allows embedding in same-origin contexts

### 3. **WebSocket Support**
- Enables real-time updates in Nextcloud interface
- Supports WebSocket upgrade requests

### 4. **Large File Handling**
- 10GB upload limit for Smart Drive
- Disabled request buffering for better performance
- Extended timeouts for large file operations

### 5. **Redirect Handling**
- Properly handles Nextcloud internal redirects
- Maintains `/smartdrive/` prefix in user URLs

### 6. **DAV Protocol Support**
- Redirects `.well-known` endpoints for CardDAV/CalDAV
- Enables proper WebDAV functionality

## Environment Variables

The fix relies on existing environment variable handling:
- `NEXTCLOUD_UPSTREAM_HOST` - already configured in `run-nginx.sh`
- Default value: `nc1.contentbuilder.ai:8080`
- Variable substitution handled by `envsubst` in startup script

## Deployment Impact

### Immediate Effect
- No database changes required
- No frontend code changes needed
- Configuration-only fix

### After Nginx Restart
- Smart Drive iframe will load Nextcloud interface
- File browsing functionality restored
- Upload/download operations through iframe will work

## Verification Steps

1. **Test Direct Access:** Visit `https://your-domain/smartdrive/` 
2. **Test Iframe:** Navigate to Smart Drive in the application
3. **Test Functionality:** Try file operations through the iframe
4. **Check Logs:** Monitor nginx logs for proper proxy behavior

## Why This Wasn't Detected Earlier

- Smart Drive API functionality (file sync) worked fine - it uses direct backend calls
- Only the iframe display was affected
- Development environment had the correct configuration
- The issue was environment-specific (dev vs prod config differences)

## Related Files

- `custom_extensions/frontend/src/components/SmartDrive/SmartDriveFrame.tsx` - Frontend iframe component
- `deployment/data/nginx/run-nginx.sh` - Environment variable handling
- `deployment/docker_compose/docker-compose.prod.yml` - Production deployment config

## Future Considerations

- Consider consolidating nginx configurations to prevent drift
- Add health checks for Nextcloud upstream
- Monitor iframe loading performance
- Consider implementing fallback UI for Nextcloud connectivity issues

---

**Fix Status:** ✅ **IMPLEMENTED + REDIRECT FIX APPLIED**  
**Requires Restart:** Yes (nginx container)  
**Breaking Changes:** None  
**Backward Compatibility:** Full  

---

## 🆕 CRITICAL UPDATE - Double `/smartdrive/` Path Fix

**Issue Discovered:** The iframe was showing white page due to malformed URLs with double `/smartdrive/` paths:
- ❌ `GET /smartdrive/smartdrive/apps/files/` → 404 Not Found
- ✅ `GET /smartdrive/apps/files/` → Expected working URL

**Root Cause:** Nginx `proxy_redirect` rule was too broad:
```nginx
proxy_redirect ~^/(.*)$ /smartdrive/$1;  # ❌ Matches ALL paths
```

**Fix Applied:** Disabled problematic redirect rules causing double `/smartdrive/` paths:
```nginx
# proxy_redirect ~^https?://[^/]+/(.*)$ https://$host/smartdrive/$1;  # ❌ Disabled - was causing double paths
# proxy_redirect ~^/(?!smartdrive/)(.*)$ /smartdrive/$1;              # ❌ Disabled - was causing double paths  
proxy_redirect / /smartdrive/;                                       # ✅ Simple redirect rule
```

**Files Updated:**
- `deployment/data/nginx/app.conf.template`
- `deployment/data/nginx/app.conf.template.dev` 
- `deployment/data/nginx/app.conf.template.no-letsencrypt` 