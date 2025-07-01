#!/usr/bin/env python3
"""
Test script for nested folder functionality
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/custom-projects-backend"

def test_nested_folders():
    """Test the nested folder functionality"""
    
    # Headers for requests
    headers = {
        'Content-Type': 'application/json',
        'X-Dev-Onyx-User-ID': 'dummy-onyx-user-id-for-testing'
    }
    
    print("🧪 Testing Nested Folder Functionality")
    print("=" * 50)
    
    # Step 1: Create root folders
    print("\n1. Creating root folders...")
    root_folders = []
    
    for i in range(3):
        folder_data = {
            "name": f"Root Folder {i+1}",
            "parent_id": None
        }
        
        response = requests.post(f"{API_BASE}/projects/folders", 
                               headers=headers, 
                               json=folder_data)
        
        if response.status_code == 200:
            folder = response.json()
            root_folders.append(folder)
            print(f"   ✅ Created: {folder['name']} (ID: {folder['id']})")
        else:
            print(f"   ❌ Failed to create root folder {i+1}: {response.status_code}")
            return
    
    # Step 2: Create nested folders
    print("\n2. Creating nested folders...")
    nested_folders = []
    
    for i, root_folder in enumerate(root_folders):
        for j in range(2):
            folder_data = {
                "name": f"Nested Folder {i+1}.{j+1}",
                "parent_id": root_folder['id']
            }
            
            response = requests.post(f"{API_BASE}/projects/folders", 
                                   headers=headers, 
                                   json=folder_data)
            
            if response.status_code == 200:
                folder = response.json()
                nested_folders.append(folder)
                print(f"   ✅ Created: {folder['name']} (ID: {folder['id']}, Parent: {folder['parent_id']})")
            else:
                print(f"   ❌ Failed to create nested folder {i+1}.{j+1}: {response.status_code}")
    
    # Step 3: Create deeply nested folders
    print("\n3. Creating deeply nested folders...")
    deep_folders = []
    
    for nested_folder in nested_folders[:2]:  # Only use first 2 nested folders
        folder_data = {
            "name": f"Deep Folder {nested_folder['id']}",
            "parent_id": nested_folder['id']
        }
        
        response = requests.post(f"{API_BASE}/projects/folders", 
                               headers=headers, 
                               json=folder_data)
        
        if response.status_code == 200:
            folder = response.json()
            deep_folders.append(folder)
            print(f"   ✅ Created: {folder['name']} (ID: {folder['id']}, Parent: {folder['parent_id']})")
        else:
            print(f"   ❌ Failed to create deep folder: {response.status_code}")
    
    # Step 4: List all folders to verify structure
    print("\n4. Listing all folders...")
    response = requests.get(f"{API_BASE}/projects/folders", headers=headers)
    
    if response.status_code == 200:
        folders = response.json()
        print(f"   📁 Total folders: {len(folders)}")
        
        # Group by parent_id
        by_parent = {}
        for folder in folders:
            parent_id = folder.get('parent_id')
            if parent_id not in by_parent:
                by_parent[parent_id] = []
            by_parent[parent_id].append(folder)
        
        print("\n   📂 Folder Structure:")
        print_folder_tree(by_parent, None, 0)
    else:
        print(f"   ❌ Failed to list folders: {response.status_code}")
    
    # Step 5: Test moving folders
    print("\n5. Testing folder moves...")
    
    if nested_folders and root_folders:
        # Move a nested folder to a different root
        folder_to_move = nested_folders[0]
        new_parent = root_folders[1]['id']
        
        move_data = {"parent_id": new_parent}
        response = requests.put(f"{API_BASE}/projects/folders/{folder_to_move['id']}/move", 
                              headers=headers, 
                              json=move_data)
        
        if response.status_code == 200:
            print(f"   ✅ Moved folder '{folder_to_move['name']}' to parent {new_parent}")
        else:
            print(f"   ❌ Failed to move folder: {response.status_code}")
    
    # Step 6: Test circular reference prevention
    print("\n6. Testing circular reference prevention...")
    
    if root_folders and nested_folders:
        # Try to move a parent into its own child
        parent_folder = root_folders[0]
        child_folder = nested_folders[0]
        
        move_data = {"parent_id": child_folder['id']}
        response = requests.put(f"{API_BASE}/projects/folders/{parent_folder['id']}/move", 
                              headers=headers, 
                              json=move_data)
        
        if response.status_code == 400:
            print("   ✅ Correctly prevented circular reference")
        else:
            print(f"   ❌ Failed to prevent circular reference: {response.status_code}")
    
    # Step 7: Final folder structure
    print("\n7. Final folder structure...")
    response = requests.get(f"{API_BASE}/projects/folders", headers=headers)
    
    if response.status_code == 200:
        folders = response.json()
        by_parent = {}
        for folder in folders:
            parent_id = folder.get('parent_id')
            if parent_id not in by_parent:
                by_parent[parent_id] = []
            by_parent[parent_id].append(folder)
        
        print_folder_tree(by_parent, None, 0)
    
    print("\n🎉 Nested folder testing completed!")

def print_folder_tree(by_parent, parent_id, level):
    """Print folder tree structure"""
    folders = by_parent.get(parent_id, [])
    
    for folder in folders:
        indent = "  " * level
        print(f"{indent}📁 {folder['name']} (ID: {folder['id']})")
        print_folder_tree(by_parent, folder['id'], level + 1)

if __name__ == "__main__":
    test_nested_folders() 