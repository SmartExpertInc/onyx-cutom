#!/bin/bash
# SmartDrive Redirect Fix Script
# This script applies the final fix for the double /smartdrive/ path issue

echo "🔧 Applying SmartDrive redirect fix..."

# Apply fix to running nginx container
docker compose exec nginx sh -c "
echo '📝 Backing up current config...'
cp /etc/nginx/conf.d/app.conf /etc/nginx/conf.d/app.conf.backup.$(date +%Y%m%d_%H%M%S)

echo '🔧 Applying redirect fix...'
# Comment out the problematic redirect rules
sed -i 's/proxy_redirect ~/#proxy_redirect ~/' /etc/nginx/conf.d/app.conf

# Add the simple redirect rule if not already present
if ! grep -q 'proxy_redirect / /smartdrive/' /etc/nginx/conf.d/app.conf; then
    sed -i '/proxy_pass_request_headers on;/i\        proxy_redirect / /smartdrive/;' /etc/nginx/conf.d/app.conf
fi

echo '✅ Testing nginx configuration...'
nginx -t

if [ \$? -eq 0 ]; then
    echo '🔄 Reloading nginx...'
    nginx -s reload
    echo '✅ Nginx reloaded successfully!'
    
    echo '🧪 Testing SmartDrive endpoint...'
    curl -s -I http://localhost/smartdrive/ | grep Location || echo 'No redirect Location header found'
    
    echo '
🎉 Fix applied successfully!

Next steps:
1. Test SmartDrive iframe in your browser
2. The iframe should now show Nextcloud interface instead of white page
3. Check browser Network tab for any remaining 404 errors

Expected result: 
- ✅ Iframe loads Nextcloud login/interface
- ✅ No more /smartdrive/smartdrive/ double paths
- ✅ File browsing works correctly
    '
else
    echo '❌ Nginx configuration test failed!'
    echo 'Restoring backup...'
    cp /etc/nginx/conf.d/app.conf.backup.* /etc/nginx/conf.d/app.conf
    exit 1
fi
"

echo "�� Script completed!" 