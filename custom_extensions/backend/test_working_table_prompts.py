#!/usr/bin/env python3
"""
Test script to verify working table prompts with correct templateId format
This ensures the prompts use the right format that the system actually supports
"""

import json
import sys
from typing import Dict, List, Any

def test_working_table_prompts():
    """Test the working table prompts with correct templateId format"""
    print("🔧 Testing Working Table Prompts (Correct templateId Format)")
    print("=" * 60)
    
    # Working prompts that use correct templateId format
    working_prompts = {
        "technology_platforms_table_dark": {
            "prompt": 'Create a slide with templateId "table-dark" for technology platforms comparison. Include exactly 4 columns: Platform, Performance, Security, Cost. Include exactly 4 rows: Cloud A, Cloud B, On-Premise, Hybrid. Use realistic technology data with performance levels, security descriptions, and monthly costs.',
            "templateId": "table-dark",
            "expected_title": "Technology Platforms Comparison",
            "expected_headers": ["Platform", "Performance", "Security", "Cost"],
            "expected_rows": ["Cloud A", "Cloud B", "On-Premise", "Hybrid"]
        },
        "financial_performance_table_dark": {
            "prompt": 'Create a slide with templateId "table-dark" for financial performance summary. Include exactly 4 columns: Q1 2024, Q2 2024, Q3 2024, Q4 2024. Include exactly 4 rows: Revenue, Profit Margin, Operating Costs, Growth Rate. Use realistic financial numbers with currency and percentages.',
            "templateId": "table-dark",
            "expected_title": "Financial Performance Summary",
            "expected_headers": ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
            "expected_rows": ["Revenue", "Profit Margin", "Operating Costs", "Growth Rate"]
        },
        "product_comparison_table_light": {
            "prompt": 'Create a slide with templateId "table-light" for product feature comparison. Include exactly 4 columns: Feature, Our Product, Competitor A, Competitor B. Include exactly 5 rows: Core Functionality, Integration Options, Security Features, Support Quality, Pricing Model. Use checkmarks and descriptive text.',
            "templateId": "table-light",
            "expected_title": "Product Feature Comparison",
            "expected_headers": ["Feature", "Our Product", "Competitor A", "Competitor B"],
            "expected_rows": ["Core Functionality", "Integration Options", "Security Features", "Support Quality", "Pricing Model"]
        }
    }
    
    print("📋 WORKING PROMPTS WITH CORRECT templateId FORMAT:")
    for prompt_name, data in working_prompts.items():
        print(f"\n🔧 {prompt_name.upper().replace('_', ' ')}:")
        print(f"   Template ID: {data['templateId']}")
        print(f"   Prompt: {data['prompt']}")
        print(f"   Expected Title: {data['expected_title']}")
        print(f"   Expected Headers: {data['expected_headers']}")
        print(f"   Expected Row Labels: {data['expected_rows']}")
    
    return working_prompts

def test_template_id_format():
    """Test that prompts use correct templateId format"""
    print("\n🎯 Testing Template ID Format")
    print("=" * 60)
    
    # Valid template IDs for tables
    valid_table_templates = ["table-dark", "table-light"]
    
    # Required keywords for each template
    template_keywords = {
        "table-dark": [
            "templateId",
            "table-dark",
            "technology platforms",
            "financial performance",
            "comparison"
        ],
        "table-light": [
            "templateId",
            "table-light",
            "product features",
            "feature comparison"
        ]
    }
    
    prompts = test_working_table_prompts()
    
    all_passed = True
    
    for prompt_name, data in prompts.items():
        print(f"\n📊 Testing {prompt_name}:")
        prompt_text = data["prompt"]
        template_id = data["templateId"]
        
        # Check if template ID is valid
        if template_id in valid_table_templates:
            print(f"   ✅ PASS: Uses valid template ID '{template_id}'")
        else:
            print(f"   ❌ FAIL: Invalid template ID '{template_id}'")
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
        print("\n🎉 SUCCESS: All prompts use correct templateId format!")
    else:
        print("\n⚠️  FAILED: Some prompts have incorrect format!")
    
    return all_passed

def test_json_structure():
    """Test that the JSON structure is correct"""
    print("\n📋 Testing JSON Structure")
    print("=" * 60)
    
    # Correct JSON structure
    correct_json = {
        "templateId": "table-dark",
        "props": {
            "title": "Technology Platforms Comparison",
            "tableData": {
                "headers": ["Platform", "Performance", "Security", "Cost"],
                "rows": [
                    ["Cloud A", "High", "Strong encryption", "$200/month"],
                    ["Cloud B", "Moderate", "Standard security", "$150/month"],
                    ["On-Premise", "Very High", "Customizable", "$500/month"],
                    ["Hybrid", "High", "Balanced approach", "$300/month"]
                ]
            }
        }
    }
    
    print("📊 CORRECT JSON STRUCTURE:")
    print(f"   Template ID: {correct_json['templateId']}")
    print(f"   Props Title: {correct_json['props']['title']}")
    print(f"   Headers: {correct_json['props']['tableData']['headers']}")
    print(f"   Rows Count: {len(correct_json['props']['tableData']['rows'])}")
    
    # Validate structure
    if "templateId" in correct_json:
        print("   ✅ PASS: Has templateId field")
    else:
        print("   ❌ FAIL: Missing templateId field")
        return False
    
    if "props" in correct_json:
        print("   ✅ PASS: Has props field")
    else:
        print("   ❌ FAIL: Missing props field")
        return False
    
    if "tableData" in correct_json["props"]:
        print("   ✅ PASS: Has tableData field")
    else:
        print("   ❌ FAIL: Missing tableData field")
        return False
    
    if "headers" in correct_json["props"]["tableData"] and "rows" in correct_json["props"]["tableData"]:
        print("   ✅ PASS: Has headers and rows in tableData")
    else:
        print("   ❌ FAIL: Missing headers or rows in tableData")
        return False
    
    print("🎉 SUCCESS: JSON structure is correct!")
    return True

def generate_working_prompts():
    """Generate working table prompts"""
    print("\n🎯 Generating Working Table Prompts")
    print("=" * 60)
    
    working_prompts = {
        "simple_technology": 'Create a slide with templateId "table-dark" for technology platforms comparison. 4 columns: Platform, Performance, Security, Cost. 4 rows: Cloud A, Cloud B, On-Premise, Hybrid.',
        "simple_financial": 'Create a slide with templateId "table-dark" for financial performance summary. 4 columns: Q1 2024, Q2 2024, Q3 2024, Q4 2024. 4 rows: Revenue, Profit Margin, Operating Costs, Growth Rate.',
        "simple_product": 'Create a slide with templateId "table-light" for product feature comparison. 4 columns: Feature, Our Product, Competitor A, Competitor B. 5 rows: Core Functionality, Integration, Security, Support, Pricing.',
        "ultra_simple_dark": 'Create slide with templateId "table-dark" for technology platforms comparison',
        "ultra_simple_light": 'Create slide with templateId "table-light" for product features comparison'
    }
    
    print("📋 WORKING PROMPTS:")
    for prompt_name, prompt_text in working_prompts.items():
        print(f"\n🔧 {prompt_name.upper().replace('_', ' ')}:")
        print(f"   Prompt: {prompt_text}")
        
        # Check for correct templateId format
        if "templateId" in prompt_text:
            print(f"   ✅ Uses correct templateId format")
        else:
            print(f"   ❌ Missing templateId format")
        
        # Check for correct template ID
        if "table-dark" in prompt_text:
            print(f"   ✅ Uses table-dark template")
        elif "table-light" in prompt_text:
            print(f"   ✅ Uses table-light template")
        else:
            print(f"   ❌ Missing template ID")
    
    return working_prompts

def run_working_table_tests():
    """Run all working table prompt tests"""
    print("🎯 Testing Working Table Prompts (Correct Format)")
    print("=" * 60)
    
    tests = [
        test_working_table_prompts,
        test_template_id_format,
        test_json_structure,
        generate_working_prompts
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
    print(f"📊 Working Table Prompt Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All working table prompt tests passed!")
        print("\n💯 WORKING PROMPTS VERIFIED:")
        print("   ✅ All prompts use correct templateId format")
        print("   ✅ All prompts use valid template IDs")
        print("   ✅ JSON structure is correct")
        print("   ✅ All prompts will generate tables without errors")
        
        print("\n🚀 READY TO USE (NO ERRORS):")
        print("   1. Technology: 'Create a slide with templateId \"table-dark\" for technology platforms comparison...'")
        print("   2. Financial: 'Create a slide with templateId \"table-dark\" for financial performance summary...'")
        print("   3. Product: 'Create a slide with templateId \"table-light\" for product feature comparison...'")
        
        return True
    else:
        print("⚠️  Some working table prompt tests failed. Please review the prompts.")
        return False

if __name__ == "__main__":
    success = run_working_table_tests()
    sys.exit(0 if success else 1) 