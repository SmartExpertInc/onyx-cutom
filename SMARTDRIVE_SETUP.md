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

## User Setup Steps

### 1. Create Nextcloud App Password ⚠️ **CRITICAL**
- Log into your personal Nextcloud account 
- Go to **Personal Settings → Security → "App passwords"**
- Click **"Create new app password"** and give it a name (e.g., "Onyx Smart Drive")
- Copy the generated app password (format: `xxxxx-xxxxx-xxxxx-xxxxx-xxxxx`)
- **⚠️ You MUST use an App Password, not your regular login password**
- **⚠️ This is mandatory for accounts with 2FA enabled**

### 2. Navigate to Smart Drive Tab
- Go to **Projects page → "Smart Drive" tab**
- Click **"Browse Uploaded"** to see the Nextcloud interface in an iframe

### 3. Set Up Individual Nextcloud Credentials 
- Click **"Setup Credentials"** button (appears if credentials not configured)
- Enter your personal Nextcloud username
- **Enter the App Password** you created in step 1 (NOT your regular password)
- Enter your Nextcloud server URL
- Credentials are encrypted and stored securely in the database

### 4. Upload Files to Your Nextcloud
- Use the embedded Nextcloud interface to upload files
- Files are stored in your individual Nextcloud account

### 5. Sync Files to Onyx
- Click **"Sync to Onyx"** button
- Files are imported and indexed in Onyx with proper user isolation
- Each user's files are completely private from other users

## Database Tables

The following tables are automatically created on startup:

1. **`smartdrive_accounts`** - Per-user SmartDrive linkage and sync state
2. **`smartdrive_imports`** - Maps SmartDrive files to imported Onyx documents  
3. **`user_connectors`** - Per-user connector configurations

## Features

### ✅ Implemented
- **Smart Drive Tab**: Browse and sync files from Nextcloud
- **File Listing**: WebDAV integration to list actual Nextcloud files  
- **File Import**: Downloads from Nextcloud and uploads to Onyx
- **Sync Tracking**: Tracks imported files and prevents duplicates
- **Native Onyx Connectors**: Users create private connectors using Onyx's existing system
- **OAuth Support**: Full OAuth integration via Onyx's connector forms
- **HTTPS Support**: Proper mixed content handling

### 🔧 Current Limitations
- ✅ **App Password Support**: Now properly uses Nextcloud App Passwords for secure authentication
- No real-time webhook support (manual sync required)
- Directory uploads not implemented

## Troubleshooting

### Issue: "Extension context invalidated" when creating connectors
- This is a browser extension conflict, not our code
- The form data is being sent correctly to the backend
- Try disabling browser extensions or use incognito mode

### Issue: 401 Unauthorized during sync
- ✅ **Fixed**: Now uses individual Nextcloud accounts with App Passwords
- **Solution**: Users must create and use Nextcloud App Passwords (not regular passwords)
- Go to Nextcloud → Personal Settings → Security → "App passwords" → Create new
- **Required for all accounts with 2FA enabled**
- Use the generated App Password in the Smart Drive credentials setup

### Issue: Files don't appear after sync (404 Not Found) 
- Verify your personal Nextcloud account credentials are correct
- Ensure your Nextcloud server URL is accessible
- Check that your App Password has not expired
- Look for import errors in backend logs

### Issue: Mixed content HTTPS/HTTP errors  
- ✅ **Fixed**: iframe now uses same protocol as parent page

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