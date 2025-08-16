#!/usr/bin/env python3
"""
Test script for SmartDrive (Nextcloud) integration
"""
import os
import asyncio
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.services.nextcloud_service import NextcloudService
from app.utils.smartdrive import SmartDriveManager

async def test_smartdrive():
    """Test SmartDrive functionality"""
    print("🔧 Testing SmartDrive Integration...")
    
    # Configuration (you can set these as environment variables)
    nextcloud_url = os.getenv("NEXTCLOUD_URL", "https://nc1.contentbuilder.ai")
    admin_username = os.getenv("NEXTCLOUD_ADMIN_USERNAME", "admin")
    admin_password = os.getenv("NEXTCLOUD_ADMIN_PASSWORD", "")
    
    if not admin_password:
        print("❌ Error: NEXTCLOUD_ADMIN_PASSWORD environment variable is required")
        print("   Set it with: export NEXTCLOUD_ADMIN_PASSWORD='your_password'")
        return False
    
    print(f"📡 Connecting to Nextcloud at: {nextcloud_url}")
    
    try:
        # Test 1: Health Check
        print("\n1️⃣ Testing health check...")
        smartdrive_manager = SmartDriveManager()
        is_healthy = smartdrive_manager.health_check()
        print(f"   Health check: {'✅ PASS' if is_healthy else '❌ FAIL'}")
        
        if not is_healthy:
            print("   Make sure Nextcloud is running and accessible")
            return False
        
        # Test 2: User Creation
        print("\n2️⃣ Testing user creation...")
        test_email = "test@example.com"
        test_password = "TestPassword123!"
        
        result = smartdrive_manager.ensure_user_access(
            user_email=test_email,
            user_password=test_password,
            display_name="Test User"
        )
        
        if result["success"]:
            print(f"   User creation: ✅ PASS")
            print(f"   Username: {result['username']}")
            print(f"   User exists: {result['user_exists']}")
            print(f"   Iframe URL: {result['iframe_url']}")
        else:
            print(f"   User creation: ❌ FAIL - {result['error']}")
            return False
        
        # Test 3: User Info Retrieval
        print("\n3️⃣ Testing user info retrieval...")
        user_info = smartdrive_manager.get_user_info(result["username"])
        if user_info:
            print(f"   User info: ✅ PASS")
            print(f"   Email: {user_info.get('email', 'N/A')}")
            print(f"   Display name: {user_info.get('displayname', 'N/A')}")
        else:
            print(f"   User info: ❌ FAIL")
        
        print("\n🎉 SmartDrive integration test completed successfully!")
        print(f"\n🔗 Access your SmartDrive at: {nextcloud_url}")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        return False

if __name__ == "__main__":
    print("SmartDrive Integration Test")
    print("=" * 50)
    
    # Check if running from correct directory
    if not Path("app").exists():
        print("❌ Error: Run this script from the backend directory")
        print("   cd custom_extensions/backend && python test_smartdrive.py")
        sys.exit(1)
    
    success = asyncio.run(test_smartdrive())
    sys.exit(0 if success else 1) 