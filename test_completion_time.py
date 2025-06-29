#!/usr/bin/env python3
"""
Test script to verify completion time functionality
"""

import requests
import json

def test_completion_time_api():
    """Test the lesson-data API endpoint to verify completion time is included"""
    
    # Test URL (adjust as needed)
    base_url = "http://localhost:8000"
    
    # Test project ID (you may need to adjust this to a real project ID)
    test_project_id = 1
    
    try:
        # Make request to the lesson-data endpoint
        response = requests.get(
            f"{base_url}/api/custom/projects/{test_project_id}/lesson-data",
            headers={
                "Content-Type": "application/json",
                "X-Dev-Onyx-User-ID": "dummy-onyx-user-id-for-testing"
            }
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Response Data:")
            print(json.dumps(data, indent=2))
            
            # Check if completionTime is present
            if "completionTime" in data:
                print("✅ Completion time field is present!")
                print(f"Completion time: {data['completionTime']} minutes")
            else:
                print("❌ Completion time field is missing!")
                
        else:
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the backend server. Make sure it's running on localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("Testing Completion Time API...")
    test_completion_time_api() 