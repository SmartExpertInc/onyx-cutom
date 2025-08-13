#!/usr/bin/env python3
"""
Test script for lesson presentation edit functionality
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"  # Adjust to your backend URL
CUSTOM_BACKEND_URL = f"{BASE_URL}/api/custom"

def test_lesson_presentation_edit():
    """Test the lesson presentation edit endpoint"""
    
    # Test data
    edit_request = {
        "currentContent": """**Slides Deck** : **Introduction to Python**

**Slide 1: Introduction to Python**
Python is a high-level, interpreted programming language.

**Slide 2: Python Basics**
Python has simple syntax and is easy to learn.

**Slide 3: Python Variables**
Variables in Python are dynamically typed.""",
        "editPrompt": "Update the content for slide 2 titled 'Python Basics'. Please regenerate the content to match the new title while keeping the same educational structure and depth.",
        "lessonTitle": "Introduction to Python",
        "language": "en",
        "slidesCount": 3,
        "theme": "cherry",
        "isCleanContent": False
    }
    
    try:
        # Test the edit endpoint
        print("Testing lesson presentation edit endpoint...")
        response = requests.post(
            f"{CUSTOM_BACKEND_URL}/lesson-presentation/edit",
            json=edit_request,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ Edit endpoint test passed!")
            print(f"Response status: {response.status_code}")
            
            # Check if response is streaming
            content_type = response.headers.get('content-type', '')
            if 'text/plain' in content_type:
                print("✅ Streaming response detected")
                # Read the streaming response
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
                
                print(f"✅ Received content length: {len(content)}")
                print("First 200 characters:")
                print(content[:200] + "..." if len(content) > 200 else content)
            else:
                print("❌ Expected streaming response but got:", content_type)
        else:
            print(f"❌ Edit endpoint test failed!")
            print(f"Status code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Test failed: {e}")

def test_lesson_presentation_finalize():
    """Test the lesson presentation finalize endpoint with edit tracking"""
    
    # Test data
    finalize_request = {
        "lessonTitle": "Introduction to Python",
        "aiResponse": """**Slides Deck** : **Introduction to Python**

**Slide 1: Introduction to Python**
Python is a high-level, interpreted programming language.

**Slide 2: Python Fundamentals**
Python has simple syntax and is easy to learn.

**Slide 3: Python Variables**
Variables in Python are dynamically typed.""",
        "slidesCount": 3,
        "theme": "cherry",
        "hasUserEdits": True,
        "originalContent": """**Slides Deck** : **Introduction to Python**

**Slide 1: Introduction to Python**
Python is a high-level, interpreted programming language.

**Slide 2: Python Basics**
Python has simple syntax and is easy to learn.

**Slide 3: Python Variables**
Variables in Python are dynamically typed.""",
        "isCleanContent": False
    }
    
    try:
        # Test the finalize endpoint
        print("\nTesting lesson presentation finalize endpoint with edit tracking...")
        response = requests.post(
            f"{CUSTOM_BACKEND_URL}/lesson-presentation/finalize",
            json=finalize_request,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ Finalize endpoint test passed!")
            data = response.json()
            print(f"Response: {data}")
        else:
            print(f"❌ Finalize endpoint test failed!")
            print(f"Status code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    print("Testing Lesson Presentation Edit Functionality")
    print("=" * 50)
    
    test_lesson_presentation_edit()
    test_lesson_presentation_finalize()
    
    print("\nTest completed!")
