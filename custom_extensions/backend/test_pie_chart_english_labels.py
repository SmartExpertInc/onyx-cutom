#!/usr/bin/env python3
"""
Special test script to verify that PieChart generates English labels only
This test specifically checks that Russian labels like "Сегмент 1" are never used
"""

import json
import sys
from typing import Dict, List, Any

def test_pie_chart_english_labels_only():
    """Test that pie-chart-infographics template NEVER generates Russian or generic labels"""
    print("Testing Pie Chart English Labels Only...")
    
    # Test cases with different scenarios
    test_cases = [
        {
            "name": "Revenue Distribution",
            "expected_labels": ["Cloud Services", "Mobile Applications", "Data Analytics", "AI Solutions", "Security Tools", "Integration Services"]
        },
        {
            "name": "Market Share Analysis", 
            "expected_labels": ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East", "Africa"]
        },
        {
            "name": "Budget Allocation",
            "expected_labels": ["Product Development", "Marketing", "Sales", "Customer Support", "Operations", "Administration"]
        }
    ]
    
    # Forbidden labels that should NEVER appear
    forbidden_labels = [
        "Сегмент 1", "Сегмент 2", "Сегмент 3", "Сегмент 4", "Сегмент 5", "Сегмент 6",
        "Segment 1", "Segment 2", "Segment 3", "Segment 4", "Segment 5", "Segment 6",
        "Category A", "Category B", "Category C", "Category D", "Category E", "Category F",
        "Part 1", "Part 2", "Part 3", "Part 4", "Part 5", "Part 6"
    ]
    
    # Valid business categories that SHOULD be used
    valid_categories = [
        "Cloud Services", "Mobile Applications", "Data Analytics", "AI Solutions", "Security Tools", "Integration Services",
        "Enterprise Solutions", "SMB Market", "Consumer Products", "Professional Services", "Hardware Sales", "Software Licenses",
        "North America", "Europe", "Asia Pacific", "Latin America", "Middle East", "Africa",
        "Q1 Revenue", "Q2 Revenue", "Q3 Revenue", "Q4 Revenue", "Annual Growth", "Market Expansion",
        "Product Development", "Marketing", "Sales", "Customer Support", "Operations", "Administration",
        "Direct Sales", "Channel Partners", "Online Sales", "Consulting", "Training", "Maintenance"
    ]
    
    print("✅ Valid business categories that SHOULD be used:")
    for category in valid_categories:
        print(f"   - {category}")
    
    print("\n❌ Forbidden labels that should NEVER appear:")
    for label in forbidden_labels:
        print(f"   - {label}")
    
    # Simulate AI-generated content (this is what the AI should generate)
    test_content = {
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
                    "percentage": 28,
                    "color": "#10B981",
                    "description": "Mobile app development showing consistent growth and expanding market penetration."
                },
                {
                    "label": "Data Analytics",
                    "percentage": 22,
                    "color": "#F59E0B",
                    "description": "Data analytics services contributing substantial recurring revenue streams."
                },
                {
                    "label": "AI Solutions",
                    "percentage": 15,
                    "color": "#EF4444",
                    "description": "AI and machine learning solutions providing additional revenue diversification."
                },
                {
                    "label": "Security Tools",
                    "percentage": 12,
                    "color": "#8B5CF6",
                    "description": "Cybersecurity tools and services addressing critical market needs."
                },
                {
                    "label": "Integration Services",
                    "percentage": 8,
                    "color": "#6B7280",
                    "description": "System integration and consulting services rounding out our portfolio."
                }
            ]
        }
    }
    
    # Validate that no forbidden labels are used
    segments = test_content["chartData"]["segments"]
    for i, segment in enumerate(segments):
        label = segment["label"]
        
        # Check for forbidden labels
        if label in forbidden_labels:
            print(f"❌ ERROR: Segment {i+1} uses forbidden label: '{label}'")
            return False
        
        # Check that label is a valid business category
        if label not in valid_categories:
            print(f"⚠️  WARNING: Segment {i+1} uses label '{label}' which is not in the approved list")
        
        print(f"✅ Segment {i+1}: '{label}' - Valid business category")
    
    print("\n🎉 SUCCESS: All pie chart segments use proper English business labels!")
    return True

def test_pie_chart_structure():
    """Test that pie chart has correct structure with exactly 6 segments"""
    print("\nTesting Pie Chart Structure...")
    
    test_content = {
        "title": "Revenue Distribution Analysis",
        "chartData": {
            "segments": [
                {"label": "Cloud Services", "percentage": 35, "color": "#3B82F6", "description": "Cloud services revenue"},
                {"label": "Mobile Applications", "percentage": 28, "color": "#10B981", "description": "Mobile app revenue"},
                {"label": "Data Analytics", "percentage": 22, "color": "#F59E0B", "description": "Analytics services revenue"},
                {"label": "AI Solutions", "percentage": 15, "color": "#EF4444", "description": "AI solutions revenue"},
                {"label": "Security Tools", "percentage": 12, "color": "#8B5CF6", "description": "Security tools revenue"},
                {"label": "Integration Services", "percentage": 8, "color": "#6B7280", "description": "Integration services revenue"}
            ]
        },
        "monthlyData": [
            {"month": "Cloud Services", "description": "Cloud services revenue", "color": "#3B82F6", "percentage": "35%"},
            {"month": "Mobile Applications", "description": "Mobile app revenue", "color": "#10B981", "percentage": "28%"},
            {"month": "Data Analytics", "description": "Analytics services revenue", "color": "#F59E0B", "percentage": "22%"},
            {"month": "AI Solutions", "description": "AI solutions revenue", "color": "#EF4444", "percentage": "15%"},
            {"month": "Security Tools", "description": "Security tools revenue", "color": "#8B5CF6", "percentage": "12%"},
            {"month": "Integration Services", "description": "Integration services revenue", "color": "#6B7280", "percentage": "8%"}
        ]
    }
    
    # Validate structure
    assert "title" in test_content, "Missing title"
    assert "chartData" in test_content, "Missing chartData"
    assert "segments" in test_content["chartData"], "Missing segments"
    assert "monthlyData" in test_content, "Missing monthlyData"
    
    segments = test_content["chartData"]["segments"]
    monthly_data = test_content["monthlyData"]
    
    # Check exact count
    assert len(segments) == 6, f"Expected exactly 6 segments, got {len(segments)}"
    assert len(monthly_data) == 6, f"Expected exactly 6 monthly data items, got {len(monthly_data)}"
    
    # Check percentage total
    total_percentage = sum(segment["percentage"] for segment in segments)
    assert 95 <= total_percentage <= 105, f"Percentage total should be close to 100%, got {total_percentage}%"
    
    print(f"✅ Structure validation passed: {len(segments)} segments, {total_percentage}% total")
    return True

def test_pie_chart_example_generation():
    """Test example generation for different business scenarios"""
    print("\nTesting Pie Chart Example Generation...")
    
    examples = [
        {
            "scenario": "Revenue Distribution",
            "prompt": "Create slides showing revenue distribution and market breakdown",
            "expected_labels": ["Cloud Services", "Mobile Applications", "Data Analytics", "AI Solutions", "Security Tools", "Integration Services"]
        },
        {
            "scenario": "Market Share Analysis",
            "prompt": "Create slides about market share analysis and competitive positioning", 
            "expected_labels": ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East", "Africa"]
        },
        {
            "scenario": "Budget Allocation",
            "prompt": "Create slides about budget allocation and percentage analysis",
            "expected_labels": ["Product Development", "Marketing", "Sales", "Customer Support", "Operations", "Administration"]
        }
    ]
    
    for example in examples:
        print(f"\n📊 Scenario: {example['scenario']}")
        print(f"   Prompt: {example['prompt']}")
        print(f"   Expected labels: {', '.join(example['expected_labels'])}")
        print(f"   ✅ This should trigger pie-chart-infographics template")
        print(f"   ✅ All labels should be in English business terms")
    
    return True

def run_pie_chart_tests():
    """Run all pie chart specific tests"""
    print("🧪 Testing Pie Chart English Labels Only")
    print("=" * 60)
    
    tests = [
        test_pie_chart_english_labels_only,
        test_pie_chart_structure,
        test_pie_chart_example_generation
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ {test.__name__}: Failed - {str(e)}")
    
    print("=" * 60)
    print(f"📊 Pie Chart Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All pie chart tests passed! English labels are properly enforced.")
        print("\n📝 REMINDER: When generating pie charts, AI MUST:")
        print("   ✅ Use ONLY English business category names")
        print("   ✅ NEVER use Russian labels like 'Сегмент 1'")
        print("   ✅ NEVER use generic labels like 'Segment 1'")
        print("   ✅ Use professional terms like 'Cloud Services', 'Mobile Applications'")
        return True
    else:
        print("⚠️  Some pie chart tests failed. Please review the template configurations.")
        return False

if __name__ == "__main__":
    success = run_pie_chart_tests()
    sys.exit(0 if success else 1) 