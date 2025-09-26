# Smart Drive Setup Guide

## Overview
Smart Drive integrates Nextcloud file storage with Onyx, allowing users to sync files automatically and create per-user connectors for personal data sources.

## Environment Variables

Add these environment variables to your `.env` file in `deployment/docker_compose/.env`:

### Required for Smart Drive
```bash
# Nextcloud Integration (UPDATED - uses shared account approach)
NEXTCLOUD_USERNAME=smart_drive_user
NEXTCLOUD_PASSWORD=your_nextcloud_shared_account_password

# Smart Drive Database (if not already set)
CUSTOM_PROJECTS_DATABASE_URL=postgresql://custom_user:custom_password@custom_projects_db:5432/custom_projects_db

# Existing Required Variables
ONYX_DATABASE_URL=postgresql://postgres:password@relational_db:5432/onyx_db
OPENAI_API_KEY=your_openai_api_key
```

### For Nginx Routing
```bash
# Nextcloud upstream for proxy (hostname:port only)
NEXTCLOUD_UPSTREAM_HOST=nc1.contentbuilder.ai:8080

# IMPORTANT: Individual User Account Encryption
SMARTDRIVE_ENCRYPTION_KEY=your_generated_fernet_key_here
```

**Generate the encryption key:**
```python
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```

## User Setup Steps ✨ **Now Super Easy!**

### 1. Navigate to Smart Drive Tab
- Go to **Projects page → "Smart Drive" tab**
- You'll see "⚠️ No Nextcloud account connected"

### 2. One-Click Nextcloud Connection 🚀
- Click **"Connect Nextcloud Account"** button
- **Use the default HTTPS URL** (automatically filled - uses secure proxy)
- A **popup window opens to your familiar Nextcloud login page**
- **Login normally** with your regular username/password
- **Handles 2FA, SSO, and any auth method automatically!**
- **No manual app password creation needed!** ✨

### 3. Automatic Setup Complete
- Popup closes automatically after successful login
- System receives auto-generated app password from Nextcloud
- Status changes to "✅ Connected to Nextcloud"
- All credentials are encrypted and stored securely
- **Note**: Default URL uses secure HTTPS proxy, avoiding mixed content issues

### 4. Upload Files to Your Nextcloud
- Use the embedded Nextcloud interface to upload files
- Files are stored in your individual Nextcloud account

### 5. Sync Files to Onyx
- Click **"Sync to Onyx"** button
- Files are imported and indexed in Onyx with proper user isolation
- Each user's files are completely private from other users

---

## 🔄 Fallback: Manual Setup
If the automatic connection doesn't work, click **"Manual Setup"** for the traditional app password approach.

## Database Tables

The following tables are automatically created on startup:

1. **`smartdrive_accounts`** - Per-user SmartDrive linkage and sync state
2. **`smartdrive_imports`** - Maps SmartDrive files to imported Onyx documents  
3. **`user_connectors`** - Per-user connector configurations

## Features

### ✅ Implemented
- **Smart Drive Tab**: Browse and sync files from Nextcloud
- **One-Click Authentication**: Nextcloud Login Flow v2 with automatic app password generation ✨
- **Universal Auth Support**: Handles 2FA, SSO, LDAP, and all Nextcloud authentication methods
- **File Listing**: WebDAV integration to list actual Nextcloud files  
- **File Import**: Downloads from Nextcloud and uploads to Onyx
- **Sync Tracking**: Tracks imported files and prevents duplicates
- **Native Onyx Connectors**: Users create private connectors using Onyx's existing system
- **OAuth Support**: Full OAuth integration via Onyx's connector forms
- **HTTPS Support**: Proper mixed content handling
- **Individual User Isolation**: Each user has completely private file access

### 🔧 Current Limitations
- No real-time webhook support (manual sync required)
- Directory uploads not implemented

## Troubleshooting

### Issue: "Extension context invalidated" when creating connectors
- This is a browser extension conflict, not our code
- The form data is being sent correctly to the backend
- Try disabling browser extensions or use incognito mode

### Issue: 401 Unauthorized during sync
- ✅ **Fixed**: Now uses Nextcloud Login Flow v2 with automatic app password generation
- **Solution**: Use the "Connect Nextcloud Account" button for automatic setup
- No manual app password creation needed - system handles everything!
- Supports 2FA, SSO, and all Nextcloud authentication methods automatically

### Issue: Files don't appear after sync (404 Not Found) 
- Verify your personal Nextcloud account credentials are correct
- Ensure your Nextcloud server URL is accessible
- Check that your App Password has not expired
- Look for import errors in backend logs

### Issue: Mixed Content Error (HTTPS page accessing HTTP Nextcloud)
- **Error**: `"was loaded over HTTPS, but requested an insecure resource 'http://...' This request has been blocked"`
- **Cause**: Browser security blocks HTTP requests from HTTPS pages
- **Solutions**:

#### **Solution 1: Enable HTTPS on Nextcloud (Recommended)** ✅
1. **Configure SSL/TLS for your Nextcloud server**:
   ```bash
   # For Nextcloud in Docker, add SSL configuration
   # Update your Nextcloud docker-compose.yml or reverse proxy
   ```
2. **Update Nginx proxy to handle HTTPS**:
   ```nginx
   # In deployment/data/nginx/app.conf.template.dev
   upstream nextcloud_server {
       server nc1.contentbuilder.ai:8080;  # Internal HTTP is OK
   }
   
   location ^~ /smartdrive/ {
       # Proxy to HTTP backend (OK for internal)
       proxy_pass http://nextcloud_server/;
       
       # But serve via HTTPS to frontend
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-Proto https;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   }
   ```
3. **Test with HTTPS URL**: `https://nc1.contentbuilder.ai:8080` or `https://your-domain/smartdrive/`

#### **Solution 2: Use Internal Proxy (Immediate Fix)** 🚀
Instead of direct Nextcloud access, use the proxied URL:
- **Change server URL to**: `https://ml-dev.contentbuilder.ai/smartdrive`
- This uses your existing Nginx HTTPS proxy to reach Nextcloud internally

#### **Solution 3: Development Workaround**
For development only, access the page via HTTP:
- Go to: `http://ml-dev.contentbuilder.ai/custom-projects-ui/projects?tab=smart-drive`
- ⚠️ **Not recommended for production**

### Issue: Custom connector endpoints returning 410 errors
- ✅ **Fixed**: Now using Onyx's native connector system with `AccessType.PRIVATE`
- Users are redirected to proper Onyx connector creation and management pages
- All OAuth flows and connector configurations work exactly like admin connectors

### Issue: Connectors created through Smart Drive are not private
- ✅ **Fixed**: Implemented proper user group linking for private connectors
- Smart Drive connector links include `smart_drive=true` parameter
- Backend creates a personal user group for each user (`smart_drive_user_{user_id}`)
- Connectors are linked to the user's personal group, enabling proper access control
- Documents are now truly private and only searchable by the user who created the connector
- Smart Drive UI filters connectors to only show user's private Smart Drive connectors

## Next Steps for Production

1. ✅ **Secure Authentication**: Now uses Nextcloud App Passwords with encrypted credential storage
2. **Webhook Integration**: Implement real-time sync via Nextcloud webhooks
3. **Directory Support**: Allow uploading/syncing entire folders
4. **Error Handling**: Better user feedback for sync failures

## API Endpoints

### Smart Drive
- `POST /api/custom-projects-backend/smartdrive/session` - Initialize SmartDrive session
- `GET /api/custom-projects-backend/smartdrive/list` - List files from Nextcloud
- `POST /api/custom-projects-backend/smartdrive/import-new` - Sync new/updated files

### User Connectors (Using Onyx's Native System)
- **Create**: `/admin/connectors/{source}?access_type=private` - Onyx's connector creation forms with OAuth
- **List**: `/api/manage/admin/connector` - Onyx's connector API (filter for private connectors)  
- **Manage**: `/admin/connector/{id}` - Onyx's connector management UI
- **Sync**: `/api/manage/admin/connector/{id}/index` - Onyx's connector sync API

*Previous custom endpoints at `/api/custom-projects-backend/smartdrive/connectors/` are deprecated and return HTTP 410 with redirect information.* 