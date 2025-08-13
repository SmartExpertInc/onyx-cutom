#!/usr/bin/env python3
"""
Simple test script to test logging in lesson presentation endpoints
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"  # Adjust to your backend URL
CUSTOM_BACKEND_URL = f"{BASE_URL}/api/custom"

def test_lesson_presentation_edit_logging():
    """Test the lesson presentation edit endpoint to see logging"""
    
    # Test data
    edit_request = {
        "currentContent": """**Slides Deck** : **Introduction to Python**

**Slide 1: Introduction to Python**
Python is a high-level, interpreted programming language.

**Slide 2: Python Basics**
Python has simple syntax and is easy to learn.

**Slide 3: Python Variables**
Variables in Python are dynamically typed.""",
        "editPrompt": "Update the content for slide 2 titled 'Python Fundamentals'. The previous title was 'Python Basics'. Please regenerate the content to match the new title while keeping the same educational structure and depth.",
        "lessonTitle": "Introduction to Python",
        "language": "en",
        "slidesCount": 3,
        "theme": "cherry",
        "isCleanContent": False
    }
    
    print("Testing lesson presentation edit endpoint logging...")
    print("=" * 60)
    print(f"Request payload:")
    print(f"- currentContent length: {len(edit_request['currentContent'])}")
    print(f"- editPrompt: {edit_request['editPrompt'][:100]}...")
    print(f"- lessonTitle: {edit_request['lessonTitle']}")
    print(f"- slidesCount: {edit_request['slidesCount']}")
    print(f"- theme: {edit_request['theme']}")
    print(f"- isCleanContent: {edit_request['isCleanContent']}")
    
    try:
        response = requests.post(
            f"{CUSTOM_BACKEND_URL}/lesson-presentation/edit",
            json=edit_request,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ Edit endpoint test passed!")
            print("Check your backend logs to see the detailed logging")
            
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
            
            # Now test finalize with the regenerated content
            print("\n" + "=" * 60)
            print("Testing finalize endpoint with regenerated content...")
            
            finalize_request = {
                "lessonTitle": "Introduction to Python",
                "aiResponse": content,  # Use the regenerated content
                "slidesCount": 3,
                "theme": "cherry",
                "hasUserEdits": True,
                "originalContent": edit_request["currentContent"],  # Original content before edits
                "isCleanContent": False
            }
            
            print(f"Finalize request:")
            print(f"- aiResponse length: {len(finalize_request['aiResponse'])}")
            print(f"- originalContent length: {len(finalize_request['originalContent'])}")
            print(f"- hasUserEdits: {finalize_request['hasUserEdits']}")
            
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
                print("Check your backend logs to see the detailed logging")
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

if __name__ == "__main__":
    print("Testing Lesson Presentation Logging")
    print("=" * 60)
    
    test_lesson_presentation_edit_logging()
    
    print("\nTest completed!")
    print("Check your backend console/logs for detailed information about:")
    print("1. What content is received in edit endpoint")
    print("2. What content is processed in finalize endpoint")
    print("3. Change detection logic")
    print("4. What content is used for project creation")
