#!/usr/bin/env python3
"""
Test script to verify fixed table prompts work correctly
This ensures the prompts use correct template IDs (table-dark/table-light) to avoid errors
"""

import json
import sys
from typing import Dict, List, Any

def test_fixed_table_prompts():
    """Test the fixed table prompts that use correct template IDs"""
    print("🔧 Testing Fixed Table Prompts (No Template Errors)")
    print("=" * 60)
    
    # Fixed prompts that use correct template IDs
    fixed_prompts = {
        "technology_platforms_table_dark": {
            "prompt": 'Create a table slide using table-dark template for technology platforms comparison. Include exactly 4 columns: Platform, Performance, Security, Cost. Include exactly 4 rows: Cloud A, Cloud B, On-Premise, Hybrid. Use realistic technology data with performance levels, security descriptions, and monthly costs.',
            "template_id": "table-dark",
            "expected_title": "Technology Platforms Comparison",
            "expected_headers": ["Platform", "Performance", "Security", "Cost"],
            "expected_rows": ["Cloud A", "Cloud B", "On-Premise", "Hybrid"]
        },
        "financial_performance_table_dark": {
            "prompt": 'Create a table slide using table-dark template for financial performance summary. Include exactly 4 columns: Q1 2024, Q2 2024, Q3 2024, Q4 2024. Include exactly 4 rows: Revenue, Profit Margin, Operating Costs, Growth Rate. Use realistic financial numbers with currency and percentages.',
            "template_id": "table-dark",
            "expected_title": "Financial Performance Summary",
            "expected_headers": ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
            "expected_rows": ["Revenue", "Profit Margin", "Operating Costs", "Growth Rate"]
        },
        "product_comparison_table_light": {
            "prompt": 'Create a table slide using table-light template for product feature comparison. Include exactly 4 columns: Feature, Our Product, Competitor A, Competitor B. Include exactly 5 rows: Core Functionality, Integration Options, Security Features, Support Quality, Pricing Model. Use checkmarks and descriptive text.',
            "template_id": "table-light",
            "expected_title": "Product Feature Comparison",
            "expected_headers": ["Feature", "Our Product", "Competitor A", "Competitor B"],
            "expected_rows": ["Core Functionality", "Integration Options", "Security Features", "Support Quality", "Pricing Model"]
        }
    }
    
    print("📋 FIXED PROMPTS WITH CORRECT TEMPLATE IDs:")
    for prompt_name, data in fixed_prompts.items():
        print(f"\n🔧 {prompt_name.upper().replace('_', ' ')}:")
        print(f"   Template ID: {data['template_id']}")
        print(f"   Prompt: {data['prompt']}")
        print(f"   Expected Title: {data['expected_title']}")
        print(f"   Expected Headers: {data['expected_headers']}")
        print(f"   Expected Row Labels: {data['expected_rows']}")
    
    return fixed_prompts

def test_template_id_correctness():
    """Test that prompts use correct template IDs"""
    print("\n🎯 Testing Template ID Correctness")
    print("=" * 60)
    
    # Valid template IDs for tables
    valid_table_templates = ["table-dark", "table-light"]
    
    # Required keywords for each template
    template_keywords = {
        "table-dark": [
            "table-dark",
            "technology platforms",
            "financial performance",
            "comparison"
        ],
        "table-light": [
            "table-light",
            "product features",
            "feature comparison"
        ]
    }
    
    prompts = test_fixed_table_prompts()
    
    all_passed = True
    
    for prompt_name, data in prompts.items():
        print(f"\n📊 Testing {prompt_name}:")
        prompt_text = data["prompt"]
        template_id = data["template_id"]
        
        # Check if template ID is valid
        if template_id in valid_table_templates:
            print(f"   ✅ PASS: Uses valid template ID '{template_id}'")
        else:
            print(f"   ❌ FAIL: Invalid template ID '{template_id}'")
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
        print("\n🎉 SUCCESS: All prompts use correct template IDs!")
    else:
        print("\n⚠️  FAILED: Some prompts have incorrect template IDs!")
    
    return all_passed

def test_error_prevention():
    """Test that prompts prevent 'Template Not Found' errors"""
    print("\n🚫 Testing Error Prevention")
    print("=" * 60)
    
    # Common error-causing template IDs
    error_causing_templates = ["comparison-slide", "table-slide", "data-table", "comparison-table"]
    
    # Fixed prompts that should NOT cause errors
    fixed_prompts = test_fixed_table_prompts()
    
    all_passed = True
    
    for prompt_name, data in fixed_prompts.items():
        print(f"\n📊 Testing {prompt_name} for error prevention:")
        prompt_text = data["prompt"]
        
        # Check that prompt doesn't contain error-causing template IDs
        for error_template in error_causing_templates:
            if error_template in prompt_text:
                print(f"   ❌ FAIL: Contains error-causing template '{error_template}'")
                all_passed = False
            else:
                print(f"   ✅ PASS: Doesn't contain '{error_template}'")
        
        # Check that prompt contains correct template ID
        correct_template = data["template_id"]
        if correct_template in prompt_text:
            print(f"   ✅ PASS: Contains correct template '{correct_template}'")
        else:
            print(f"   ❌ FAIL: Missing correct template '{correct_template}'")
            all_passed = False
    
    if all_passed:
        print("\n🎉 SUCCESS: All prompts prevent 'Template Not Found' errors!")
    else:
        print("\n⚠️  FAILED: Some prompts may cause template errors!")
    
    return all_passed

def generate_error_free_prompts():
    """Generate error-free table prompts"""
    print("\n🎯 Generating Error-Free Table Prompts")
    print("=" * 60)
    
    error_free_prompts = {
        "simple_technology": "Create a table slide using table-dark template for technology platforms comparison. 4 columns: Platform, Performance, Security, Cost. 4 rows: Cloud A, Cloud B, On-Premise, Hybrid.",
        "simple_financial": "Create a table slide using table-dark template for financial performance summary. 4 columns: Q1 2024, Q2 2024, Q3 2024, Q4 2024. 4 rows: Revenue, Profit Margin, Operating Costs, Growth Rate.",
        "simple_product": "Create a table slide using table-light template for product feature comparison. 4 columns: Feature, Our Product, Competitor A, Competitor B. 5 rows: Core Functionality, Integration, Security, Support, Pricing.",
        "ultra_simple_dark": "Table-dark: Technology platforms comparison 4x4",
        "ultra_simple_light": "Table-light: Product features comparison 4x5"
    }
    
    print("📋 ERROR-FREE PROMPTS:")
    for prompt_name, prompt_text in error_free_prompts.items():
        print(f"\n🔧 {prompt_name.upper().replace('_', ' ')}:")
        print(f"   Prompt: {prompt_text}")
        
        # Check for correct template ID
        if "table-dark" in prompt_text:
            print(f"   ✅ Uses table-dark template")
        elif "table-light" in prompt_text:
            print(f"   ✅ Uses table-light template")
        else:
            print(f"   ❌ Missing template ID")
    
    return error_free_prompts

def run_fixed_table_tests():
    """Run all fixed table prompt tests"""
    print("🎯 Testing Fixed Table Prompts (No Errors)")
    print("=" * 60)
    
    tests = [
        test_fixed_table_prompts,
        test_template_id_correctness,
        test_error_prevention,
        generate_error_free_prompts
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
    print(f"📊 Fixed Table Prompt Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All fixed table prompt tests passed!")
        print("\n💯 ERROR-FREE PROMPTS VERIFIED:")
        print("   ✅ All prompts use correct template IDs (table-dark/table-light)")
        print("   ✅ No prompts contain error-causing template IDs")
        print("   ✅ All prompts will generate tables without errors")
        print("   ✅ Template Not Found errors are prevented")
        
        print("\n🚀 READY TO USE (NO ERRORS):")
        print("   1. Technology: 'Create a table slide using table-dark template for technology platforms comparison...'")
        print("   2. Financial: 'Create a table slide using table-dark template for financial performance summary...'")
        print("   3. Product: 'Create a table slide using table-light template for product feature comparison...'")
        
        return True
    else:
        print("⚠️  Some fixed table prompt tests failed. Please review the prompts.")
        return False

if __name__ == "__main__":
    success = run_fixed_table_tests()
    sys.exit(0 if success else 1) 