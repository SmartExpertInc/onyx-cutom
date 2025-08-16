# SmartDrive Integration - Phase 1 Implementation

## Overview

SmartDrive is a seamless integration between your content creation platform and Nextcloud, providing users with a unified cloud storage experience. This Phase 1 implementation includes:

- **Automatic User Provisioning**: Users are auto-registered in Nextcloud using their platform credentials
- **Iframe Integration**: Nextcloud interface embedded directly in the platform
- **Seamless Authentication**: Single sign-on experience using platform credentials

## Architecture

### Backend Components

1. **NextcloudService** (`custom_extensions/backend/app/services/nextcloud_service.py`)
   - Handles Nextcloud API communications
   - User provisioning and management
   - Authentication and session management

2. **SmartDriveManager** (`custom_extensions/backend/app/utils/smartdrive.py`)
   - High-level interface for SmartDrive operations
   - Session management and user access control
   - Health monitoring

3. **API Endpoints** (`custom_extensions/backend/app/core/routes.py`)
   - `/smartdrive/access` - Get user access to SmartDrive
   - `/smartdrive/health` - Check service health
   - `/smartdrive/user/{username}` - Get user information

### Frontend Components

1. **SmartDriveTab** (`custom_extensions/frontend/src/components/SmartDriveTab.tsx`)
   - Main UI component for SmartDrive access
   - Credential management and authentication flow
   - Iframe container with proper security settings

2. **Projects Page Integration** (`custom_extensions/frontend/src/app/projects/page.tsx`)
   - Added SmartDrive tab to main navigation
   - Conditional rendering based on active tab

## Configuration

### Environment Variables

Add these variables to your backend environment:

```bash
# Nextcloud Configuration
NEXTCLOUD_URL=https://nc1.contentbuilder.ai
NEXTCLOUD_ADMIN_USERNAME=admin
NEXTCLOUD_ADMIN_PASSWORD=your_admin_password_here
```

### Nextcloud Setup

1. **Enable User Provisioning API**
   - The Provisioning API app should be enabled by default
   - Verify at: Settings → Apps → Provisioning API

2. **Admin Account**
   - Create an admin account for user management
   - Use strong credentials for security

3. **CORS Configuration** (if needed)
   - Configure Nextcloud to allow iframe embedding
   - Set appropriate X-Frame-Options headers

## Features

### Phase 1 Features ✅

- [x] **User Auto-Registration**: Automatic Nextcloud account creation
- [x] **Iframe Integration**: Embedded Nextcloud interface
- [x] **Basic Authentication**: Credential-based access
- [x] **Health Monitoring**: Service availability checks
- [x] **User Management**: User info retrieval and management
- [x] **Internationalization**: Multi-language support
- [x] **Error Handling**: Comprehensive error management

### Security Features

- **Credential Validation**: Server-side credential verification
- **Iframe Security**: Proper sandbox and allow attributes
- **API Authentication**: Secure backend API access
- **Session Management**: Secure session handling

## API Reference

### POST /smartdrive/access

Get SmartDrive access for a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword",
  "display_name": "User Name" // optional
}
```

**Response:**
```json
{
  "success": true,
  "iframe_url": "https://nc1.contentbuilder.ai",
  "username": "user@example.com",
  "user_exists": false,
  "nextcloud_url": "https://nc1.contentbuilder.ai"
}
```

### GET /smartdrive/health

Check SmartDrive service health.

**Response:**
```json
{
  "healthy": true,
  "service": "Nextcloud SmartDrive",
  "url": "https://nc1.contentbuilder.ai"
}
```

### GET /smartdrive/user/{username}

Get user information from Nextcloud.

**Response:**
```json
{
  "success": true,
  "user_info": {
    "id": "user@example.com",
    "email": "user@example.com",
    "displayname": "User Name",
    "enabled": "1"
  }
}
```

## Testing

### Automated Testing

Run the test script to verify the integration:

```bash
cd custom_extensions/backend
export NEXTCLOUD_ADMIN_PASSWORD='your_password'
python test_smartdrive.py
```

### Manual Testing

1. **Access SmartDrive Tab**
   - Navigate to `/projects?tab=smartdrive`
   - Enter your email and password
   - Click "Connect to SmartDrive"

2. **Verify User Creation**
   - Check Nextcloud admin panel for new user
   - Verify user can access Nextcloud directly

3. **Test File Operations**
   - Upload files through the iframe
   - Create folders and organize content
   - Verify changes persist across sessions

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify NEXTCLOUD_URL is accessible
   - Check admin credentials are correct
   - Ensure Nextcloud Provisioning API is enabled

2. **Iframe Not Loading**
   - Check CORS/X-Frame-Options configuration
   - Verify SSL certificates are valid
   - Check browser security settings

3. **User Creation Failed**
   - Verify admin has user creation permissions
   - Check for email format validation
   - Review Nextcloud logs for errors

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=true
```

### Health Check

Use the health endpoint to verify service status:
```bash
curl -X GET http://localhost:8000/smartdrive/health
```

## Security Considerations

### Phase 1 Security

- **Credential Storage**: Passwords stored temporarily in localStorage
- **HTTPS Required**: All communications must use HTTPS
- **Iframe Sandboxing**: Proper sandbox attributes for security
- **API Authentication**: Backend API requires authentication

### Production Recommendations

1. **App Passwords**: Use Nextcloud app passwords instead of main passwords
2. **Session Tokens**: Implement proper session token management
3. **Credential Encryption**: Encrypt stored credentials
4. **Rate Limiting**: Implement API rate limiting
5. **Audit Logging**: Log all SmartDrive access attempts

## Future Enhancements (Phase 2+)

### Planned Features

- **OAuth 2.0 Integration**: Replace basic auth with OAuth
- **File Sync**: Bidirectional file synchronization
- **Real-time Collaboration**: WebSocket-based collaboration
- **Advanced Permissions**: Granular access control
- **Backup & Recovery**: Automated backup systems
- **Mobile Optimization**: Enhanced mobile experience

### Performance Optimizations

- **Caching**: Implement intelligent caching strategies
- **CDN Integration**: Use CDN for faster file delivery
- **Lazy Loading**: Load files on-demand
- **Background Sync**: Sync files in background

## Support

### Documentation

- [Nextcloud API Documentation](https://docs.nextcloud.com/server/latest/developer_manual/client_apis/)
- [User Provisioning API](https://docs.nextcloud.com/server/latest/admin_manual/configuration_user/user_provisioning_api.html)

### Monitoring

- Health endpoint: `/smartdrive/health`
- Service logs in backend application
- Nextcloud logs in Nextcloud admin panel

---

**Implementation Status:** ✅ Phase 1 Complete  
**Next Phase:** OAuth Integration & Enhanced Security  
**Estimated Effort:** Phase 2 - 2-3 weeks 