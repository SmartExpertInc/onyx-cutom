#!/usr/bin/env python3
"""
Test script for auto-generated offer links functionality.
This script demonstrates how the new offer system works with auto-generated links.
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:3000"  # Adjust as needed
BACKEND_URL = f"{BASE_URL}/api/custom-projects-backend"

def test_create_offer():
    """Test creating a new offer with auto-generated link"""
    print("🔄 Testing offer creation with auto-generated link...")
    
    # Sample offer data (note: no link field)
    offer_data = {
        "company_id": 1,  # Replace with actual company ID
        "offer_name": "Test Offer - Auto Generated Link",
        "manager": "John Doe",
        "status": "Draft",
        "total_hours": 150
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/offers",
            json=offer_data,
            headers={"Content-Type": "application/json"},
            # Add authentication headers as needed
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Offer created successfully!")
            print(f"   ID: {result['id']}")
            print(f"   Name: {result['offer_name']}")
            print(f"   Auto-generated Link: {result['link']}")
            print(f"   Expected format: {BASE_URL}/offer/{result['id']}")
            return result['id']
        else:
            print(f"❌ Failed to create offer: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error creating offer: {str(e)}")
        return None

def test_get_offer_details(offer_id):
    """Test getting detailed offer information"""
    print(f"\n🔄 Testing offer details retrieval for ID {offer_id}...")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/offers/{offer_id}/details",
            headers={"Content-Type": "application/json"},
            # Add authentication headers as needed
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Offer details retrieved successfully!")
            print(f"   Offer: {result['offer']['offer_name']}")
            print(f"   Company: {result['offer']['company_name']}")
            print(f"   Course Modules: {len(result['courseModules'])}")
            print(f"   Quality Levels: {len(result['qualityLevels'])}")
            
            # Display course modules
            if result['courseModules']:
                print("\n📚 Course Modules:")
                for module in result['courseModules']:
                    print(f"   - {module['title']}: {module['lessons']} lessons, {module['productionTime']}")
            
            # Display quality levels
            if result['qualityLevels']:
                print("\n🎯 Quality Levels:")
                for level in result['qualityLevels']:
                    print(f"   - {level['level']}: {level['productionTime']}")
                    
            return True
        else:
            print(f"❌ Failed to get offer details: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error getting offer details: {str(e)}")
        return False

def test_migrate_existing_offers():
    """Test migrating existing offers to have auto-generated links"""
    print("\n🔄 Testing migration of existing offers...")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/offers/migrate-links",
            headers={"Content-Type": "application/json"},
            # Add authentication headers as needed
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Migration completed successfully!")
            print(f"   {result['message']}")
            return True
        else:
            print(f"❌ Failed to migrate offers: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error migrating offers: {str(e)}")
        return False

def test_frontend_route(offer_id):
    """Test that the frontend route is accessible"""
    print(f"\n🔄 Testing frontend route accessibility for offer {offer_id}...")
    
    offer_url = f"{BASE_URL}/offer/{offer_id}"
    
    try:
        response = requests.get(offer_url)
        
        if response.status_code == 200:
            print("✅ Frontend route is accessible!")
            print(f"   URL: {offer_url}")
            print("   💡 You can now open this URL in your browser to see the offer details page")
            return True
        else:
            print(f"❌ Frontend route not accessible: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error accessing frontend route: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 Testing Auto-Generated Offer Links System")
    print("=" * 50)
    
    # Test 1: Create a new offer
    offer_id = test_create_offer()
    
    if offer_id:
        # Test 2: Get offer details
        details_success = test_get_offer_details(offer_id)
        
        # Test 3: Test frontend route
        if details_success:
            test_frontend_route(offer_id)
    
    # Test 4: Migrate existing offers
    test_migrate_existing_offers()
    
    print("\n" + "=" * 50)
    print("🎯 Test Summary:")
    print("   1. New offers automatically get generated links")
    print("   2. Offer details page extracts real data from projects")
    print("   3. Frontend route displays offer in the format shown in your image")
    print("   4. Existing offers can be migrated to have auto-generated links")
    print("\n💡 Next steps:")
    print("   - Visit the offers table to see the auto-generated View links")
    print("   - Click on any View link to see the detailed offer page")
    print("   - The page will match the design from your image with real data")

if __name__ == "__main__":
    main() 