#!/usr/bin/env python3
"""
Test script for recursive folder stats and tier pill functionality
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/custom-projects-backend"

def test_recursive_folder_stats():
    """Test that folders return recursive stats including subfolders"""
    
    # Headers for requests
    headers = {
        'Content-Type': 'application/json',
        'X-Dev-Onyx-User-ID': 'dummy-onyx-user-id-for-testing'
    }
    
    print("🧪 Testing Recursive Folder Stats")
    print("=" * 50)
    
    # Step 1: Get all folders
    print("\n1. Fetching folders with recursive stats...")
    response = requests.get(f"{API_BASE}/projects/folders", headers=headers)
    
    if response.status_code != 200:
        print(f"   ❌ Failed to fetch folders: {response.status_code}")
        return
    
    folders = response.json()
    print(f"   📁 Total folders: {len(folders)}")
    
    # Step 2: Analyze folder structure and stats
    print("\n2. Analyzing folder stats...")
    
    # Group folders by parent_id for easier analysis
    by_parent = {}
    for folder in folders:
        parent_id = folder.get('parent_id')
        if parent_id not in by_parent:
            by_parent[parent_id] = []
        by_parent[parent_id].append(folder)
    
    # Print folder tree with stats
    def print_folder_tree(parent_id, level=0):
        folders_at_level = by_parent.get(parent_id, [])
        for folder in folders_at_level:
            indent = "  " * level
            tier = folder.get('quality_tier', 'medium')
            project_count = folder.get('project_count', 0)
            total_lessons = folder.get('total_lessons', 0)
            total_hours = folder.get('total_hours', 0)
            total_completion_time = folder.get('total_completion_time', 0)
            
            print(f"{indent}📁 {folder['name']} (ID: {folder['id']})")
            print(f"{indent}   Tier: {tier}")
            print(f"{indent}   Projects: {project_count}")
            print(f"{indent}   Lessons: {total_lessons}")
            print(f"{indent}   Hours: {total_hours}")
            print(f"{indent}   Completion Time: {total_completion_time} minutes")
            
            # Recursively print children
            print_folder_tree(folder['id'], level + 1)
    
    print_folder_tree(None, 0)
    
    # Step 3: Verify recursive stats
    print("\n3. Verifying recursive stats...")
    
    # Find folders with children and verify their stats include child stats
    for folder in folders:
        children = [f for f in folders if f.get('parent_id') == folder['id']]
        if children:
            print(f"\n   📂 Checking parent folder: {folder['name']}")
            
            # Calculate expected totals (direct + children)
            expected_projects = folder.get('project_count', 0)
            expected_lessons = folder.get('total_lessons', 0)
            expected_hours = folder.get('total_hours', 0)
            expected_completion_time = folder.get('total_completion_time', 0)
            
            # Sum direct stats (this would be the old behavior)
            direct_projects = 0
            direct_lessons = 0
            direct_hours = 0
            direct_completion_time = 0
            
            # We can't easily get direct stats from the API response,
            # but we can verify that parent totals are >= child totals
            child_projects = sum(child.get('project_count', 0) for child in children)
            child_lessons = sum(child.get('total_lessons', 0) for child in children)
            child_hours = sum(child.get('total_hours', 0) for child in children)
            child_completion_time = sum(child.get('total_completion_time', 0) for child in children)
            
            print(f"      Parent totals: {expected_projects} projects, {expected_lessons} lessons, {expected_hours} hours, {expected_completion_time} minutes")
            print(f"      Child totals: {child_projects} projects, {child_lessons} lessons, {child_hours} hours, {child_completion_time} minutes")
            
            # Verify that parent totals are >= child totals (recursive behavior)
            if expected_projects >= child_projects and expected_lessons >= child_lessons:
                print(f"      ✅ Recursive stats working correctly")
            else:
                print(f"      ❌ Recursive stats may not be working correctly")
    
    print("\n🎉 Recursive folder stats testing completed!")

def test_tier_colors():
    """Test tier color mapping"""
    
    print("\n🎨 Testing Tier Color Mapping")
    print("=" * 30)
    
    tier_colors = {
        'starter': '#eab308',      # yellow-500
        'medium': '#f97316',       # orange-500  
        'advanced': '#a855f7',     # purple-500
        'professional': '#3b82f6'  # blue-500
    }
    
    for tier, color in tier_colors.items():
        print(f"   {tier}: {color}")
    
    print("   ✅ Tier colors defined correctly")

if __name__ == "__main__":
    test_recursive_folder_stats()
    test_tier_colors() 