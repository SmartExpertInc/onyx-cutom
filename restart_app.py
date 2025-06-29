#!/usr/bin/env python3
"""
Simple script to help restart the application so the startup migration runs.
This will trigger the completion_time column migration in main.py startup_event().
"""

import os
import sys
import subprocess
import time

def restart_application():
    """Restart the application to trigger the startup migration."""
    
    print("🔄 Restarting application to trigger completion_time migration...")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists("custom_extensions/backend/main.py"):
        print("❌ Error: custom_extensions/backend/main.py not found")
        print("   Please run this script from the project root directory")
        return False
    
    # Check if the migration code is in place
    with open("custom_extensions/backend/main.py", "r", encoding="utf-8") as f:
        content = f.read()
        if "completion_time" not in content or "INTEGER" not in content:
            print("❌ Error: completion_time migration code not found in main.py")
            print("   Please ensure the migration code is properly added")
            return False
    
    print("✅ Migration code found in main.py")
    
    # Look for common ways to start the application
    possible_start_commands = [
        ["python", "-m", "uvicorn", "custom_extensions.backend.main:app", "--reload"],
        ["uvicorn", "custom_extensions.backend.main:app", "--reload"],
        ["python", "custom_extensions/backend/main.py"],
        ["python", "main.py"],
        ["uvicorn", "main:app", "--reload"]
    ]
    
    print("\n🔍 Looking for application startup command...")
    
    # Check if any of these commands work
    for cmd in possible_start_commands:
        try:
            print(f"   Trying: {' '.join(cmd)}")
            # Just test if the command exists, don't actually run it
            result = subprocess.run(cmd + ["--help"], capture_output=True, timeout=5)
            if result.returncode == 0 or "usage" in result.stdout.decode().lower():
                print(f"✅ Found working command: {' '.join(cmd)}")
                print(f"\n🚀 To restart your application, run:")
                print(f"   {' '.join(cmd)}")
                print(f"\n📋 The startup migration will automatically:")
                print(f"   - Check completion_time column types")
                print(f"   - Convert TEXT to INTEGER if needed")
                print(f"   - Add column if missing")
                print(f"   - Verify the migration was successful")
                return True
        except (subprocess.TimeoutExpired, FileNotFoundError, Exception):
            continue
    
    print("❌ Could not determine the correct startup command")
    print("\n💡 Manual restart instructions:")
    print("   1. Stop your current application (Ctrl+C)")
    print("   2. Start it again with your usual command")
    print("   3. Check the logs for completion_time migration messages")
    print("   4. Test trash operations with course outlines")
    
    return False

def check_migration_status():
    """Check if the migration has been applied by looking at the database."""
    
    print("\n🔍 To check if the migration worked, you can:")
    print("   1. Look for these log messages when the app starts:")
    print("      - 'Adding completion_time column to projects table as INTEGER'")
    print("      - 'Converting completion_time from text to integer'")
    print("      - '✅ completion_time migration completed successfully'")
    print("   2. Or run this SQL query in your database:")
    print("      SELECT table_name, column_name, data_type")
    print("      FROM information_schema.columns")
    print("      WHERE table_name IN ('projects', 'trashed_projects')")
    print("      AND column_name = 'completion_time';")
    print("   3. Both tables should show 'integer' as the data_type")

if __name__ == "__main__":
    print("🔧 Application Restart Helper for completion_time Migration")
    print("=" * 60)
    
    success = restart_application()
    check_migration_status()
    
    if success:
        print("\n🎉 Ready to restart! The migration will run automatically.")
    else:
        print("\n⚠️  Please restart manually and check the logs.") 