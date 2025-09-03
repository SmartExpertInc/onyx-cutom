#!/usr/bin/env python3
"""
CRITICAL FIX: NameError: name 'params' is not defined

The backend is failing with:
File "/app/main.py", line 12474, in get_user_projects_list_from_db
NameError: name 'params' is not defined

This means there's still a reference to 'params' instead of 'owned_params' or 'shared_params'
"""

print("🚨 CRITICAL FIX NEEDED")
print("=" * 50)
print()
print("ERROR: NameError: name 'params' is not defined")
print("LINE: 12474 in get_user_projects_list_from_db")
print()
print("ISSUE: Code is still referencing 'params' instead of 'owned_params'/'shared_params'")
print()
print("IMMEDIATE FIXES NEEDED:")
print()

print("1. 🔍 FIND any remaining 'params' references in the projects function:")
print("   - Search for: 'params' (not 'owned_params' or 'shared_params')")
print("   - Look around lines 12470-12480")
print()

print("2. 🔧 REPLACE with correct parameter variables:")
print("   - For owned projects query: use 'owned_params'")
print("   - For shared projects query: use 'shared_params'")
print()

print("3. 📋 CHECK these specific lines:")
print("   - Line ~12474: Should be 'user_for_workspace = user_email if user_email else onyx_user_id'")
print("   - Line ~12478: Should be 'owned_rows = await conn.fetch(owned_query, *owned_params)'")
print("   - Line ~12481: Should be 'shared_rows = await conn.fetch(shared_query, *shared_params)'")
print()

print("4. 🧹 REMOVE duplicate code:")
print("   - Remove any duplicate user email lookup")
print("   - Remove any duplicate query executions")
print("   - Remove any references to undefined 'params'")
print()

print("EXPECTED RESULT:")
print("✅ Backend starts without NameError")
print("✅ Projects API works")
print("✅ Shared projects appear for workspace members")
print()

print("MANUAL CHECK NEEDED:")
print("1. Open main.py")
print("2. Go to line 12474 (or search for get_user_projects_list_from_db)")
print("3. Look for any 'params' references")
print("4. Replace with 'owned_params' or 'shared_params' as appropriate")
print("5. Remove duplicate code sections")
print()

print("STATUS: 🚨 MANUAL FIX REQUIRED - Backend cannot start until this is fixed") 