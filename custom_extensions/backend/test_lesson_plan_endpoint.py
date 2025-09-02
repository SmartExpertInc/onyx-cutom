#!/usr/bin/env python3
"""
Test script for the lesson plan generation endpoint.
Run this to verify the backend API is working correctly.
"""

import asyncio
import json
import httpx
import os

# Test data for lesson plan generation
TEST_PAYLOAD = {
    "outlineProjectId": 1,  # Replace with actual project ID from your database
    "lessonTitle": "Introduction to Python Programming",
    "moduleName": "Python Basics",
    "lessonNumber": 1,
    "recommendedProducts": ["lesson", "quiz", "one-pager", "video-lesson"]
}

async def test_lesson_plan_generation():
    """Test the lesson plan generation endpoint."""
    
    # Backend URL - adjust as needed
    backend_url = "http://localhost:8000"  # Default FastAPI port
    
    try:
        async with httpx.AsyncClient() as client:
            print("🧪 Testing Lesson Plan Generation Endpoint...")
            print(f"📡 URL: {backend_url}/api/custom/lesson-plan/generate")
            print(f"📦 Payload: {json.dumps(TEST_PAYLOAD, indent=2)}")
            
            # Make the request
            response = await client.post(
                f"{backend_url}/api/custom/lesson-plan/generate",
                json=TEST_PAYLOAD,
                timeout=60.0  # 60 second timeout for generation
            )
            
            print(f"\n📊 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ SUCCESS! Lesson plan generated successfully.")
                print(f"📋 Project ID: {result.get('project_id')}")
                print(f"💬 Message: {result.get('message')}")
                
                # Display the generated lesson plan data
                lesson_data = result.get('lesson_plan_data', {})
                if lesson_data:
                    print("\n📚 Generated Lesson Plan:")
                    print(f"   Title: {lesson_data.get('lessonTitle')}")
                    print(f"   Description: {lesson_data.get('shortDescription')}")
                    print(f"   Objectives: {len(lesson_data.get('lessonObjectives', []))} objectives")
                    print(f"   Materials: {len(lesson_data.get('materials', []))} materials")
                    print(f"   Prompts: {len(lesson_data.get('suggestedPrompts', []))} prompts")
                    print(f"   Products: {len(lesson_data.get('recommendedProductTypes', {}))} product types")
            else:
                print("❌ FAILED! Request was not successful.")
                print(f"Error: {response.text}")
                
    except httpx.ConnectError:
        print("❌ CONNECTION ERROR: Could not connect to the backend server.")
        print("   Make sure the backend is running on the specified URL.")
        print("   You can start it with: uvicorn main:app --reload")
        
    except httpx.TimeoutException:
        print("⏰ TIMEOUT: Request took too long to complete.")
        print("   This might indicate the lesson plan generation is working but taking time.")
        
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {type(e).__name__}: {e}")

def main():
    """Main function to run the test."""
    print("🚀 Lesson Plan Generation Endpoint Test")
    print("=" * 50)
    
    # Check if we have the required environment variables
    required_env_vars = ["OPENAI_API_KEY", "CUSTOM_PROJECTS_DATABASE_URL"]
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        print("⚠️  WARNING: Missing environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n   Some features may not work correctly.")
    
    print()
    
    # Run the async test
    asyncio.run(test_lesson_plan_generation())
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!")

if __name__ == "__main__":
    main() 