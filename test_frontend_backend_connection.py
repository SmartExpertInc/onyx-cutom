#!/usr/bin/env python3
"""
Test script to check backend data and frontend connection
"""

import requests
import json
import os

def test_backend_data():
    """Test the backend /api/custom/projects-data endpoint"""
    
    # Backend URL (adjust as needed)
    backend_url = "http://localhost:8000"  # or your actual backend URL
    
    print("🧪 Testing Backend Data Flow")
    print("=" * 60)
    
    try:
        # Test the projects-data endpoint
        url = f"{backend_url}/api/custom/projects-data"
        
        # Headers that might be needed
        headers = {
            'Content-Type': 'application/json',
            'X-Dev-Onyx-User-ID': 'dummy-onyx-user-id-for-testing'
        }
        
        # Request body (empty for now, adjust as needed)
        data = {
            "selectedProjects": [],
            "clientName": "Test Client",
            "managerName": "Test Manager"
        }
        
        print(f"📡 Making request to: {url}")
        print(f"📋 Headers: {headers}")
        print(f"📦 Data: {data}")
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 200:
            response_data = response.json()
            print("✅ Success! Response data:")
            print(json.dumps(response_data, indent=2, default=str))
            
            # Check for quality_tier_sums
            if 'quality_tier_sums' in response_data:
                print("\n🎯 quality_tier_sums found!")
                quality_sums = response_data['quality_tier_sums']
                print(f"📊 Type: {type(quality_sums)}")
                print(f"🔑 Keys: {list(quality_sums.keys()) if isinstance(quality_sums, dict) else 'Not a dict'}")
                
                if isinstance(quality_sums, dict):
                    for tier, data in quality_sums.items():
                        print(f"  {tier}: completion_time={data.get('completion_time', 'N/A')}, creation_time={data.get('creation_time', 'N/A')}")
            else:
                print("❌ quality_tier_sums NOT found in response")
                
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"📄 Response text: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - is the backend running?")
    except requests.exceptions.Timeout:
        print("❌ Request timeout")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def test_frontend_backend_connection():
    """Test if frontend can connect to backend"""
    
    print("\n🌐 Testing Frontend-Backend Connection")
    print("=" * 60)
    
    # Test the custom backend proxy endpoint
    frontend_url = "http://localhost:3001"  # or your actual frontend URL
    
    try:
        # Test the proxy endpoint
        url = f"{frontend_url}/api/custom-projects-backend/projects-data"
        
        headers = {
            'Content-Type': 'application/json',
            'X-Dev-Onyx-User-ID': 'dummy-onyx-user-id-for-testing'
        }
        
        data = {
            "selectedProjects": [],
            "clientName": "Test Client",
            "managerName": "Test Manager"
        }
        
        print(f"📡 Making request to frontend proxy: {url}")
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 200:
            response_data = response.json()
            print("✅ Frontend proxy success!")
            
            if 'quality_tier_sums' in response_data:
                print("🎯 quality_tier_sums found in frontend proxy response!")
                quality_sums = response_data['quality_tier_sums']
                for tier, data in quality_sums.items():
                    print(f"  {tier}: completion_time={data.get('completion_time', 'N/A')}, creation_time={data.get('creation_time', 'N/A')}")
            else:
                print("❌ quality_tier_sums NOT found in frontend proxy response")
        else:
            print(f"❌ Frontend proxy error: {response.status_code}")
            print(f"📄 Response text: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - is the frontend running?")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_backend_data()
    test_frontend_backend_connection() 