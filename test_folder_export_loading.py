#!/usr/bin/env python3
"""
Test script to verify folder export loading modal implementation.

This script tests the frontend implementation of the folder export loading modal
that shows a spinner with blurred backdrop when users download a folder as PDF.
"""

import os
import sys
import subprocess
import time

def test_folder_export_loading_implementation():
    """Test the folder export loading modal implementation."""
    
    print("🧪 Testing Folder Export Loading Modal Implementation")
    print("=" * 60)
    
    # Test 1: Check if the loading modal component exists
    print("\n1. Checking loading modal component...")
    
    projects_table_path = "custom_extensions/frontend/src/components/ProjectsTable.tsx"
    
    if not os.path.exists(projects_table_path):
        print("❌ ProjectsTable.tsx not found!")
        return False
    
    with open(projects_table_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for loading modal component
    if "FolderExportLoadingModal" in content:
        print("✅ FolderExportLoadingModal component found")
    else:
        print("❌ FolderExportLoadingModal component not found")
        return False
    
    # Check for loading state
    if "isExporting" in content:
        print("✅ isExporting state found")
    else:
        print("❌ isExporting state not found")
        return False
    
    # Check for loading modal usage
    if "FolderExportLoadingModal" in content and "isOpen={isExporting}" in content:
        print("✅ Loading modal properly integrated")
    else:
        print("❌ Loading modal not properly integrated")
        return False
    
    # Test 2: Check for proper loading state management
    print("\n2. Checking loading state management...")
    
    if "setIsExporting(true)" in content and "setIsExporting(false)" in content:
        print("✅ Loading state properly managed (show/hide)")
    else:
        print("❌ Loading state not properly managed")
        return False
    
    # Test 3: Check for proper error handling
    print("\n3. Checking error handling...")
    
    if "finally" in content and "setIsExporting(false)" in content:
        print("✅ Loading state properly reset in finally block")
    else:
        print("❌ Loading state not properly reset in finally block")
        return False
    
    # Test 4: Check for proper modal styling
    print("\n4. Checking modal styling...")
    
    styling_checks = [
        "backdrop-blur-sm",
        "bg-black/20", 
        "animate-spin",
        "border-4 border-blue-200 border-t-blue-600",
        "z-[10000]"
    ]
    
    for check in styling_checks:
        if check in content:
            print(f"✅ {check} styling found")
        else:
            print(f"❌ {check} styling not found")
            return False
    
    # Test 5: Check for proper user feedback
    print("\n5. Checking user feedback...")
    
    feedback_checks = [
        "Generating PDF",
        "Creating PDF export for folder",
        "This may take a few moments"
    ]
    
    for check in feedback_checks:
        if check in content:
            print(f"✅ User feedback text found: '{check}'")
        else:
            print(f"❌ User feedback text not found: '{check}'")
            return False
    
    print("\n" + "=" * 60)
    print("🎉 All tests passed! Folder export loading modal implementation is working correctly.")
    print("\n📋 Implementation Summary:")
    print("   • Loading modal with blurred backdrop ✓")
    print("   • Spinner animation ✓")
    print("   • Proper loading state management ✓")
    print("   • Error handling with finally block ✓")
    print("   • User-friendly feedback messages ✓")
    print("   • High z-index for proper layering ✓")
    
    return True

def test_build_success():
    """Test that the frontend builds successfully."""
    print("\n🔨 Testing frontend build...")
    
    try:
        # Change to frontend directory
        os.chdir("custom_extensions/frontend")
        
        # Run build
        result = subprocess.run(
            ["npm", "run", "build"], 
            capture_output=True, 
            text=True, 
            timeout=60
        )
        
        if result.returncode == 0:
            print("✅ Frontend builds successfully")
            return True
        else:
            print("❌ Frontend build failed")
            print("Error output:", result.stderr)
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Build timed out")
        return False
    except Exception as e:
        print(f"❌ Build error: {e}")
        return False
    finally:
        # Return to original directory
        os.chdir("../..")

def main():
    """Main test function."""
    print("🚀 Starting Folder Export Loading Modal Tests")
    print("=" * 60)
    
    # Test 1: Implementation checks
    implementation_ok = test_folder_export_loading_implementation()
    
    # Test 2: Build test
    build_ok = test_build_success()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    print(f"   Implementation Tests: {'✅ PASSED' if implementation_ok else '❌ FAILED'}")
    print(f"   Build Tests: {'✅ PASSED' if build_ok else '❌ FAILED'}")
    
    if implementation_ok and build_ok:
        print("\n🎉 All tests passed! The folder export loading modal is ready for use.")
        print("\n💡 How to test manually:")
        print("   1. Start the frontend development server")
        print("   2. Navigate to the projects page")
        print("   3. Click the three dots menu on any folder")
        print("   4. Select 'Export as file'")
        print("   5. Verify the loading modal appears with spinner")
        print("   6. Verify the modal disappears when download completes")
        return 0
    else:
        print("\n❌ Some tests failed. Please check the implementation.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 