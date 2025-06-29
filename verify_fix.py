#!/usr/bin/env python3
"""
Simple verification script to check that the trash fix has been applied correctly.
This script analyzes the code changes without requiring database connections.
"""

import re
import os

def check_case_statements_in_file(file_path):
    """Check if the improved CASE statements are present in the file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"🔍 Checking {file_path}...")
        
        # Look for the old problematic CASE statements
        old_pattern = r'CASE\s+WHEN\s+"order"\s+IS\s+NULL\s+THEN\s+0\s+WHEN\s+"order"\s+=\s+\'\'\s+THEN\s+0\s+WHEN\s+"order"\s+~\s+\'\^\[0-9\]\+\$\'\s+THEN\s+CAST\("order"\s+AS\s+INTEGER\)\s+ELSE\s+0\s+END'
        old_matches = re.findall(old_pattern, content, re.IGNORECASE | re.DOTALL)
        
        if old_matches:
            print(f"❌ Found {len(old_matches)} instances of old CASE statements")
            return False
        
        # Look for the new improved CASE statements
        new_pattern = r'CASE\s+WHEN\s+"order"\s+IS\s+NULL\s+OR\s+"order"\s+=\s+\'\'\s+OR\s+"order"\s+!\~\s+\'\^\[0-9\]\+\$\'\s+THEN\s+0\s+ELSE\s+CAST\("order"\s+AS\s+INTEGER\)\s+END'
        new_matches = re.findall(new_pattern, content, re.IGNORECASE | re.DOTALL)
        
        if new_matches:
            print(f"✅ Found {len(new_matches)} instances of new improved CASE statements")
        else:
            print("⚠️  No new CASE statements found for 'order' field")
        
        # Look for completion_time CASE statements
        completion_pattern = r'CASE\s+WHEN\s+completion_time\s+IS\s+NULL\s+OR\s+completion_time\s+=\s+\'\'\s+OR\s+completion_time\s+!\~\s+\'\^\[0-9\]\+\$\'\s+THEN\s+0\s+ELSE\s+CAST\(completion_time\s+AS\s+INTEGER\)\s+END'
        completion_matches = re.findall(completion_pattern, content, re.IGNORECASE | re.DOTALL)
        
        if completion_matches:
            print(f"✅ Found {len(completion_matches)} instances of new improved CASE statements for completion_time")
        else:
            print("⚠️  No new CASE statements found for completion_time field")
        
        # Check for delete_multiple_projects function
        if 'delete_multiple_projects' in content:
            print("✅ delete_multiple_projects function found")
        else:
            print("❌ delete_multiple_projects function not found")
        
        # Check for restore_multiple_projects function
        if 'restore_multiple_projects' in content:
            print("✅ restore_multiple_projects function found")
        else:
            print("❌ restore_multiple_projects function not found")
        
        return len(new_matches) > 0 and len(completion_matches) > 0
        
    except FileNotFoundError:
        print(f"❌ File not found: {file_path}")
        return False
    except Exception as e:
        print(f"❌ Error reading file {file_path}: {e}")
        return False

def check_sql_migration_file():
    """Check if the SQL migration file exists and has the right content."""
    migration_file = "IMMEDIATE_FIX.sql"
    
    if not os.path.exists(migration_file):
        print(f"❌ Migration file not found: {migration_file}")
        return False
    
    try:
        with open(migration_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"🔍 Checking {migration_file}...")
        
        # Check for key migration elements
        checks = [
            ("ALTER TABLE projects ALTER COLUMN completion_time TYPE INTEGER", "Projects completion_time migration"),
            ("ALTER TABLE trashed_projects ALTER COLUMN completion_time TYPE INTEGER", "Trashed projects completion_time migration"),
            ("ALTER TABLE projects ALTER COLUMN \"order\" TYPE INTEGER", "Projects order migration"),
            ("ALTER TABLE trashed_projects ALTER COLUMN \"order\" TYPE INTEGER", "Trashed projects order migration"),
            ("UPDATE projects SET completion_time = '0' WHERE completion_time = ''", "Empty string handling for completion_time"),
            ("UPDATE projects SET \"order\" = '0' WHERE \"order\" = ''", "Empty string handling for order"),
            ("!~ '^[0-9]+$'", "Negative regex pattern"),
        ]
        
        all_passed = True
        for pattern, description in checks:
            if pattern in content:
                print(f"✅ {description}")
            else:
                print(f"❌ {description}")
                all_passed = False
        
        return all_passed
        
    except Exception as e:
        print(f"❌ Error reading migration file: {e}")
        return False

def check_test_file():
    """Check if the test file exists and has the right content."""
    test_file = "test_trash_fix.py"
    
    if not os.path.exists(test_file):
        print(f"❌ Test file not found: {test_file}")
        return False
    
    try:
        with open(test_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"🔍 Checking {test_file}...")
        
        # Check for key test elements
        checks = [
            ("test_database_connection", "Database connection test"),
            ("test_case_statements", "CASE statements test"),
            ("test_trash_operations", "Trash operations test"),
            ("!~ '^[0-9]+$'", "Negative regex test"),
            ("asyncpg", "Database library import"),
        ]
        
        all_passed = True
        for pattern, description in checks:
            if pattern in content:
                print(f"✅ {description}")
            else:
                print(f"❌ {description}")
                all_passed = False
        
        return all_passed
        
    except Exception as e:
        print(f"❌ Error reading test file: {e}")
        return False

def main():
    """Run all verification checks."""
    print("🔍 Trash Fix Verification Script")
    print("=" * 50)
    
    # Check main code file
    main_file = "custom_extensions/backend/main.py"
    code_fix_ok = check_case_statements_in_file(main_file)
    
    print("\n" + "=" * 50)
    
    # Check SQL migration file
    migration_ok = check_sql_migration_file()
    
    print("\n" + "=" * 50)
    
    # Check test file
    test_ok = check_test_file()
    
    print("\n" + "=" * 50)
    
    # Summary
    print("📋 VERIFICATION SUMMARY:")
    print(f"   Code Fix: {'✅ PASS' if code_fix_ok else '❌ FAIL'}")
    print(f"   Migration: {'✅ PASS' if migration_ok else '❌ FAIL'}")
    print(f"   Test File: {'✅ PASS' if test_ok else '❌ FAIL'}")
    
    if code_fix_ok and migration_ok and test_ok:
        print("\n🎉 ALL CHECKS PASSED! The trash fix has been properly implemented.")
        print("\n📝 Next Steps:")
        print("   1. Run the SQL migration: psql -f IMMEDIATE_FIX.sql")
        print("   2. Restart your application")
        print("   3. Test trash operations with course outlines")
        return True
    else:
        print("\n❌ Some checks failed. Please review the implementation.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 