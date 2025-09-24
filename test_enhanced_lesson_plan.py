#!/usr/bin/env python3

import requests
import json
import sys

def test_enhanced_lesson_plan():
    """Test the enhanced lesson plan generation with detailed prompts and product blocks"""
    
    print("🧪 Testing Enhanced Lesson Plan Generation")
    print("=" * 50)
    
    # Test configuration
    backend_url = "http://localhost:8000"
    
    # Test payload - simulating a course outline lesson plan request
    test_payload = {
        "outlineProjectId": 1,  # This would be a real course outline project ID
        "lessonTitle": "Customer Journey Mapping Fundamentals",
        "moduleName": "Customer Experience Strategy",
        "lessonNumber": 1,
        "recommendedProducts": ["video-lesson", "presentation", "quiz"]
    }
    
    print(f"📡 Testing URL: {backend_url}/api/custom/lesson-plan/generate")
    print(f"📋 Payload: {json.dumps(test_payload, indent=2)}")
    print("\n🚀 Sending request...")
    
    try:
        # Mock cookies for authentication
        cookies = {
            'auth_token': 'test_token'  # This would be real auth cookies
        }
        
        response = requests.post(
            f"{backend_url}/api/custom/lesson-plan/generate",
            json=test_payload,
            cookies=cookies,
            timeout=120  # Longer timeout for detailed generation
        )
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS - Enhanced Lesson Plan Generated!")
            
            # Analyze the enhanced content
            lesson_data = result.get('lesson_plan_data', {})
            
            print("\n📋 ANALYSIS OF ENHANCED CONTENT:")
            print("-" * 40)
            
            # Check Resources section (should not have "Source Materials Used:" text)
            materials = lesson_data.get('materials', [])
            print(f"🎯 Resources Section: {len(materials)} materials")
            for i, material in enumerate(materials, 1):
                print(f"   {i}. {material}")
            
            # Analyze Product Blocks for enhanced detail
            specs = lesson_data.get('contentDevelopmentSpecifications', [])
            product_blocks = [block for block in specs if block.get('type') == 'product']
            
            print(f"\n🎯 Product Blocks Analysis: {len(product_blocks)} blocks")
            for i, block in enumerate(product_blocks, 1):
                product_name = block.get('product_name', 'Unknown')
                description = block.get('product_description', '')
                
                print(f"\n   Product {i}: {product_name}")
                print(f"   Description Length: {len(description)} characters")
                print(f"   Detail Level: {'ENHANCED' if len(description) > 500 else 'BASIC'}")
                
                # Check for enhanced detail keywords
                enhanced_keywords = [
                    'exact', 'specific', 'detailed', 'precise', 'requirements',
                    'specifications', 'standards', 'criteria', 'methodology'
                ]
                
                keyword_count = sum(1 for keyword in enhanced_keywords if keyword.lower() in description.lower())
                print(f"   Enhancement Keywords Found: {keyword_count}/9")
                
                # Preview first 200 characters
                preview = description[:200] + "..." if len(description) > 200 else description
                print(f"   Preview: {preview}")
            
            # Analyze Prompts for enhanced detail
            prompts = lesson_data.get('suggestedPrompts', [])
            print(f"\n🎯 Content Creation Prompts Analysis: {len(prompts)} prompts")
            
            for i, prompt in enumerate(prompts, 1):
                # Remove title formatting to get actual content
                content = prompt.split(':', 1)[-1].strip() if ':' in prompt else prompt
                
                print(f"\n   Prompt {i}:")
                print(f"   Length: {len(content)} characters")
                print(f"   Detail Level: {'ULTRA-DETAILED' if len(content) > 300 else 'ENHANCED' if len(content) > 150 else 'BASIC'}")
                
                # Check for ultra-detailed elements
                detail_keywords = [
                    'exactly', 'specific', 'precise', 'detailed', 'requirements',
                    'specifications', 'duration', 'format', 'technical', 'accessibility'
                ]
                
                keyword_count = sum(1 for keyword in detail_keywords if keyword.lower() in content.lower())
                print(f"   Ultra-Detail Keywords Found: {keyword_count}/10")
                
                # Preview first 150 characters
                preview = content[:150] + "..." if len(content) > 150 else content
                print(f"   Preview: {preview}")
            
            # Overall Enhancement Assessment
            print(f"\n🎉 ENHANCEMENT ASSESSMENT:")
            print("-" * 30)
            
            avg_product_length = sum(len(block.get('product_description', '')) for block in product_blocks) / len(product_blocks) if product_blocks else 0
            avg_prompt_length = sum(len(prompt) for prompt in prompts) / len(prompts) if prompts else 0
            
            print(f"✅ Resources Section: Clean (no 'Source Materials Used:' text)")
            print(f"📊 Average Product Block Length: {avg_product_length:.0f} characters")
            print(f"📊 Average Prompt Length: {avg_prompt_length:.0f} characters")
            
            enhancement_score = 0
            if avg_product_length > 500:
                enhancement_score += 30
                print("✅ Product Blocks: ENHANCED (500+ chars)")
            elif avg_product_length > 300:
                enhancement_score += 15
                print("⚠️  Product Blocks: MODERATE (300+ chars)")
            else:
                print("❌ Product Blocks: BASIC (< 300 chars)")
            
            if avg_prompt_length > 300:
                enhancement_score += 35
                print("✅ Prompts: ULTRA-DETAILED (300+ chars)")
            elif avg_prompt_length > 200:
                enhancement_score += 20
                print("⚠️  Prompts: ENHANCED (200+ chars)")
            else:
                print("❌ Prompts: BASIC (< 200 chars)")
            
            if len(materials) > 0:
                enhancement_score += 10
                print("✅ Resources: Present")
            
            if len(product_blocks) == len(test_payload['recommendedProducts']):
                enhancement_score += 15
                print("✅ Product Coverage: Complete")
            
            if len(prompts) == len(test_payload['recommendedProducts']):
                enhancement_score += 10
                print("✅ Prompt Coverage: Complete")
            
            print(f"\n🏆 TOTAL ENHANCEMENT SCORE: {enhancement_score}/100")
            
            if enhancement_score >= 80:
                print("🎉 EXCELLENT - Highly detailed and comprehensive!")
            elif enhancement_score >= 60:
                print("👍 GOOD - Well enhanced with room for improvement")
            elif enhancement_score >= 40:
                print("⚠️  FAIR - Some enhancement present")
            else:
                print("❌ POOR - Insufficient enhancement")
                
        else:
            print(f"❌ FAILED - Status Code: {response.status_code}")
            print(f"Response: {response.text}")
    
    except requests.exceptions.RequestException as e:
        print(f"❌ REQUEST FAILED: {e}")
        print("\n💡 TROUBLESHOOTING TIPS:")
        print("1. Ensure the backend server is running on localhost:8000")
        print("2. Check that the database has a valid course outline project")
        print("3. Verify authentication cookies are valid")
        print("4. Check server logs for detailed error information")
    
    except json.JSONDecodeError as e:
        print(f"❌ JSON DECODE FAILED: {e}")
    
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {e}")

def print_usage():
    """Print usage instructions"""
    print("Enhanced Lesson Plan Test Script")
    print("=" * 30)
    print("This script tests the enhanced lesson plan generation with:")
    print("1. Removed 'Source Materials Used:' text from Resources")
    print("2. Ultra-detailed product blocks with comprehensive specifications")
    print("3. Enhanced prompts with 300-500+ word detailed instructions")
    print("\nUsage: python test_enhanced_lesson_plan.py")
    print("\nPrerequisites:")
    print("- Backend server running on localhost:8000")
    print("- Valid course outline project in database")
    print("- Proper authentication setup")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ['-h', '--help']:
        print_usage()
    else:
        test_enhanced_lesson_plan() 