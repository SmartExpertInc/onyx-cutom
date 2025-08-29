#!/usr/bin/env python3
"""
Script to fix offer URLs and update them to the correct custom-projects-ui path
"""

import requests
import json

# Configuration  
BASE_URL = "https://ml-dev.contentbuilder.ai"
BACKEND_URL = f"{BASE_URL}/api/custom-projects-backend"

def migrate_offers():
    """Migrate all offers to have correct URLs"""
    print("🔄 Migrating offers to correct URL structure...")
    
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

def test_offer_url(offer_id):
    """Test if an offer URL is working"""
    url = f"{BASE_URL}/custom-projects-ui/offer/{offer_id}"
    print(f"🔄 Testing offer URL: {url}")
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            if "Loading offer details..." in response.text:
                print("⚠️  Page loads but shows 'Loading offer details...' - API may need authentication")
            else:
                print("✅ Offer page loads successfully!")
        else:
            print(f"❌ Offer page returned {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing URL: {str(e)}")

def main():
    print("🚀 Fixing Offer URLs")
    print("=" * 40)
    
    # Step 1: Migrate offers
    migrate_success = migrate_offers()
    
    if migrate_success:
        print("\n" + "=" * 40)
        # Step 2: Test offer ID 5 (from your example)
        test_offer_url(5)
        
        print("\n📋 Next Steps:")
        print("1. Refresh your offers table page")
        print("2. All offers should now show 'View' links")
        print("3. Click any 'View' link to access the offer details")
        print("4. The URLs will now be in format: /custom-projects-ui/offer/{id}")

if __name__ == "__main__":
    main() 