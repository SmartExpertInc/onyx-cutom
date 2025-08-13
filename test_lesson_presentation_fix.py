#!/usr/bin/env python3
"""
Test script to verify lesson presentation edit fix
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"  # Adjust to your backend URL
CUSTOM_BACKEND_URL = f"{BASE_URL}/api/custom"

def test_lesson_presentation_edit_and_finalize():
    """Test the complete workflow: edit title -> regenerate content -> finalize"""
    
    # Original content
    original_content = """**Slides Deck** : **Introduction to Python**

**Slide 1: Introduction to Python**
Python is a high-level, interpreted programming language.

**Slide 2: Python Basics**
Python has simple syntax and is easy to learn.

**Slide 3: Python Variables**
Variables in Python are dynamically typed."""

    # Content after user edits title
    edited_content = """**Slides Deck** : **Introduction to Python**

**Slide 1: Introduction to Python**
Python is a high-level, interpreted programming language.

**Slide 2: Python Fundamentals**
Python has simple syntax and is easy to learn.

**Slide 3: Python Variables**
Variables in Python are dynamically typed."""

    print("Testing lesson presentation edit and finalize workflow...")
    print("=" * 60)
    
    # Test 1: Edit endpoint
    print("\n1. Testing edit endpoint...")
    edit_request = {
        "currentContent": original_content,
        "editPrompt": "Update the content for slide 2 titled 'Python Fundamentals'. The previous title was 'Python Basics'. Please regenerate the content to match the new title while keeping the same educational structure and depth.",
        "lessonTitle": "Introduction to Python",
        "language": "en",
        "slidesCount": 3,
        "theme": "cherry",
        "isCleanContent": False
    }
    
    try:
        response = requests.post(
            f"{CUSTOM_BACKEND_URL}/lesson-presentation/edit",
            json=edit_request,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ Edit endpoint test passed!")
            
            # Read streaming response
            content = ""
            for line in response.iter_lines():
                if line:
                    try:
                        data = json.loads(line.decode('utf-8'))
                        if data.get('type') == 'delta':
                            content += data.get('text', '')
                        elif data.get('type') == 'done':
                            break
                    except json.JSONDecodeError:
                        content += line.decode('utf-8')
            
            print(f"✅ Received regenerated content length: {len(content)}")
            print("Regenerated content preview:")
            print(content[:300] + "..." if len(content) > 300 else content)
            
            # Test 2: Finalize endpoint with edit tracking
            print("\n2. Testing finalize endpoint with edit tracking...")
            finalize_request = {
                "lessonTitle": "Introduction to Python",
                "aiResponse": content,  # Use the regenerated content
                "slidesCount": 3,
                "theme": "cherry",
                "hasUserEdits": True,
                "originalContent": original_content,  # Original content before edits
                "isCleanContent": False
            }
            
            finalize_response = requests.post(
                f"{CUSTOM_BACKEND_URL}/lesson-presentation/finalize",
                json=finalize_request,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if finalize_response.status_code == 200:
                print("✅ Finalize endpoint test passed!")
                data = finalize_response.json()
                print(f"✅ Project created with ID: {data.get('id')}")
                print(f"✅ Project name: {data.get('projectName')}")
                
                # Test 3: Verify the content was saved correctly
                print("\n3. Verifying saved content...")
                if data.get('id'):
                    project_response = requests.get(
                        f"{CUSTOM_BACKEND_URL}/projects/{data['id']}",
                        headers={"Content-Type": "application/json"},
                        timeout=10
                    )
                    
                    if project_response.status_code == 200:
                        project_data = project_response.json()
                        saved_content = project_data.get('microproduct_content', '')
                        print(f"✅ Retrieved saved content length: {len(saved_content)}")
                        
                        # Check if the new title is in the saved content
                        if "Python Fundamentals" in saved_content:
                            print("✅ New title 'Python Fundamentals' found in saved content!")
                        else:
                            print("❌ New title 'Python Fundamentals' NOT found in saved content")
                            print("Saved content preview:")
                            print(saved_content[:300] + "..." if len(saved_content) > 300 else saved_content)
                        
                        # Check if old title is still there
                        if "Python Basics" in saved_content:
                            print("⚠️  Old title 'Python Basics' still found in saved content")
                        else:
                            print("✅ Old title 'Python Basics' correctly removed from saved content")
                    else:
                        print(f"❌ Failed to retrieve project: {project_response.status_code}")
                else:
                    print("❌ No project ID returned from finalize")
            else:
                print(f"❌ Finalize endpoint test failed!")
                print(f"Status code: {finalize_response.status_code}")
                print(f"Response: {finalize_response.text}")
        else:
            print(f"❌ Edit endpoint test failed!")
            print(f"Status code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Test failed: {e}")

def test_change_detection():
    """Test the change detection logic"""
    
    print("\nTesting change detection logic...")
    print("=" * 60)
    
    # Test with identical content
    content1 = "**Slide 1: Test**\nContent here"
    content2 = "**Slide 1: Test**\nContent here"
    
    # Test with different content
    content3 = "**Slide 1: Different**\nContent here"
    
    # Simulate the change detection logic
    def any_changes_made(original: str, edited: str) -> bool:
        original_normalized = original.strip()
        edited_normalized = edited.strip()
        return original_normalized != edited_normalized
    
    print(f"Identical content test: {any_changes_made(content1, content2)} (should be False)")
    print(f"Different content test: {any_changes_made(content1, content3)} (should be True)")

if __name__ == "__main__":
    print("Testing Lesson Presentation Edit Fix")
    print("=" * 60)
    
    test_lesson_presentation_edit_and_finalize()
    test_change_detection()
    
    print("\nTest completed!")
