#!/usr/bin/env python3
"""
Test script to fix and verify offer links functionality.
This script will help diagnose and fix the link generation issue.
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:3000"  # Adjust as needed
BACKEND_URL = f"{BASE_URL}/api/custom-projects-backend"

def test_migration():
    """Test migrating existing offers to have auto-generated links"""
    print("🔄 Testing migration of existing offers...")
    
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

def test_get_all_offers():
    """Get all offers and check their links"""
    print("\n🔄 Getting all offers to check links...")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/offers",
            headers={"Content-Type": "application/json"},
            # Add authentication headers as needed
        )
        
        if response.status_code == 200:
            offers = response.json()
            print(f"✅ Found {len(offers)} offers:")
            
            for offer in offers:
                link_status = "✅ Has link" if offer.get('link') else "❌ No link"
                print(f"   Offer {offer['id']}: {offer['offer_name']} - {link_status}")
                if offer.get('link'):
                    print(f"      Link: {offer['link']}")
                
            return offers
        else:
            print(f"❌ Failed to get offers: {response.status_code}")
            print(f"   Error: {response.text}")
            return []
            
    except Exception as e:
        print(f"❌ Error getting offers: {str(e)}")
        return []

def test_create_new_offer():
    """Test creating a new offer to see if link is generated"""
    print("\n🔄 Testing creation of new offer...")
    
    # Sample offer data (note: no link field)
    offer_data = {
        "company_id": 1,  # Replace with actual company ID
        "offer_name": "Test Offer - Link Fix",
        "manager": "Test Manager",
        "status": "Draft",
        "total_hours": 100
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
            print(f"   Link: {result.get('link', 'NO LINK!')}")
            
            if result.get('link'):
                print(f"   ✅ Link generated correctly: {result['link']}")
            else:
                print(f"   ❌ Link not generated!")
                
            return result.get('id')
        else:
            print(f"❌ Failed to create offer: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error creating offer: {str(e)}")
        return None

def check_database_links():
    """Check what's actually in the database"""
    print("\n🔄 Checking database for link values...")
    
    offers = test_get_all_offers()
    if offers:
        null_links = [o for o in offers if not o.get('link')]
        empty_links = [o for o in offers if o.get('link') == '']
        valid_links = [o for o in offers if o.get('link') and o.get('link') != '']
        
        print(f"\n📊 Link Status Summary:")
        print(f"   Offers with valid links: {len(valid_links)}")
        print(f"   Offers with null links: {len(null_links)}")
        print(f"   Offers with empty links: {len(empty_links)}")
        
        if null_links or empty_links:
            print(f"\n⚠️  Found {len(null_links) + len(empty_links)} offers needing link migration")
            return False
        else:
            print(f"\n✅ All offers have valid links")
            return True
    
    return False

def main():
    """Main test function"""
    print("🚀 Testing Offer Links Fix")
    print("=" * 50)
    
    # Step 1: Check current state
    all_good = check_database_links()
    
    if not all_good:
        # Step 2: Run migration
        print("\n" + "=" * 30)
        migration_success = test_migration()
        
        if migration_success:
            # Step 3: Check again after migration
            print("\n" + "=" * 30)
            check_database_links()
    
    # Step 4: Test new offer creation
    print("\n" + "=" * 30)
    new_offer_id = test_create_new_offer()
    
    print("\n" + "=" * 50)
    print("🎯 Summary:")
    print("1. Check your browser console for debug logs when viewing the offers table")
    print("2. Look at backend logs for link generation details")
    print("3. If links are still showing as '-', check the browser network tab")
    print("4. Verify the CUSTOM_BACKEND_URL environment variable is correct")
    
    if new_offer_id:
        expected_link = f"{BASE_URL}/offer/{new_offer_id}"
        print(f"\n💡 Expected link format: {expected_link}")
        print(f"   Try visiting this URL directly to test the offer detail page")

if __name__ == "__main__":
    main() 