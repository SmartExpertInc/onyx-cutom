#!/usr/bin/env python3
"""
Test Avatar Selection Functionality
==================================

This script tests the avatar selection functionality by:
1. Fetching avatars from the API
2. Testing avatar code parsing (including variants)
3. Verifying the backend can handle different avatar codes
"""

import asyncio
import json
import logging
from typing import Dict, Any, List

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

class AvatarSelectionTester:
    def __init__(self):
        self.api_base = "http://localhost:8000"  # Adjust if needed
        
    async def test_avatar_fetching(self):
        """Test fetching avatars from the API."""
        logger.info("Testing avatar fetching...")
        
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.api_base}/api/custom/video/avatars")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        avatars = data.get("avatars", [])
                        logger.info(f"✅ Successfully fetched {len(avatars)} avatars")
                        
                        # Log some avatar examples
                        for i, avatar in enumerate(avatars[:5]):
                            logger.info(f"  Avatar {i+1}: {avatar.get('name')} (code: {avatar.get('code')})")
                            if avatar.get('variants'):
                                logger.info(f"    Variants: {[v.get('name') for v in avatar['variants']]}")
                        
                        return avatars
                    else:
                        logger.error(f"❌ API returned error: {data.get('error')}")
                        return []
                else:
                    logger.error(f"❌ HTTP error: {response.status_code}")
                    return []
                    
        except Exception as e:
            logger.error(f"❌ Exception during avatar fetching: {e}")
            return []
    
    def test_avatar_code_parsing(self, avatars: List[Dict[str, Any]]):
        """Test parsing avatar codes with variants."""
        logger.info("Testing avatar code parsing...")
        
        test_cases = [
            "gia",  # Base avatar
            "gia.casual",  # Avatar with variant
            "dylan.business",  # Another avatar with variant
            "nonexistent",  # Non-existent avatar
            "gia.nonexistent",  # Non-existent variant
        ]
        
        for test_code in test_cases:
            logger.info(f"Testing avatar code: {test_code}")
            
            if '.' in test_code:
                base_code, variant_code = test_code.split('.', 1)
                logger.info(f"  Base code: {base_code}, Variant code: {variant_code}")
                
                # Find avatar
                avatar = None
                selected_variant = None
                
                for av in avatars:
                    if av.get("code") == base_code:
                        logger.info(f"  Found base avatar: {av.get('name')}")
                        
                        # Check for variant
                        if av.get("variants"):
                            for variant in av["variants"]:
                                if variant.get("code") == variant_code:
                                    selected_variant = variant
                                    logger.info(f"  Found variant: {variant.get('name')}")
                                    break
                        
                        avatar = av
                        break
                
                if avatar and selected_variant:
                    logger.info(f"  ✅ Successfully parsed: {test_code}")
                elif avatar:
                    logger.info(f"  ⚠️  Found avatar but no variant: {test_code}")
                else:
                    logger.info(f"  ❌ Not found: {test_code}")
            else:
                # No variant
                avatar = None
                for av in avatars:
                    if av.get("code") == test_code:
                        avatar = av
                        break
                
                if avatar:
                    logger.info(f"  ✅ Found base avatar: {test_code}")
                else:
                    logger.info(f"  ❌ Not found: {test_code}")
    
    def test_avatar_data_structure(self, avatars: List[Dict[str, Any]]):
        """Test that avatar data has the expected structure."""
        logger.info("Testing avatar data structure...")
        
        required_fields = ["id", "code", "name", "gender"]
        optional_fields = ["thumbnail", "canvas", "variants"]
        
        for i, avatar in enumerate(avatars[:3]):  # Test first 3 avatars
            logger.info(f"Testing avatar {i+1}: {avatar.get('name')}")
            
            # Check required fields
            missing_required = []
            for field in required_fields:
                if field not in avatar:
                    missing_required.append(field)
            
            if missing_required:
                logger.warning(f"  ⚠️  Missing required fields: {missing_required}")
            else:
                logger.info(f"  ✅ All required fields present")
            
            # Check optional fields
            present_optional = []
            for field in optional_fields:
                if field in avatar:
                    present_optional.append(field)
            
            logger.info(f"  Optional fields present: {present_optional}")
            
            # Check variants structure if present
            if "variants" in avatar and avatar["variants"]:
                logger.info(f"  Variants count: {len(avatar['variants'])}")
                for j, variant in enumerate(avatar["variants"][:2]):  # Check first 2 variants
                    logger.info(f"    Variant {j+1}: {variant.get('name')} (code: {variant.get('code')})")
                    if variant.get('canvas'):
                        logger.info(f"      Canvas URL: {variant['canvas'][:50]}...")
                    else:
                        logger.warning(f"      ⚠️  No canvas URL")

async def main():
    """Main test function."""
    logger.info("Starting Avatar Selection Test")
    logger.info("=" * 50)
    
    tester = AvatarSelectionTester()
    
    # Test 1: Fetch avatars
    avatars = await tester.test_avatar_fetching()
    
    if not avatars:
        logger.error("❌ No avatars fetched, cannot continue testing")
        return
    
    logger.info("")
    
    # Test 2: Test avatar code parsing
    tester.test_avatar_code_parsing(avatars)
    
    logger.info("")
    
    # Test 3: Test data structure
    tester.test_avatar_data_structure(avatars)
    
    logger.info("")
    logger.info("Avatar Selection Test Complete")
    logger.info("=" * 50)

if __name__ == "__main__":
    asyncio.run(main())
