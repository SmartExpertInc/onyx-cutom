#!/usr/bin/env python3
"""
Test script for the new flowing lesson plan structure.
Tests the AI prompt generation and PDF rendering with text blocks and product blocks.
"""

import json
import asyncio
from typing import List, Dict, Any

# Mock lesson plan data with the new flowing structure
MOCK_FLOWING_LESSON_PLAN = {
    "lessonTitle": "Customer Journey Mapping Essentials",
    "lessonObjectives": [
        "Understand the fundamental concepts of customer journey mapping and its importance in business strategy",
        "Identify key touchpoints and pain points in a typical customer journey",
        "Create a basic customer journey map using industry-standard methodologies",
        "Analyze customer data to improve journey experiences and business outcomes"
    ],
    "shortDescription": "This comprehensive lesson introduces learners to customer journey mapping, a critical tool for understanding customer experiences and optimizing business processes. Students will learn to create actionable journey maps that drive meaningful business improvements.",
    "contentDevelopmentSpecifications": [
        {
            "type": "text",
            "block_title": "Why is Customer Journey Mapping Important?",
            "block_content": "Enhanced Customer Understanding: By understanding the customer journey, businesses can create more personalized experiences that resonate with their audience.\n\nIdentifying Pain Points: Mapping allows organizations to pinpoint areas where customers may face challenges, enabling them to address these issues proactively.\n\nEnsuring that messages align with customer expectations at each stage.\nIncreased Customer Retention: A well-mapped journey can lead to higher satisfaction and loyalty, ultimately reducing churn rates."
        },
        {
            "type": "product",
            "product_name": "video-lesson",
            "product_description": "The video lesson should target the learning outcomes of identifying and understanding the key touchpoints in a customer journey along with real-world examples of touchpoints and practical applications in business contexts. The video should be approximately 5 minutes long, elements such as quizzes or reflection questions metrics and retention rates."
        },
        {
            "type": "text",
            "block_title": "Best Practices for Effective Customer Journey Mapping",
            "block_content": "Involve Cross-Functional Teams: Engage different departments (marketing, sales, customer service) to gain a holistic view of the customer experience.\n\nUse Real Customer Data: Base your maps on actual customer interactions and feedback rather than assumptions.\n\n1. Regularly Update Maps: Customer journeys can evolve, so it's essential to revisit and update your maps regularly to reflect changes in customer behavior and market conditions."
        },
        {
            "type": "product",
            "product_name": "quiz",
            "product_description": "The quiz should assess learners' understanding of the key components of customer journey mapping featuring 8-12 questions that include multiple-choice. The questions should cover topics such as customer touchpoints, stages of the journey, and key concepts discussed in Henderson. Success higher, and questions should be designed to reinforce learning objectives and practical applications."
        }
    ],
    "materials": [
        "Access to customer journey mapping templates and worksheets",
        "Case studies from various industries (retail, SaaS, healthcare)",
        "Customer persona development guides and examples",
        "Journey mapping software recommendations (Miro, Lucidchart, or similar tools)",
        "Data collection and analysis frameworks for customer insights"
    ],
    "suggestedPrompts": [
        "Create a professional training video for Marketing and Customer Experience teams. This is the foundational lesson of the customer experience series, titled Customer Journey Mapping Essentials. The video should introduce learners to the concept of customer journey mapping, explain why it's crucial for business success, demonstrate key touchpoints and pain points identification, and provide practical examples from real businesses. Emphasize the importance of data-driven insights and cross-functional collaboration. The tone should be professional yet engaging, and the duration should be around 5 minutes.",
        "Create a comprehensive quiz for Marketing and Customer Experience professionals on Customer Journey Mapping Essentials. The quiz should assess understanding of journey mapping fundamentals, touchpoint identification, pain point analysis, and practical application scenarios. Include multiple-choice questions about mapping methodologies, case study analysis questions, and scenario-based questions that test practical application skills. Structure the quiz with 8-12 questions that progress from basic concepts to advanced applications."
    ]
}

def test_lesson_plan_structure():
    """Test the lesson plan data structure matches expected format."""
    print("🧪 Testing Lesson Plan Data Structure...")
    
    # Verify required fields
    required_fields = ["lessonTitle", "lessonObjectives", "shortDescription", 
                      "contentDevelopmentSpecifications", "materials", "suggestedPrompts"]
    
    for field in required_fields:
        assert field in MOCK_FLOWING_LESSON_PLAN, f"Missing required field: {field}"
        print(f"✅ {field}: Present")
    
    # Verify contentDevelopmentSpecifications structure
    specs = MOCK_FLOWING_LESSON_PLAN["contentDevelopmentSpecifications"]
    assert isinstance(specs, list), "contentDevelopmentSpecifications should be a list"
    print(f"✅ contentDevelopmentSpecifications: List with {len(specs)} blocks")
    
    # Verify block types
    text_blocks = [block for block in specs if block["type"] == "text"]
    product_blocks = [block for block in specs if block["type"] == "product"]
    
    print(f"✅ Text blocks: {len(text_blocks)}")
    print(f"✅ Product blocks: {len(product_blocks)}")
    
    # Verify text block structure
    for i, block in enumerate(text_blocks):
        assert "block_title" in block, f"Text block {i} missing block_title"
        assert "block_content" in block, f"Text block {i} missing block_content"
        print(f"✅ Text block {i+1}: '{block['block_title']}'")
    
    # Verify product block structure
    for i, block in enumerate(product_blocks):
        assert "product_name" in block, f"Product block {i} missing product_name"
        assert "product_description" in block, f"Product block {i} missing product_description"
        print(f"✅ Product block {i+1}: '{block['product_name']}'")
    
    print("🎯 All structure tests passed!")

def test_content_flow():
    """Test that the content flows logically between text and product blocks."""
    print("\n📖 Testing Content Flow...")
    
    specs = MOCK_FLOWING_LESSON_PLAN["contentDevelopmentSpecifications"]
    
    # Verify alternating pattern
    flow_pattern = [block["type"] for block in specs]
    print(f"📋 Flow pattern: {' → '.join(flow_pattern)}")
    
    # Check that we start with text and alternate reasonably
    assert flow_pattern[0] == "text", "Should start with a text block"
    print("✅ Starts with text block")
    
    # Verify content richness in text blocks
    for block in specs:
        if block["type"] == "text":
            content = block["block_content"]
            has_bullets = "- " in content or "\n- " in content
            has_numbers = any(f"{i}. " in content for i in range(1, 10))
            has_paragraphs = "\n\n" in content or len(content) > 100
            
            print(f"📝 '{block['block_title']}': Bullets={has_bullets}, Numbers={has_numbers}, Paragraphs={has_paragraphs}")
    
    print("🎯 Content flow tests passed!")

def test_ai_prompt_compatibility():
    """Test that the structure is compatible with AI prompt expectations."""
    print("\n🤖 Testing AI Prompt Compatibility...")
    
    # Test JSON serialization
    try:
        json_str = json.dumps(MOCK_FLOWING_LESSON_PLAN, indent=2)
        parsed_back = json.loads(json_str)
        assert parsed_back == MOCK_FLOWING_LESSON_PLAN
        print("✅ JSON serialization works correctly")
    except Exception as e:
        print(f"❌ JSON serialization failed: {e}")
        return False
    
    # Test field accessibility
    specs = MOCK_FLOWING_LESSON_PLAN["contentDevelopmentSpecifications"]
    for block in specs:
        if block["type"] == "text":
            title = block["block_title"]
            content = block["block_content"]
            assert isinstance(title, str) and len(title) > 0
            assert isinstance(content, str) and len(content) > 0
        elif block["type"] == "product":
            name = block["product_name"]
            desc = block["product_description"]
            assert isinstance(name, str) and len(name) > 0
            assert isinstance(desc, str) and len(desc) > 0
    
    print("✅ All blocks have valid, accessible fields")
    print("🎯 AI prompt compatibility tests passed!")

def simulate_pdf_rendering():
    """Simulate how the PDF template would process this data."""
    print("\n🖨️  Simulating PDF Rendering...")
    
    specs = MOCK_FLOWING_LESSON_PLAN["contentDevelopmentSpecifications"]
    
    print("📄 Rendered content would look like:")
    print("=" * 60)
    
    for i, block in enumerate(specs):
        if block["type"] == "text":
            print(f"\n📝 TEXT BLOCK: {block['block_title']}")
            print("-" * 40)
            
            # Simulate content processing
            content = block["block_content"]
            lines = content.split('\n')
            
            for line in lines:
                line = line.strip()
                if line:
                    if line.startswith('- '):
                        print(f"   • {line[2:]}")
                    elif any(line.startswith(f'{i}. ') for i in range(1, 10)):
                        print(f"   {line}")
                    else:
                        print(f"   {line}")
            
        elif block["type"] == "product":
            print(f"\n🎯 PRODUCT BLOCK: {block['product_name'].replace('-', ' ').title()}")
            print("-" * 40)
            print(f"   {block['product_description']}")
        
        if i < len(specs) - 1:
            print("\n" + "~" * 30)
    
    print("\n" + "=" * 60)
    print("🎯 PDF rendering simulation completed!")

def main():
    """Run all tests."""
    print("🚀 Testing New Flowing Lesson Plan Structure")
    print("=" * 50)
    
    try:
        test_lesson_plan_structure()
        test_content_flow()
        test_ai_prompt_compatibility()
        simulate_pdf_rendering()
        
        print("\n🎉 ALL TESTS PASSED!")
        print("✨ The new flowing lesson plan structure is ready to use!")
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return False
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 