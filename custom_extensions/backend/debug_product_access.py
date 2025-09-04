#!/usr/bin/env python3
"""
Debug script to test the product access endpoint directly.
"""

import asyncio
import sys
import os
import json
import httpx

async def test_product_access():
    """Test the product access endpoint."""
    print("🔍 Testing product access endpoint...")
    
    # Test data from the logs
    product_id = 22
    workspace_id = 2
    base_url = "http://localhost:8000"  # Adjust if needed
    
    # Test payload for granting workspace access
    payload = {
        "workspace_id": workspace_id,
        "access_type": "workspace",
        "target_id": None
    }
    
    print(f"📊 Testing product access grant:")
    print(f"   - Product ID: {product_id}")
    print(f"   - Workspace ID: {workspace_id}")
    print(f"   - Payload: {json.dumps(payload, indent=2)}")
    
    try:
        async with httpx.AsyncClient() as client:
            # Try to grant access
            response = await client.post(
                f"{base_url}/api/custom/products/{product_id}/access",
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "X-Dev-Onyx-User-ID": "volynetskolia@gmail.com"  # Dev header
                },
                timeout=10.0
            )
            
            print(f"\n📝 Response:")
            print(f"   - Status Code: {response.status_code}")
            print(f"   - Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   - Success! Access granted: {json.dumps(result, indent=2)}")
            else:
                print(f"   - Error Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Request failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_product_access()) 