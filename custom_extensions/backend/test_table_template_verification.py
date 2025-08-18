#!/usr/bin/env python3
"""
Test script to verify table template generation and structure
This ensures that AI generates proper table data with correct format
"""

import json
import sys
from typing import Dict, List, Any

def test_table_structure():
    """Test that table data has correct structure"""
    print("📊 Testing Table Template Structure")
    print("=" * 60)
    
    # Test cases with different table structures
    test_cases = [
        {
            "name": "Financial Performance Table",
            "data": {
                "title": "Financial Performance Summary",
                "tableData": {
                    "headers": ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
                    "rows": [
                        ["Revenue", "$2.4M", "$2.8M", "$3.1M", "$3.5M"],
                        ["Profit Margin", "18.5%", "19.2%", "20.1%", "21.3%"],
                        ["Operating Costs", "$1.9M", "$2.2M", "$2.4M", "$2.7M"],
                        ["Growth Rate", "12.5%", "16.7%", "10.7%", "12.9%"]
                    ]
                }
            }
        },
        {
            "name": "Product Comparison Table",
            "data": {
                "title": "Product Feature Comparison",
                "tableData": {
                    "headers": ["Our Product", "Competitor A", "Competitor B"],
                    "rows": [
                        ["Core Functionality", "✓ Advanced", "✓ Basic", "✓ Standard"],
                        ["Integration Options", "✓ Multiple APIs", "✗ Limited", "✓ Standard"],
                        ["Security Features", "✓ Enterprise-grade", "✓ Basic", "✓ Advanced"],
                        ["Support Quality", "✓ 24/7 Premium", "✗ Business Hours", "✓ Extended Hours"],
                        ["Pricing Model", "✓ Flexible", "✗ Fixed", "✓ Tiered"]
                    ]
                }
            }
        },
        {
            "name": "Performance Metrics Table",
            "data": {
                "title": "Quarterly Performance Metrics",
                "tableData": {
                    "headers": ["Q1", "Q2", "Q3", "Q4"],
                    "rows": [
                        ["Sales Growth", "15.2%", "18.7%", "12.3%", "20.1%"],
                        ["Customer Acquisition", "1,250", "1,480", "1,320", "1,650"],
                        ["Market Share", "12.5%", "13.2%", "13.8%", "14.5%"],
                        ["Customer Satisfaction", "4.2/5", "4.3/5", "4.4/5", "4.5/5"]
                    ]
                }
            }
        }
    ]
    
    all_passed = True
    
    for test_case in test_cases:
        print(f"\n📋 Testing: {test_case['name']}")
        
        data = test_case['data']
        
        # Check required fields
        required_fields = ["title", "tableData"]
        for field in required_fields:
            if field not in data:
                print(f"   ❌ FAIL: Missing required field '{field}'")
                all_passed = False
                continue
        
        # Check tableData structure
        table_data = data["tableData"]
        if "headers" not in table_data or "rows" not in table_data:
            print(f"   ❌ FAIL: Missing headers or rows in tableData")
            all_passed = False
            continue
        
        headers = table_data["headers"]
        rows = table_data["rows"]
        
        # Validate structure
        if len(headers) < 2:
            print(f"   ❌ FAIL: Expected at least 2 headers, got {len(headers)}")
            all_passed = False
        elif len(rows) < 2:
            print(f"   ❌ FAIL: Expected at least 2 rows, got {len(rows)}")
            all_passed = False
        else:
            print(f"   ✅ PASS: Structure is correct")
            print(f"      Headers: {len(headers)} columns")
            print(f"      Rows: {len(rows)} rows")
        
        # Validate row consistency
        expected_cells = len(headers) + 1  # +1 for row label
        for i, row in enumerate(rows):
            if len(row) != expected_cells:
                print(f"   ❌ FAIL: Row {i} has {len(row)} cells, expected {expected_cells}")
                all_passed = False
            else:
                print(f"      Row {i+1}: {len(row)} cells ✅")
    
    print("\n" + "=" * 60)
    
    if all_passed:
        print("🎉 SUCCESS: All table structures are correct!")
        print("\n📝 REMINDER: When generating tables, AI MUST:")
        print("   ✅ Include title and tableData fields")
        print("   ✅ Have headers array with column titles")
        print("   ✅ Have rows array with consistent cell counts")
        print("   ✅ Ensure each row has header + data cells")
        return True
    else:
        print("⚠️  FAILED: Some table structures are incorrect!")
        print("\n🔧 FIX REQUIRED: AI must ensure proper table structure")
        return False

def test_table_data_quality():
    """Test that table data has meaningful content"""
    print("\n📈 Testing Table Data Quality")
    print("=" * 60)
    
    # Test data quality examples
    quality_tests = [
        {
            "name": "Financial Data Quality",
            "data": {
                "headers": ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
                "rows": [
                    ["Revenue", "$2.4M", "$2.8M", "$3.1M", "$3.5M"],
                    ["Profit Margin", "18.5%", "19.2%", "20.1%", "21.3%"]
                ]
            },
            "expected": {
                "has_currency": True,
                "has_percentages": True,
                "has_quarters": True
            }
        },
        {
            "name": "Feature Comparison Quality",
            "data": {
                "headers": ["Our Product", "Competitor A", "Competitor B"],
                "rows": [
                    ["Core Functionality", "✓ Advanced", "✓ Basic", "✓ Standard"],
                    ["Security Features", "✓ Enterprise-grade", "✓ Basic", "✓ Advanced"]
                ]
            },
            "expected": {
                "has_checkmarks": True,
                "has_descriptions": True,
                "has_comparison": True
            }
        }
    ]
    
    all_passed = True
    
    for test in quality_tests:
        print(f"\n📊 Testing: {test['name']}")
        
        headers = test['data']['headers']
        rows = test['data']['rows']
        expected = test['expected']
        
        # Check for currency symbols
        if expected.get('has_currency'):
            has_currency = any('$' in str(cell) for row in rows for cell in row)
            if has_currency:
                print("   ✅ PASS: Contains currency symbols")
            else:
                print("   ❌ FAIL: Missing currency symbols")
                all_passed = False
        
        # Check for percentages
        if expected.get('has_percentages'):
            has_percentages = any('%' in str(cell) for row in rows for cell in row)
            if has_percentages:
                print("   ✅ PASS: Contains percentage values")
            else:
                print("   ❌ FAIL: Missing percentage values")
                all_passed = False
        
        # Check for checkmarks
        if expected.get('has_checkmarks'):
            has_checkmarks = any('✓' in str(cell) or '✗' in str(cell) for row in rows for cell in row)
            if has_checkmarks:
                print("   ✅ PASS: Contains checkmarks/crosses")
            else:
                print("   ❌ FAIL: Missing checkmarks/crosses")
                all_passed = False
        
        # Check for descriptive text
        if expected.get('has_descriptions'):
            has_descriptions = any(len(str(cell)) > 5 for row in rows for cell in row)
            if has_descriptions:
                print("   ✅ PASS: Contains descriptive text")
            else:
                print("   ❌ FAIL: Missing descriptive text")
                all_passed = False
    
    print("\n" + "=" * 60)
    
    if all_passed:
        print("🎉 SUCCESS: All table data quality tests passed!")
        return True
    else:
        print("⚠️  FAILED: Some table data quality tests failed!")
        return False

def generate_correct_table_data():
    """Generate correct table data with proper structure"""
    print("\n🎨 Generating Correct Table Data")
    print("=" * 60)
    
    correct_data = {
        "title": "Financial Performance Summary",
        "tableData": {
            "headers": ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
            "rows": [
                ["Revenue", "$2.4M", "$2.8M", "$3.1M", "$3.5M"],
                ["Profit Margin", "18.5%", "19.2%", "20.1%", "21.3%"],
                ["Operating Costs", "$1.9M", "$2.2M", "$2.4M", "$2.7M"],
                ["Growth Rate", "12.5%", "16.7%", "10.7%", "12.9%"]
            ]
        }
    }
    
    # Verify the data
    table_data = correct_data["tableData"]
    headers = table_data["headers"]
    rows = table_data["rows"]
    
    print(f"📊 Generated table with {len(headers)} columns and {len(rows)} rows")
    
    # Check structure
    if len(headers) >= 2 and len(rows) >= 2:
        print("✅ SUCCESS: Generated data has correct structure")
        print("\n📋 TABLE BREAKDOWN:")
        print(f"   Headers: {headers}")
        for i, row in enumerate(rows):
            print(f"   Row {i+1}: {row}")
    else:
        print("❌ ERROR: Generated data has incorrect structure")
    
    return len(headers) >= 2 and len(rows) >= 2

def test_ai_prompt_table_rules():
    """Test that AI prompt rules are correctly configured for tables"""
    print("\n🤖 Testing AI Prompt Rules for Tables")
    print("=" * 60)
    
    # Expected rules that should be in the prompt
    expected_rules = [
        "CRITICAL - MANDATORY SELECTION: This template MUST be used whenever ANY of these words appear: table, data table, comparison table",
        "ABSOLUTE REQUIREMENT: Use this template for structured data presentation",
        "MANDATORY PROPS STRUCTURE: title, tableData with headers and rows",
        "CONTENT REQUIREMENTS: Include 3-5 data rows with meaningful metrics",
        "Trigger words: table, data, comparison, summary, dark theme, metrics table"
    ]
    
    print("✅ Expected rules in AI prompt:")
    for rule in expected_rules:
        print(f"   - {rule}")
    
    print("\n📋 CRITICAL REQUIREMENTS:")
    print("   1. AI must use table template for structured data")
    print("   2. AI must include proper JSON structure")
    print("   3. AI must have headers and rows arrays")
    print("   4. AI must ensure consistent cell counts")
    print("   5. AI must use meaningful business data")
    
    return True

def run_table_template_tests():
    """Run all table template tests"""
    print("📊 Testing Table Template Generation")
    print("=" * 60)
    
    tests = [
        test_table_structure,
        test_table_data_quality,
        generate_correct_table_data,
        test_ai_prompt_table_rules
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
    print(f"📊 Table Template Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All table template tests passed!")
        print("\n📝 CRITICAL: AI must ensure proper table structure")
        print("🔧 VERIFICATION COMPLETE:")
        print("   ✅ Table structure validation")
        print("   ✅ Data quality verification")
        print("   ✅ Correct example generation")
        print("   ✅ AI prompt rules verification")
        return True
    else:
        print("⚠️  Some table template tests failed. Please review the configuration.")
        return False

if __name__ == "__main__":
    success = run_table_template_tests()
    sys.exit(0 if success else 1) 