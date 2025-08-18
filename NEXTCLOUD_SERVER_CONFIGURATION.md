# Nextcloud Server Configuration for Smart Drive Integration

## Required Changes to Your Existing Nextcloud Instance

### 1. Core Configuration Changes

Add these settings to your Nextcloud `config/config.php` file:

```php
<?php
$CONFIG = array(
  // ... your existing configuration ...
  
  // Allow iframe embedding for Smart Drive integration
  'csrf.optout' => array(
    '/^\/remote\.php\/dav\//',
    '/^\/ocs\//',
    '/^\/apps\/files/',
  ),
  
  // Trusted domains - add your Onyx domain
  'trusted_domains' => array(
    0 => 'your-nextcloud-domain.com',
    1 => 'your-onyx-domain.com',  // ADD THIS
    // ... any other existing domains
  ),
  
  // Overwrite settings for proper URL generation when proxied
  'overwriteprotocol' => 'https',
  'overwritehost' => 'your-onyx-domain.com',
  'overwritewebroot' => '/smartdrive',
  'overwritecondaddr' => '^192\.168\.1\.100$',  // Example: Onyx server IP is 192.168.1.100
  
  // Content Security Policy adjustments
  'content_security_policy_nonce' => 'disabled',
  
  // Allow API access
  'maintenance' => false,
  'appstoreenabled' => false,  // Optional: disable app store for security
  
  // Smart Drive specific settings
  'smartdrive_integration' => true,
  'onyx_integration_enabled' => true,
);
```

### 2. Web Server Configuration (Apache/Nginx)

#### If using Apache, add to your virtual host:

```apache
<VirtualHost *:443>
    # ... your existing configuration ...
    
    # Allow iframe embedding from Onyx domain
    Header always set X-Frame-Options "ALLOW-FROM https://your-onyx-domain.com"
    Header always set Content-Security-Policy "frame-ancestors 'self' https://your-onyx-domain.com"
    
    # CORS headers for API access
    Header always set Access-Control-Allow-Origin "https://your-onyx-domain.com"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PROPFIND"
    Header always set Access-Control-Allow-Headers "Authorization, Content-Type, Depth, X-Requested-With"
    Header always set Access-Control-Allow-Credentials "true"
    
    # Handle preflight requests
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</VirtualHost>
```

#### If using Nginx, add to your server block:

```nginx
server {
    # ... your existing configuration ...
    
    # Allow iframe embedding from Onyx domain
    add_header X-Frame-Options "ALLOW-FROM https://your-onyx-domain.com" always;
    add_header Content-Security-Policy "frame-ancestors 'self' https://your-onyx-domain.com" always;
    
    # CORS headers for API access
    add_header Access-Control-Allow-Origin "https://your-onyx-domain.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PROPFIND" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type, Depth, X-Requested-With" always;
    add_header Access-Control-Allow-Credentials "true" always;
    
    # Handle preflight requests
    location / {
        if ($request_method = 'OPTIONS') {
            return 200;
        }
        try_files $uri $uri/ /index.php$request_uri;
    }
}
```

### 3. Required Nextcloud Apps

Install and enable these apps via Admin → Apps or command line:

```bash
# Enable required apps
sudo -u www-data php occ app:enable files
sudo -u www-data php occ app:enable dav
sudo -u www-data php occ app:enable files_external
sudo -u www-data php occ app:enable workflow
sudo -u www-data php occ app:enable files_automatedtagging

# Optional but recommended
sudo -u www-data php occ app:enable files_versions
sudo -u www-data php occ app:enable files_retention
sudo -u www-data php occ app:enable activity
```

### 4. Create Onyx Integration User

Create a dedicated admin user for Onyx integration:

```bash
# Create admin user for Onyx
sudo -u www-data php occ user:add onyx_admin --password-from-env
# Set password via environment variable or prompt

# Add to admin group
sudo -u www-data php occ group:adduser admin onyx_admin

# Set up app passwords for API access (if needed)
sudo -u www-data php occ user:setting onyx_admin core enable_external_apps true
```

### 5. WebDAV and API Configuration

Ensure WebDAV is properly configured:

```bash
# Check WebDAV status
sudo -u www-data php occ dav:list-mounts

# Verify API endpoints are accessible
curl -u admin:password https://your-nextcloud-domain.com/remote.php/dav/

# Test from Onyx server
curl -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
     https://your-nextcloud-domain.com/ocs/v1.php/cloud/users
```

### 6. Workflow Configuration for Webhooks

Set up workflows to notify Onyx of file changes:

1. Go to Admin → Workflow
2. Create new workflow with these settings:
   - **Event**: File created, File updated, File deleted
   - **Condition**: All files (or specific folders if needed)
   - **Action**: Send HTTP request
   - **URL**: `https://your-onyx-domain.com/api/custom-smartdrive/webhook`
   - **Method**: POST
   - **Headers**: 
     ```
     Content-Type: application/json
     X-NC-Signature: {webhook_signature}
     ```
   - **Body**:
     ```json
     {
       "event": "{event}",
       "file_path": "{file_path}",
       "file_id": "{file_id}",
       "user_id": "{user_id}",
       "timestamp": "{timestamp}"
     }
     ```

### 7. Security Configuration

#### SSL/TLS Settings

Ensure your Nextcloud has proper SSL configuration:

```apache
# Apache SSL configuration
SSLEngine on
SSLCertificateFile /path/to/certificate.crt
SSLCertificateKeyFile /path/to/private.key
SSLCertificateChainFile /path/to/intermediate.crt

# Strong SSL settings
SSLProtocol all -SSLv2 -SSLv3
SSLCipherSuite ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384
SSLHonorCipherOrder on
```

#### Firewall Rules

Allow connections from your Onyx server:

```bash
# Allow HTTPS from Onyx server
ufw allow from YOUR_ONYX_SERVER_IP to any port 443

# Allow HTTP if needed for health checks
ufw allow from YOUR_ONYX_SERVER_IP to any port 80
```

### 8. Performance Optimization

Add these settings for better performance with Smart Drive:

```php
// Add to config/config.php
'memcache.local' => '\\OC\\Memcache\\APCu',
'memcache.redis' => array(
  'host' => 'localhost',
  'port' => 6379,
),
'memcache.locking' => '\\OC\\Memcache\\Redis',
'preview_max_filesize_image' => 50,
'enable_previews' => true,
'enabledPreviewProviders' => array(
  'OC\\Preview\\PNG',
  'OC\\Preview\\JPEG',
  'OC\\Preview\\PDF',
  'OC\\Preview\\TXT',
),
```

### 9. User Management for Smart Drive

Configure user settings for Onyx integration:

```bash
# Set up user creation webhook (optional)
sudo -u www-data php occ config:app:set user_oidc auto_provision --value=1

# Configure default quotas
sudo -u www-data php occ config:app:set files default_quota --value="10 GB"

# Set up external user backend if needed
sudo -u www-data php occ app:enable user_external
```

### 10. Monitoring and Logging

Enable detailed logging for troubleshooting:

```php
// Add to config/config.php
'loglevel' => 1,  // 0=DEBUG, 1=INFO, 2=WARN, 3=ERROR
'logfile' => '/var/log/nextcloud/nextcloud.log',
'log_rotate_size' => 104857600, // 100MB
'logdateformat' => 'F d, Y H:i:s',
```

### 11. Environment Variables for Onyx

Set these environment variables in your Onyx deployment:

```bash
# External Nextcloud Configuration
NEXTCLOUD_EXTERNAL_URL=https://your-nextcloud-domain.com
NEXTCLOUD_EXTERNAL_HOST=your-nextcloud-domain.com
NEXTCLOUD_EXTERNAL_PORT=443
NEXTCLOUD_SSL_VERIFY=on  # Set to 'off' for self-signed certificates

# Nextcloud Admin Credentials
NEXTCLOUD_ADMIN_USER=onyx_admin
NEXTCLOUD_ADMIN_PASSWORD=your_secure_password

# Webhook Security
NEXTCLOUD_WEBHOOK_SECRET=your_webhook_secret
```

## Testing the Integration

After making these changes, test the integration:

1. **Test iframe embedding**:
   ```html
   <iframe src="https://your-nextcloud-domain.com" width="800" height="600"></iframe>
   ```

2. **Test WebDAV access**:
   ```bash
   curl -X PROPFIND \
        -H "Depth: 1" \
        -u admin:password \
        https://your-nextcloud-domain.com/remote.php/dav/files/admin/
   ```

3. **Test webhook delivery**:
   - Upload a file to Nextcloud
   - Check Onyx logs for webhook reception

4. **Test CORS**:
   ```javascript
   fetch('https://your-nextcloud-domain.com/ocs/v1.php/cloud/users', {
     headers: { 'Authorization': 'Basic ' + btoa('admin:password') }
   })
   ```

## Troubleshooting

### Common Issues:

1. **Iframe blocked**: Check X-Frame-Options and CSP headers
2. **CORS errors**: Verify Access-Control headers are set correctly
3. **Authentication failures**: Check user permissions and app passwords
4. **WebDAV issues**: Verify dav app is enabled and working
5. **Webhook failures**: Check network connectivity and webhook URL

### Debug Commands:

```bash
# Check Nextcloud status
sudo -u www-data php occ status

# Test configuration
sudo -u www-data php occ config:list

# Check app status
sudo -u www-data php occ app:list

# View logs
tail -f /var/log/nextcloud/nextcloud.log
``` 