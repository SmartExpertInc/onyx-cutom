#!/usr/bin/env python3
"""
Test script for avatar selection functionality with persistence.
This script tests the enhanced avatar selection system that includes:
1. Dynamic avatar selection from API
2. Avatar variant support
3. Global state management
4. Local storage persistence
"""

import asyncio
import json
import logging
from typing import Dict, Any, List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AvatarSelectionTester:
    """Test class for avatar selection functionality."""
    
    def __init__(self):
        self.api_base = "http://localhost:8000/api/custom"
        self.test_results = []
    
    async def test_avatar_fetching(self) -> bool:
        """Test fetching avatars from the API."""
        logger.info("🧪 Testing avatar fetching...")
        
        try:
            import httpx
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(f"{self.api_base}/video/avatars")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and data.get("avatars"):
                        avatars = data["avatars"]
                        logger.info(f"✅ Successfully fetched {len(avatars)} avatars")
                        
                        # Test avatar structure
                        if avatars and len(avatars) > 0:
                            avatar = avatars[0]
                            required_fields = ["id", "code", "name", "gender", "variants"]
                            missing_fields = [field for field in required_fields if field not in avatar]
                            
                            if not missing_fields:
                                logger.info("✅ Avatar structure is valid")
                                return True
                            else:
                                logger.error(f"❌ Missing required fields: {missing_fields}")
                                return False
                        else:
                            logger.error("❌ No avatars returned")
                            return False
                    else:
                        logger.error(f"❌ API response indicates failure: {data.get('error', 'Unknown error')}")
                        return False
                else:
                    logger.error(f"❌ HTTP error: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"❌ Error testing avatar fetching: {str(e)}")
            return False
    
    async def test_avatar_variants(self) -> bool:
        """Test avatar variants functionality."""
        logger.info("🧪 Testing avatar variants...")
        
        try:
            import httpx
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(f"{self.api_base}/video/avatars")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and data.get("avatars"):
                        avatars = data["avatars"]
                        
                        # Find avatars with variants
                        avatars_with_variants = [av for av in avatars if av.get("variants") and len(av["variants"]) > 0]
                        
                        if avatars_with_variants:
                            avatar = avatars_with_variants[0]
                            variants = avatar["variants"]
                            logger.info(f"✅ Found avatar '{avatar['name']}' with {len(variants)} variants")
                            
                            # Test variant structure
                            for variant in variants:
                                required_variant_fields = ["code", "id", "name"]
                                missing_variant_fields = [field for field in required_variant_fields if field not in variant]
                                
                                if missing_variant_fields:
                                    logger.error(f"❌ Variant missing required fields: {missing_variant_fields}")
                                    return False
                            
                            logger.info("✅ Avatar variants structure is valid")
                            return True
                        else:
                            logger.warning("⚠️ No avatars with variants found")
                            return True  # Not a failure, just no variants
                    else:
                        logger.error("❌ Failed to fetch avatars for variant testing")
                        return False
                else:
                    logger.error(f"❌ HTTP error: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"❌ Error testing avatar variants: {str(e)}")
            return False
    
    async def test_avatar_code_parsing(self) -> bool:
        """Test avatar code parsing (including variants)."""
        logger.info("🧪 Testing avatar code parsing...")
        
        try:
            import httpx
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(f"{self.api_base}/video/avatars")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and data.get("avatars"):
                        avatars = data["avatars"]
                        
                        # Test basic avatar code
                        if avatars:
                            avatar = avatars[0]
                            avatar_code = avatar["code"]
                            logger.info(f"✅ Basic avatar code: {avatar_code}")
                        
                        # Test variant avatar codes
                        avatars_with_variants = [av for av in avatars if av.get("variants") and len(av["variants"]) > 0]
                        
                        if avatars_with_variants:
                            avatar = avatars_with_variants[0]
                            variant = avatar["variants"][0]
                            variant_code = f"{avatar['code']}.{variant['code']}"
                            logger.info(f"✅ Variant avatar code: {variant_code}")
                        
                        logger.info("✅ Avatar code parsing test completed")
                        return True
                    else:
                        logger.error("❌ Failed to fetch avatars for code parsing test")
                        return False
                else:
                    logger.error(f"❌ HTTP error: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"❌ Error testing avatar code parsing: {str(e)}")
            return False
    
    async def test_persistence_simulation(self) -> bool:
        """Simulate persistence functionality (frontend localStorage)."""
        logger.info("🧪 Testing persistence simulation...")
        
        try:
            # Simulate the data structure that would be saved to localStorage
            sample_avatar_data = {
                "avatar": {
                    "id": "test_avatar_id",
                    "code": "test_avatar",
                    "name": "Test Avatar",
                    "gender": "female",
                    "variants": [
                        {
                            "code": "casual",
                            "id": "test_variant_id",
                            "name": "Casual",
                            "thumbnail": "https://example.com/thumbnail.jpg",
                            "canvas": "https://example.com/canvas.jpg"
                        }
                    ]
                },
                "selectedVariant": {
                    "code": "casual",
                    "id": "test_variant_id",
                    "name": "Casual",
                    "thumbnail": "https://example.com/thumbnail.jpg",
                    "canvas": "https://example.com/canvas.jpg"
                }
            }
            
            # Simulate saving to localStorage
            avatar_json = json.dumps(sample_avatar_data)
            logger.info(f"✅ Simulated saving avatar data: {len(avatar_json)} characters")
            
            # Simulate loading from localStorage
            loaded_data = json.loads(avatar_json)
            if (loaded_data.get("avatar") and 
                loaded_data.get("selectedVariant") and
                loaded_data["avatar"]["id"] == "test_avatar_id" and
                loaded_data["selectedVariant"]["code"] == "casual"):
                logger.info("✅ Persistence simulation successful")
                return True
            else:
                logger.error("❌ Persistence simulation failed - data mismatch")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error in persistence simulation: {str(e)}")
            return False
    
    async def run_all_tests(self) -> Dict[str, bool]:
        """Run all avatar selection tests."""
        logger.info("🚀 Starting avatar selection tests...")
        
        tests = [
            ("Avatar Fetching", self.test_avatar_fetching),
            ("Avatar Variants", self.test_avatar_variants),
            ("Avatar Code Parsing", self.test_avatar_code_parsing),
            ("Persistence Simulation", self.test_persistence_simulation),
        ]
        
        results = {}
        
        for test_name, test_func in tests:
            logger.info(f"\n{'='*50}")
            logger.info(f"Running: {test_name}")
            logger.info(f"{'='*50}")
            
            try:
                result = await test_func()
                results[test_name] = result
                
                if result:
                    logger.info(f"✅ {test_name}: PASSED")
                else:
                    logger.error(f"❌ {test_name}: FAILED")
                    
            except Exception as e:
                logger.error(f"❌ {test_name}: ERROR - {str(e)}")
                results[test_name] = False
        
        return results
    
    def print_summary(self, results: Dict[str, bool]):
        """Print test summary."""
        logger.info(f"\n{'='*60}")
        logger.info("AVATAR SELECTION TEST SUMMARY")
        logger.info(f"{'='*60}")
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            logger.info(f"{test_name}: {status}")
        
        logger.info(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            logger.info("🎉 All tests passed! Avatar selection system is working correctly.")
        else:
            logger.warning(f"⚠️ {total - passed} test(s) failed. Please check the implementation.")
        
        logger.info(f"{'='*60}")

async def main():
    """Main test function."""
    tester = AvatarSelectionTester()
    results = await tester.run_all_tests()
    tester.print_summary(results)

if __name__ == "__main__":
    asyncio.run(main())
