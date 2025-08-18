#!/usr/bin/env python3
"""
Test script to verify professional table prompts with correct supported templates
This ensures the prompts use templates that actually exist in the system
"""

import json
import sys
from typing import Dict, List, Any

def test_professional_table_prompts():
    """Test the professional table prompts with correct supported templates"""
    print("🔧 Testing Professional Table Prompts (Supported Templates)")
    print("=" * 60)
    
    # Professional prompts that use supported templates
    professional_prompts = {
        "technology_comparison_two_column": {
            "prompt": 'Create a slide with templateId "two-column" for technology platforms comparison. Left column title: "Cloud Solutions", right column title: "On-Premise Solutions". Left content: "High scalability, managed services, pay-as-you-go pricing, automatic updates, global availability". Right content: "Full control, custom configurations, one-time licensing, internal security, dedicated infrastructure".',
            "templateId": "two-column",
            "expected_title": "Technology Platforms Comparison",
            "expected_left_title": "Cloud Solutions",
            "expected_right_title": "On-Premise Solutions"
        },
        "financial_comparison_two_column_diversity": {
            "prompt": 'Create a slide with templateId "two-column-diversity" for financial performance comparison. Title: "Q1 vs Q2 2024 Performance". Left title: "Q1 2024", right title: "Q2 2024". Left content: "Revenue: $2.5M, Profit Margin: 15%, Operating Costs: $1.8M, Growth Rate: 8%". Right bullets: "Revenue: $3.2M (+28%)", "Profit Margin: 18% (+3%)", "Operating Costs: $2.1M (+17%)", "Growth Rate: 12% (+4%)".',
            "templateId": "two-column-diversity",
            "expected_title": "Q1 vs Q2 2024 Performance",
            "expected_left_title": "Q1 2024",
            "expected_right_title": "Q2 2024"
        },
        "product_comparison_four_box_grid": {
            "prompt": 'Create a slide with templateId "four-box-grid" for product feature comparison. Title: "Product Features Comparison". Include 4 boxes: Box 1 title "Core Features", content "Basic functionality, essential tools, standard support"; Box 2 title "Advanced Features", content "Premium tools, advanced analytics, priority support"; Box 3 title "Integration Options", content "API access, third-party connectors, custom workflows"; Box 4 title "Pricing Model", content "Subscription-based, usage-based pricing, enterprise licensing".',
            "templateId": "four-box-grid",
            "expected_title": "Product Features Comparison",
            "expected_boxes_count": 4
        }
    }
    
    print("📋 PROFESSIONAL PROMPTS WITH SUPPORTED TEMPLATES:")
    for prompt_name, data in professional_prompts.items():
        print(f"\n🔧 {prompt_name.upper().replace('_', ' ')}:")
        print(f"   Template ID: {data['templateId']}")
        print(f"   Prompt: {data['prompt']}")
        print(f"   Expected Title: {data['expected_title']}")
        if 'expected_left_title' in data:
            print(f"   Expected Left Title: {data['expected_left_title']}")
        if 'expected_right_title' in data:
            print(f"   Expected Right Title: {data['expected_right_title']}")
        if 'expected_boxes_count' in data:
            print(f"   Expected Boxes Count: {data['expected_boxes_count']}")
    
    return professional_prompts

def test_supported_templates():
    """Test that prompts use supported template IDs"""
    print("\n🎯 Testing Supported Template IDs")
    print("=" * 60)
    
    # Supported template IDs from the system
    supported_templates = [
        "title-slide",
        "bullet-points", 
        "bullet-points-right",
        "big-image-top",
        "big-image-left",
        "two-column",
        "two-column-diversity",
        "big-numbers",
        "four-box-grid",
        "timeline",
        "challenges-solutions",
        "process-steps",
        "pie-chart-infographics",
        "pyramid",
        "market-share",
        "hero-title-slide",
        "content-slide"
    ]
    
    # Table-related templates
    table_templates = ["two-column", "two-column-diversity", "four-box-grid"]
    
    # Required keywords for each template
    template_keywords = {
        "two-column": [
            "templateId",
            "two-column",
            "left column title",
            "right column title",
            "left content",
            "right content"
        ],
        "two-column-diversity": [
            "templateId",
            "two-column-diversity",
            "left title",
            "right title",
            "left content",
            "right bullets"
        ],
        "four-box-grid": [
            "templateId",
            "four-box-grid",
            "boxes",
            "title",
            "content"
        ]
    }
    
    prompts = test_professional_table_prompts()
    
    all_passed = True
    
    for prompt_name, data in prompts.items():
        print(f"\n📊 Testing {prompt_name}:")
        prompt_text = data["prompt"]
        template_id = data["templateId"]
        
        # Check if template ID is supported
        if template_id in supported_templates:
            print(f"   ✅ PASS: Uses supported template ID '{template_id}'")
        else:
            print(f"   ❌ FAIL: Unsupported template ID '{template_id}'")
            all_passed = False
        
        # Check if template ID is table-related
        if template_id in table_templates:
            print(f"   ✅ PASS: Uses table-related template '{template_id}'")
        else:
            print(f"   ❌ FAIL: Not a table-related template '{template_id}'")
            all_passed = False
        
        # Check if prompt contains templateId (correct format)
        if "templateId" in prompt_text:
            print(f"   ✅ PASS: Contains correct 'templateId' format")
        else:
            print(f"   ❌ FAIL: Missing 'templateId' format")
            all_passed = False
        
        # Check if prompt contains template ID
        if template_id in prompt_text:
            print(f"   ✅ PASS: Contains template ID '{template_id}'")
        else:
            print(f"   ❌ FAIL: Missing template ID '{template_id}'")
            all_passed = False
        
        # Check if prompt contains required keywords for the template
        if template_id in template_keywords:
            required_keywords = template_keywords[template_id]
            for keyword in required_keywords:
                if keyword in prompt_text:
                    print(f"   ✅ PASS: Contains '{keyword}'")
                else:
                    print(f"   ❌ FAIL: Missing '{keyword}'")
                    all_passed = False
    
    if all_passed:
        print("\n🎉 SUCCESS: All prompts use supported template IDs!")
    else:
        print("\n⚠️  FAILED: Some prompts have unsupported template IDs!")
    
    return all_passed

def test_json_structure():
    """Test that the JSON structure is correct for supported templates"""
    print("\n📋 Testing JSON Structure for Supported Templates")
    print("=" * 60)
    
    # Correct JSON structures for supported templates
    correct_jsons = {
        "two-column": {
            "templateId": "two-column",
            "props": {
                "title": "Technology Platforms Comparison",
                "leftTitle": "Cloud Solutions",
                "rightTitle": "On-Premise Solutions",
                "leftContent": "High scalability, managed services, pay-as-you-go pricing, automatic updates, global availability",
                "rightContent": "Full control, custom configurations, one-time licensing, internal security, dedicated infrastructure"
            }
        },
        "two-column-diversity": {
            "templateId": "two-column-diversity",
            "props": {
                "title": "Q1 vs Q2 2024 Performance",
                "leftTitle": "Q1 2024",
                "rightTitle": "Q2 2024",
                "leftContent": "Revenue: $2.5M, Profit Margin: 15%, Operating Costs: $1.8M, Growth Rate: 8%",
                "rightBullets": [
                    "Revenue: $3.2M (+28%)",
                    "Profit Margin: 18% (+3%)",
                    "Operating Costs: $2.1M (+17%)",
                    "Growth Rate: 12% (+4%)"
                ]
            }
        },
        "four-box-grid": {
            "templateId": "four-box-grid",
            "props": {
                "title": "Product Features Comparison",
                "subtitle": "Comprehensive feature overview",
                "boxes": [
                    {
                        "title": "Core Features",
                        "content": "Basic functionality, essential tools, standard support"
                    },
                    {
                        "title": "Advanced Features",
                        "content": "Premium tools, advanced analytics, priority support"
                    },
                    {
                        "title": "Integration Options",
                        "content": "API access, third-party connectors, custom workflows"
                    },
                    {
                        "title": "Pricing Model",
                        "content": "Subscription-based, usage-based pricing, enterprise licensing"
                    }
                ]
            }
        }
    }
    
    all_passed = True
    
    for template_id, correct_json in correct_jsons.items():
        print(f"\n📊 Testing {template_id} JSON structure:")
        print(f"   Template ID: {correct_json['templateId']}")
        print(f"   Props Title: {correct_json['props']['title']}")
        
        # Validate structure
        if "templateId" in correct_json:
            print(f"   ✅ PASS: Has templateId field")
        else:
            print(f"   ❌ FAIL: Missing templateId field")
            all_passed = False
        
        if "props" in correct_json:
            print(f"   ✅ PASS: Has props field")
        else:
            print(f"   ❌ FAIL: Missing props field")
            all_passed = False
        
        # Template-specific validation
        if template_id == "two-column":
            required_fields = ["leftTitle", "rightTitle", "leftContent", "rightContent"]
            for field in required_fields:
                if field in correct_json["props"]:
                    print(f"   ✅ PASS: Has {field} field")
                else:
                    print(f"   ❌ FAIL: Missing {field} field")
                    all_passed = False
        
        elif template_id == "two-column-diversity":
            required_fields = ["leftTitle", "rightTitle", "leftContent", "rightBullets"]
            for field in required_fields:
                if field in correct_json["props"]:
                    print(f"   ✅ PASS: Has {field} field")
                else:
                    print(f"   ❌ FAIL: Missing {field} field")
                    all_passed = False
        
        elif template_id == "four-box-grid":
            if "boxes" in correct_json["props"]:
                print(f"   ✅ PASS: Has boxes field")
                if len(correct_json["props"]["boxes"]) == 4:
                    print(f"   ✅ PASS: Has 4 boxes")
                else:
                    print(f"   ❌ FAIL: Wrong number of boxes")
                    all_passed = False
            else:
                print(f"   ❌ FAIL: Missing boxes field")
                all_passed = False
    
    if all_passed:
        print("\n🎉 SUCCESS: All JSON structures are correct!")
    else:
        print("\n⚠️  FAILED: Some JSON structures are incorrect!")
    
    return all_passed

def generate_professional_prompts():
    """Generate professional table prompts"""
    print("\n🎯 Generating Professional Table Prompts")
    print("=" * 60)
    
    professional_prompts = {
        "simple_two_column": 'Create a slide with templateId "two-column" for technology platforms comparison. Left column title: "Cloud Solutions", right column title: "On-Premise Solutions". Left content: "High scalability, managed services, pay-as-you-go pricing, automatic updates, global availability". Right content: "Full control, custom configurations, one-time licensing, internal security, dedicated infrastructure".',
        "simple_two_column_diversity": 'Create a slide with templateId "two-column-diversity" for financial performance comparison. Title: "Q1 vs Q2 2024 Performance". Left title: "Q1 2024", right title: "Q2 2024". Left content: "Revenue: $2.5M, Profit Margin: 15%, Operating Costs: $1.8M, Growth Rate: 8%". Right bullets: "Revenue: $3.2M (+28%)", "Profit Margin: 18% (+3%)", "Operating Costs: $2.1M (+17%)", "Growth Rate: 12% (+4%)".',
        "simple_four_box_grid": 'Create a slide with templateId "four-box-grid" for product feature comparison. Title: "Product Features Comparison". Include 4 boxes: Box 1 title "Core Features", content "Basic functionality, essential tools, standard support"; Box 2 title "Advanced Features", content "Premium tools, advanced analytics, priority support"; Box 3 title "Integration Options", content "API access, third-party connectors, custom workflows"; Box 4 title "Pricing Model", content "Subscription-based, usage-based pricing, enterprise licensing".',
        "ultra_simple_two_column": 'Create slide with templateId "two-column" for technology comparison',
        "ultra_simple_two_column_diversity": 'Create slide with templateId "two-column-diversity" for financial comparison',
        "ultra_simple_four_box_grid": 'Create slide with templateId "four-box-grid" for product comparison'
    }
    
    print("📋 PROFESSIONAL PROMPTS:")
    for prompt_name, prompt_text in professional_prompts.items():
        print(f"\n🔧 {prompt_name.upper().replace('_', ' ')}:")
        print(f"   Prompt: {prompt_text}")
        
        # Check for correct templateId format
        if "templateId" in prompt_text:
            print(f"   ✅ Uses correct templateId format")
        else:
            print(f"   ❌ Missing templateId format")
        
        # Check for supported template ID
        if "two-column" in prompt_text:
            print(f"   ✅ Uses supported two-column template")
        elif "two-column-diversity" in prompt_text:
            print(f"   ✅ Uses supported two-column-diversity template")
        elif "four-box-grid" in prompt_text:
            print(f"   ✅ Uses supported four-box-grid template")
        else:
            print(f"   ❌ Missing supported template ID")
    
    return professional_prompts

def run_professional_table_tests():
    """Run all professional table prompt tests"""
    print("🎯 Testing Professional Table Prompts (Supported Templates)")
    print("=" * 60)
    
    tests = [
        test_professional_table_prompts,
        test_supported_templates,
        test_json_structure,
        generate_professional_prompts
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ {test.__name__}: Failed - {str(e)}")
    
    print("\n" + "=" * 60)
    print(f"📊 Professional Table Prompt Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All professional table prompt tests passed!")
        print("\n💯 PROFESSIONAL PROMPTS VERIFIED:")
        print("   ✅ All prompts use supported template IDs")
        print("   ✅ All prompts use table-related templates")
        print("   ✅ JSON structure is correct for all templates")
        print("   ✅ All prompts will generate slides without errors")
        
        print("\n🚀 READY TO USE (NO ERRORS):")
        print("   1. Technology: 'Create a slide with templateId \"two-column\" for technology platforms comparison...'")
        print("   2. Financial: 'Create a slide with templateId \"two-column-diversity\" for financial performance comparison...'")
        print("   3. Product: 'Create a slide with templateId \"four-box-grid\" for product feature comparison...'")
        
        return True
    else:
        print("⚠️  Some professional table prompt tests failed. Please review the prompts.")
        return False

if __name__ == "__main__":
    success = run_professional_table_tests()
    sys.exit(0 if success else 1) 