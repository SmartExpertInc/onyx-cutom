#!/usr/bin/env python3
"""
Manual cleanup test script for Smart Drive default files.
This can be run to manually trigger cleanup for debugging purposes.
"""

import asyncio
import httpx
import os
import sys
import logging
from urllib.parse import urlparse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def manual_cleanup_test(userid: str, password: str):
    """Manually run cleanup for a specific user to test thoroughness"""
    
    base_url = os.environ.get("NEXTCLOUD_BASE_URL", "https://nc1.contentbuilder.ai")
    
    logger.info(f"🧹 Manual cleanup test for user: {userid}")
    logger.info(f"📡 Nextcloud URL: {base_url}")
    
    webdav_base = f"{base_url}/remote.php/dav/files/{userid}"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # First, see what files exist
            logger.info("📋 Checking current files...")
            prop = await client.request(
                "PROPFIND",
                f"{webdav_base}/",
                auth=(userid, password),
                headers={"Depth": "1", "Content-Type": "application/xml"},
                content="""<?xml version="1.0"?>
                <d:propfind xmlns:d="DAV:">
                  <d:prop>
                    <d:displayname/>
                    <d:resourcetype/>
                    <d:getcontentlength/>
                  </d:prop>
                </d:propfind>"""
            )
            
            if prop.status_code == 207:
                import xml.etree.ElementTree as ET
                root = ET.fromstring(prop.text)
                current_files = []
                
                for resp in root.findall('.//{DAV:}response'):
                    href = resp.find('.//{DAV:}href')
                    if not href or not href.text:
                        continue
                        
                    h = href.text
                    if h.rstrip('/') == f"/remote.php/dav/files/{userid}":
                        continue
                        
                    display_elem = resp.find('.//{DAV:}displayname')
                    display_name = display_elem.text if display_elem is not None and display_elem.text else h.split('/')[-1]
                    
                    size_elem = resp.find('.//{DAV:}getcontentlength')
                    size = f" ({size_elem.text} bytes)" if size_elem is not None and size_elem.text else ""
                    
                    current_files.append((h, display_name, size))
                
                if current_files:
                    logger.info(f"📁 Found {len(current_files)} files:")
                    for h, name, size in current_files:
                        logger.info(f"   - {name}{size}")
                        
                    # Now try to delete them
                    deleted_count = 0
                    logger.info("🗑️  Attempting to delete files...")
                    
                    for h, name, size in current_files:
                        try:
                            del_url = f"{base_url}{h}"
                            delete_resp = await client.delete(del_url, auth=(userid, password))
                            if delete_resp.status_code in (204, 404):
                                deleted_count += 1
                                logger.info(f"   ✅ Deleted: {name}")
                            else:
                                logger.error(f"   ❌ Failed to delete {name}: HTTP {delete_resp.status_code}")
                                logger.error(f"      Response: {delete_resp.text[:200]}")
                        except Exception as e:
                            logger.error(f"   ❌ Exception deleting {name}: {e}")
                    
                    logger.info(f"🏁 Manual cleanup complete: {deleted_count}/{len(current_files)} files deleted")
                    
                    # Final check
                    logger.info("🔍 Final verification...")
                    await asyncio.sleep(1)
                    
                    final_prop = await client.request(
                        "PROPFIND", f"{webdav_base}/", auth=(userid, password),
                        headers={"Depth": "1", "Content-Type": "application/xml"},
                        content='<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:prop><d:displayname/></d:prop></d:propfind>'
                    )
                    
                    if final_prop.status_code == 207:
                        final_root = ET.fromstring(final_prop.text)
                        final_count = 0
                        for resp in final_root.findall('.//{DAV:}response'):
                            href = resp.find('.//{DAV:}href')
                            if href and href.text and href.text.rstrip('/') != f"/remote.php/dav/files/{userid}":
                                final_count += 1
                                
                        if final_count == 0:
                            logger.info("✅ SUCCESS: Account is completely clean!")
                        else:
                            logger.warning(f"⚠️  Still {final_count} files remaining after cleanup")
                    
                else:
                    logger.info("✅ No files found - account is already clean")
                    
            else:
                logger.error(f"❌ Failed to list files: HTTP {prop.status_code}")
                logger.error(f"Response: {prop.text[:500]}")
                
    except Exception as e:
        logger.error(f"❌ Manual cleanup failed: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python test_manual_cleanup.py <userid> <password>")
        print("Example: python test_manual_cleanup.py sd_9dc212d3674241be9328716d mypassword123")
        sys.exit(1)
    
    userid = sys.argv[1]
    password = sys.argv[2]
    
    asyncio.run(manual_cleanup_test(userid, password)) 