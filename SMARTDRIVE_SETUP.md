# Smart Drive Setup Guide

## Overview
Smart Drive integrates Nextcloud file storage with Onyx, allowing users to sync files automatically and create per-user connectors for personal data sources.

## Environment Variables

Add these environment variables to your `.env` file in `deployment/docker_compose/.env`:

### Required for Smart Drive
```bash
# Nextcloud Integration
NEXTCLOUD_BASE_URL=http://nc1.contentbuilder.ai:8080
NEXTCLOUD_DEFAULT_PASSWORD=your_actual_nextcloud_password

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
```

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
- **User Connectors**: Create personal connectors for 40+ data sources
- **HTTPS Support**: Proper mixed content handling

### 🔧 Current Limitations
- Uses basic auth for Nextcloud (should use OAuth/app passwords in production)
- No real-time webhook support (manual sync required)
- Directory uploads not implemented

## Troubleshooting

### Issue: "Extension context invalidated" when creating connectors
- This is a browser extension conflict, not our code
- The form data is being sent correctly to the backend
- Try disabling browser extensions or use incognito mode

### Issue: Files don't appear after sync
- Check Nextcloud connection in logs
- Verify `NEXTCLOUD_DEFAULT_PASSWORD` is correct
- Check that files are actually in the Nextcloud instance
- Look for import errors in backend logs

### Issue: Mixed content HTTPS/HTTP errors  
- ✅ **Fixed**: iframe now uses same protocol as parent page

## Next Steps for Production

1. **Secure Authentication**: Replace basic auth with Nextcloud OAuth or app passwords
2. **Webhook Integration**: Implement real-time sync via Nextcloud webhooks
3. **Encrypted Credentials**: Store user Nextcloud credentials encrypted
4. **Directory Support**: Allow uploading/syncing entire folders
5. **Error Handling**: Better user feedback for sync failures

## API Endpoints

### Smart Drive
- `POST /api/custom-projects-backend/smartdrive/session` - Initialize SmartDrive session
- `GET /api/custom-projects-backend/smartdrive/list` - List files from Nextcloud
- `POST /api/custom-projects-backend/smartdrive/import-new` - Sync new/updated files

### User Connectors  
- `GET /api/custom-projects-backend/smartdrive/connectors/` - List user connectors
- `POST /api/custom-projects-backend/smartdrive/connectors/` - Create connector
- `PUT /api/custom-projects-backend/smartdrive/connectors/{id}` - Update connector
- `DELETE /api/custom-projects-backend/smartdrive/connectors/{id}` - Delete connector
- `POST /api/custom-projects-backend/smartdrive/connectors/{id}/sync` - Sync connector 