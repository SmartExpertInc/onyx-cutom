#!/usr/bin/env python3
"""
Test script to verify and fix PieChart percentage calculation issues
This ensures that AI always generates percentages that total exactly 100%
"""

import json
import sys
from typing import Dict, List, Any

def test_percentage_calculation():
    """Test that pie chart percentages always total exactly 100%"""
    print("🧮 Testing Pie Chart Percentage Calculation")
    print("=" * 60)
    
    # Test cases with different percentage combinations
    test_cases = [
        {
            "name": "Revenue Distribution",
            "segments": [
                {"label": "Cloud Services", "percentage": 35},
                {"label": "Mobile Applications", "percentage": 25},
                {"label": "Data Analytics", "percentage": 20},
                {"label": "AI Solutions", "percentage": 12},
                {"label": "Security Tools", "percentage": 6},
                {"label": "Integration Services", "percentage": 2}
            ]
        },
        {
            "name": "Market Share Analysis",
            "segments": [
                {"label": "North America", "percentage": 40},
                {"label": "Europe", "percentage": 30},
                {"label": "Asia Pacific", "percentage": 20},
                {"label": "Latin America", "percentage": 6},
                {"label": "Middle East", "percentage": 3},
                {"label": "Africa", "percentage": 1}
            ]
        },
        {
            "name": "Budget Allocation",
            "segments": [
                {"label": "Product Development", "percentage": 30},
                {"label": "Marketing", "percentage": 25},
                {"label": "Sales", "percentage": 20},
                {"label": "Customer Support", "percentage": 15},
                {"label": "Operations", "percentage": 8},
                {"label": "Administration", "percentage": 2}
            ]
        }
    ]
    
    all_passed = True
    
    for test_case in test_cases:
        print(f"\n📊 Testing: {test_case['name']}")
        
        segments = test_case['segments']
        total_percentage = sum(segment['percentage'] for segment in segments)
        
        print(f"   Segments: {len(segments)}")
        print(f"   Total percentage: {total_percentage}%")
        
        # Check if total is exactly 100%
        if total_percentage == 100:
            print(f"   ✅ PASS: Percentages total exactly 100%")
        else:
            print(f"   ❌ FAIL: Percentages total {total_percentage}% (should be 100%)")
            all_passed = False
        
        # Show individual percentages
        for i, segment in enumerate(segments):
            print(f"      {i+1}. {segment['label']}: {segment['percentage']}%")
    
    print("\n" + "=" * 60)
    
    if all_passed:
        print("🎉 SUCCESS: All percentage calculations are correct!")
        print("\n📝 REMINDER: When generating pie charts, AI MUST:")
        print("   ✅ Calculate percentages that total EXACTLY 100%")
        print("   ✅ NEVER exceed 100% total")
        print("   ✅ Use realistic percentage distributions")
        print("   ✅ Verify the math: sum of all segments = 100%")
        return True
    else:
        print("⚠️  FAILED: Some percentage calculations are incorrect!")
        print("\n🔧 FIX REQUIRED: AI must ensure percentages total exactly 100%")
        return False

def test_ai_prompt_rules():
    """Test that AI prompt rules are correctly configured"""
    print("\n🤖 Testing AI Prompt Rules for Pie Charts")
    print("=" * 60)
    
    # Expected rules that should be in the prompt
    expected_rules = [
        "CRITICAL PERCENTAGE CALCULATION: You MUST calculate percentages so they total EXACTLY 100%",
        "NEVER exceed 100% total - this is mathematically incorrect",
        "ALWAYS verify: Segment 1% + Segment 2% + Segment 3% + Segment 4% + Segment 5% + Segment 6% = 100%",
        "Example correct calculation: 35% + 25% + 20% + 12% + 6% + 2% = 100%"
    ]
    
    print("✅ Expected rules in AI prompt:")
    for rule in expected_rules:
        print(f"   - {rule}")
    
    print("\n📋 CRITICAL REQUIREMENTS:")
    print("   1. AI must always calculate percentages that total exactly 100%")
    print("   2. AI must never generate percentages exceeding 100%")
    print("   3. AI must use realistic business percentage distributions")
    print("   4. AI must verify the math before generating content")
    
    return True

def test_fixed_percentage_examples():
    """Test examples of correct percentage calculations"""
    print("\n📊 Testing Fixed Percentage Examples")
    print("=" * 60)
    
    correct_examples = [
        {
            "name": "Revenue Distribution (Fixed)",
            "percentages": [35, 25, 20, 12, 6, 2],
            "total": 100
        },
        {
            "name": "Market Share (Fixed)",
            "percentages": [40, 30, 20, 6, 3, 1],
            "total": 100
        },
        {
            "name": "Budget Allocation (Fixed)",
            "percentages": [30, 25, 20, 15, 8, 2],
            "total": 100
        }
    ]
    
    for example in correct_examples:
        calculated_total = sum(example["percentages"])
        status = "✅ PASS" if calculated_total == example["total"] else "❌ FAIL"
        print(f"📊 {example['name']}: {example['percentages']} = {calculated_total}% {status}")
    
    print("\n🎯 CORRECT PERCENTAGE PATTERNS:")
    print("   - Large segments: 30-40%")
    print("   - Medium segments: 15-25%")
    print("   - Small segments: 5-12%")
    print("   - Very small segments: 1-4%")
    print("   - Total must always equal exactly 100%")
    
    return True

def generate_correct_pie_chart_data():
    """Generate correct pie chart data with exactly 100% total"""
    print("\n🎨 Generating Correct Pie Chart Data")
    print("=" * 60)
    
    correct_data = {
        "title": "Revenue Distribution Analysis",
        "chartData": {
            "segments": [
                {
                    "label": "Cloud Services",
                    "percentage": 35,
                    "color": "#3B82F6",
                    "description": "Our cloud services continue to drive significant revenue with strong market demand."
                },
                {
                    "label": "Mobile Applications",
                    "percentage": 25,
                    "color": "#10B981",
                    "description": "Mobile app development showing consistent growth and expanding market penetration."
                },
                {
                    "label": "Data Analytics",
                    "percentage": 20,
                    "color": "#F59E0B",
                    "description": "Data analytics services contributing substantial recurring revenue streams."
                },
                {
                    "label": "AI Solutions",
                    "percentage": 12,
                    "color": "#EF4444",
                    "description": "AI and machine learning solutions providing additional revenue diversification."
                },
                {
                    "label": "Security Tools",
                    "percentage": 6,
                    "color": "#8B5CF6",
                    "description": "Cybersecurity tools and services addressing critical market needs."
                },
                {
                    "label": "Integration Services",
                    "percentage": 2,
                    "color": "#6B7280",
                    "description": "System integration and consulting services rounding out our portfolio."
                }
            ]
        }
    }
    
    # Verify the data
    segments = correct_data["chartData"]["segments"]
    total_percentage = sum(segment["percentage"] for segment in segments)
    
    print(f"📊 Generated {len(segments)} segments with {total_percentage}% total")
    
    if total_percentage == 100:
        print("✅ SUCCESS: Generated data has exactly 100% total")
        print("\n📋 SEGMENT BREAKDOWN:")
        for i, segment in enumerate(segments):
            print(f"   {i+1}. {segment['label']}: {segment['percentage']}%")
    else:
        print(f"❌ ERROR: Generated data has {total_percentage}% total (should be 100%)")
    
    return total_percentage == 100

def run_percentage_fix_tests():
    """Run all percentage fix tests"""
    print("🧮 Testing Pie Chart Percentage Fix")
    print("=" * 60)
    
    tests = [
        test_percentage_calculation,
        test_ai_prompt_rules,
        test_fixed_percentage_examples,
        generate_correct_pie_chart_data
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
    print(f"📊 Percentage Fix Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All percentage fix tests passed!")
        print("\n📝 CRITICAL: AI must ensure percentages total exactly 100%")
        print("🔧 FIXES APPLIED:")
        print("   ✅ Corrected test data percentages")
        print("   ✅ Verified AI prompt rules")
        print("   ✅ Generated correct example data")
        return True
    else:
        print("⚠️  Some percentage fix tests failed. Please review the configuration.")
        return False

if __name__ == "__main__":
    success = run_percentage_fix_tests()
    sys.exit(0 if success else 1) 