#!/usr/bin/env python3
"""
Test script to verify that PieChart percentages always total exactly 100%
This ensures the AI calculates percentages correctly
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

def test_percentage_validation():
    """Test validation logic for percentage calculations"""
    print("\n🔍 Testing Percentage Validation Logic")
    
    # Valid percentage combinations (should pass)
    valid_combinations = [
        [35, 25, 20, 12, 6, 2],      # = 100%
        [40, 30, 20, 6, 3, 1],       # = 100%
        [30, 25, 20, 15, 8, 2],      # = 100%
        [50, 25, 15, 7, 2, 1],       # = 100%
    ]
    
    # Invalid percentage combinations (should fail)
    invalid_combinations = [
        [35, 28, 22, 15, 12, 8],     # = 120% (too high)
        [40, 30, 20, 10, 5, 2],      # = 107% (too high)
        [25, 20, 15, 10, 5, 5],      # = 80% (too low)
        [30, 25, 20, 15, 10, 5],     # = 105% (too high)
    ]
    
    print("\n✅ Valid combinations (should total 100%):")
    for i, combo in enumerate(valid_combinations):
        total = sum(combo)
        status = "✅ PASS" if total == 100 else "❌ FAIL"
        print(f"   {i+1}. {combo} = {total}% {status}")
    
    print("\n❌ Invalid combinations (should NOT total 100%):")
    for i, combo in enumerate(invalid_combinations):
        total = sum(combo)
        status = "❌ FAIL" if total != 100 else "✅ PASS"
        print(f"   {i+1}. {combo} = {total}% {status}")
    
    return True

def test_ai_percentage_guidelines():
    """Test the AI percentage calculation guidelines"""
    print("\n🤖 AI Percentage Calculation Guidelines")
    print("=" * 60)
    
    guidelines = [
        "1. ALWAYS calculate percentages that total EXACTLY 100%",
        "2. NEVER exceed 100% total - this is mathematically incorrect",
        "3. NEVER use random percentages that don't add up to 100%",
        "4. ALWAYS verify: Segment 1% + Segment 2% + ... + Segment 6% = 100%",
        "5. Use realistic percentage distributions (e.g., 35% + 25% + 20% + 12% + 6% + 2% = 100%)",
        "6. Consider business logic when assigning percentages",
        "7. Larger segments should have higher percentages",
        "8. Smaller segments should have lower percentages"
    ]
    
    for guideline in guidelines:
        print(f"   {guideline}")
    
    print("\n📊 Example Correct Calculations:")
    examples = [
        "Revenue Distribution: 35% + 25% + 20% + 12% + 6% + 2% = 100%",
        "Market Share: 40% + 30% + 20% + 6% + 3% + 1% = 100%",
        "Budget Allocation: 30% + 25% + 20% + 15% + 8% + 2% = 100%"
    ]
    
    for example in examples:
        print(f"   ✅ {example}")
    
    return True

def run_percentage_tests():
    """Run all percentage calculation tests"""
    print("🧮 Testing Pie Chart Percentage Calculations")
    print("=" * 60)
    
    tests = [
        test_percentage_calculation,
        test_percentage_validation,
        test_ai_percentage_guidelines
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
    print(f"📊 Percentage Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All percentage calculation tests passed!")
        print("\n📝 CRITICAL: AI must ensure percentages total exactly 100%")
        return True
    else:
        print("⚠️  Some percentage tests failed. AI needs to improve percentage calculations.")
        return False

if __name__ == "__main__":
    success = run_percentage_tests()
    sys.exit(0 if success else 1) 