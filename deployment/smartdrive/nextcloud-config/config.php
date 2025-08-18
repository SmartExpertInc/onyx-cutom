<?php
$CONFIG = array (
  'memcache.local' => '\\OC\\Memcache\\APCu',
  'memcache.redis' => array(
    'host' => 'nextcloud-redis',
    'port' => 6379,
  ),
  'memcache.locking' => '\\OC\\Memcache\\Redis',
  
  // Allow iframe embedding for Smart Drive integration
  'csrf.optout' => array(
    '/^\/smartdrive\//',
  ),
  
  // Content Security Policy to allow embedding
  'enable_previews' => true,
  'enabledPreviewProviders' => array(
    'OC\\Preview\\PNG',
    'OC\\Preview\\JPEG',
    'OC\\Preview\\GIF',
    'OC\\Preview\\BMP',
    'OC\\Preview\\XBitmap',
    'OC\\Preview\\MP3',
    'OC\\Preview\\TXT',
    'OC\\Preview\\MarkDown',
    'OC\\Preview\\PDF',
  ),
  
  // Logging
  'loglevel' => 2,
  'logfile' => '/var/www/html/data/nextcloud.log',
  
  // Default file permissions
  'filesystem_check_changes' => 1,
  
  // Maintenance window (disabled for Smart Drive)
  'maintenance_window_start' => 1,
  
  // Apps management
  'appstoreenabled' => false,
  
  // Security settings for Smart Drive integration
  'allow_user_to_change_display_name' => false,
  'lost_password_link' => 'disabled',
  
  // File handling
  'preview_max_filesize_image' => 50,
  'preview_max_scale_factor' => 10,
  
  // Smart Drive specific settings
  'smartdrive_integration' => true,
  'onyx_integration_enabled' => true,
); 