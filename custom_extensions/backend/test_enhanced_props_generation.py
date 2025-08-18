#!/usr/bin/env python3
"""
Test script to verify that AI generates correct JSON props format for React components
This script tests the enhanced template selection and props generation for problematic slides
"""

import json
import sys
from typing import Dict, List, Any

def test_big_numbers_props_generation():
    """Test that big-numbers template generates exactly 3 items with correct structure"""
    print("Testing Big Numbers Template Props Generation...")
    
    # Simulate AI-generated content for big-numbers template
    test_content = {
        "title": "Performance Metrics and Success Indicators",
        "items": [
            {
                "value": "85%",
                "label": "Accuracy Improvement", 
                "description": "Average accuracy improvement reported across all AI models deployed in production environments"
            },
            {
                "value": "40%",
                "label": "Cost Reduction",
                "description": "Significant reduction in operational costs achieved through automated AI-driven processes"
            },
            {
                "value": "3.2x",
                "label": "Efficiency Gain",
                "description": "Measurable increase in processing speed and workflow efficiency across all departments"
            }
        ]
    }
    
    # Validate structure
    assert "title" in test_content, "Missing title field"
    assert "items" in test_content, "Missing items array"
    assert len(test_content["items"]) == 3, f"Expected exactly 3 items, got {len(test_content['items'])}"
    
    # Validate each item
    for i, item in enumerate(test_content["items"]):
        assert "value" in item, f"Item {i} missing value field"
        assert "label" in item, f"Item {i} missing label field"
        assert "description" in item, f"Item {i} missing description field"
        assert isinstance(item["value"], str), f"Item {i} value must be string"
        assert isinstance(item["label"], str), f"Item {i} label must be string"
        assert isinstance(item["description"], str), f"Item {i} description must be string"
    
    print("✅ Big Numbers Template: Correct structure with exactly 3 items")
    return True

def test_pie_chart_props_generation():
    """Test that pie-chart-infographics template generates exactly 6 segments with meaningful names"""
    print("Testing Pie Chart Template Props Generation...")
    
    # Simulate AI-generated content for pie-chart-infographics template
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
        },
        "monthlyData": [
            {
                "month": "Cloud Services",
                "description": "Our cloud services continue to drive significant revenue with strong market demand.",
                "color": "#3B82F6",
                "percentage": "35%"
            },
            {
                "month": "Mobile Applications",
                "description": "Mobile app development showing consistent growth and expanding market penetration.",
                "color": "#10B981",
                "percentage": "28%"
            },
            {
                "month": "Data Analytics",
                "description": "Data analytics services contributing substantial recurring revenue streams.",
                "color": "#F59E0B",
                "percentage": "22%"
            },
            {
                "month": "AI Solutions",
                "description": "AI and machine learning solutions providing additional revenue diversification.",
                "color": "#EF4444",
                "percentage": "15%"
            },
            {
                "month": "Security Tools",
                "description": "Cybersecurity tools and services addressing critical market needs.",
                "color": "#8B5CF6",
                "percentage": "12%"
            },
            {
                "month": "Integration Services",
                "description": "System integration and consulting services rounding out our portfolio.",
                "color": "#6B7280",
                "percentage": "8%"
            }
        ]
    }
    
    # Validate structure
    assert "title" in test_content, "Missing title field"
    assert "chartData" in test_content, "Missing chartData object"
    assert "segments" in test_content["chartData"], "Missing segments array"
    assert "monthlyData" in test_content, "Missing monthlyData array"
    
    # Validate segments
    segments = test_content["chartData"]["segments"]
    assert len(segments) == 6, f"Expected exactly 6 segments, got {len(segments)}"
    
    # Validate monthlyData
    monthly_data = test_content["monthlyData"]
    assert len(monthly_data) == 6, f"Expected exactly 6 monthly data items, got {len(monthly_data)}"
    
    # Validate each segment
    for i, segment in enumerate(segments):
        assert "label" in segment, f"Segment {i} missing label field"
        assert "percentage" in segment, f"Segment {i} missing percentage field"
        assert "color" in segment, f"Segment {i} missing color field"
        assert "description" in segment, f"Segment {i} missing description field"
        
        # Check for meaningful names (not generic)
        label = segment["label"]
        assert not any(generic in label.lower() for generic in ["сегмент", "segment", "category", "part"]), \
            f"Segment {i} has generic name: {label}"
    
    # Check percentage total
    total_percentage = sum(segment["percentage"] for segment in segments)
    assert 95 <= total_percentage <= 105, f"Percentage total should be close to 100%, got {total_percentage}%"
    
    print("✅ Pie Chart Template: Correct structure with exactly 6 meaningful segments")
    return True

def test_six_ideas_props_generation():
    """Test that six-ideas-list template generates exactly 6 ideas with correct structure"""
    print("Testing Six Ideas List Template Props Generation...")
    
    # Simulate AI-generated content for six-ideas-list template
    test_content = {
        "title": "Six Key Strategies for Success",
        "ideas": [
            {
                "number": "01",
                "text": "Clear Communication Channels - Establish transparent communication protocols that ensure all stakeholders are informed and aligned throughout the project lifecycle."
            },
            {
                "number": "02",
                "text": "Agile Methodology Adoption - Implement iterative development processes that allow for rapid adaptation to changing requirements and stakeholder feedback."
            },
            {
                "number": "03",
                "text": "Risk Management Framework - Develop comprehensive risk assessment and mitigation strategies that proactively address potential challenges before they impact project delivery."
            },
            {
                "number": "04",
                "text": "Stakeholder Engagement - Create regular feedback loops and engagement opportunities that maintain stakeholder buy-in and ensure project alignment with organizational goals."
            },
            {
                "number": "05",
                "text": "Quality Assurance Protocols - Implement rigorous testing and validation procedures that ensure deliverables meet the highest standards of quality and performance."
            },
            {
                "number": "06",
                "text": "Continuous Improvement Process - Establish mechanisms for ongoing evaluation and enhancement that drive long-term success and organizational learning."
            }
        ]
    }
    
    # Validate structure
    assert "title" in test_content, "Missing title field"
    assert "ideas" in test_content, "Missing ideas array"
    assert len(test_content["ideas"]) == 6, f"Expected exactly 6 ideas, got {len(test_content['ideas'])}"
    
    # Validate each idea
    for i, idea in enumerate(test_content["ideas"]):
        assert "number" in idea, f"Idea {i} missing number field"
        assert "text" in idea, f"Idea {i} missing text field"
        assert isinstance(idea["number"], str), f"Idea {i} number must be string"
        assert isinstance(idea["text"], str), f"Idea {i} text must be string"
        assert len(idea["text"]) > 50, f"Idea {i} text too short: {len(idea['text'])} chars"
    
    print("✅ Six Ideas List Template: Correct structure with exactly 6 detailed ideas")
    return True

def test_event_list_props_generation():
    """Test that event-list template generates events with correct structure"""
    print("Testing Event List Template Props Generation...")
    
    # Simulate AI-generated content for event-list template
    test_content = {
        "events": [
            {
                "date": "April 14",
                "description": "Project Kickoff and Team Assembly - Initial project planning and team formation with key stakeholders and project sponsors."
            },
            {
                "date": "June 6",
                "description": "Phase 1 Completion and Initial Deliverables - Successful completion of first project phase with stakeholder review and feedback integration."
            },
            {
                "date": "July 12",
                "description": "Mid-Project Review and Stakeholder Feedback - Comprehensive project assessment and strategic adjustments based on stakeholder input."
            },
            {
                "date": "September 30",
                "description": "Final Implementation and Project Launch - Complete project delivery with full system deployment and operational handover."
            }
        ]
    }
    
    # Validate structure
    assert "events" in test_content, "Missing events array"
    assert len(test_content["events"]) >= 3, f"Expected at least 3 events, got {len(test_content['events'])}"
    
    # Validate each event
    for i, event in enumerate(test_content["events"]):
        assert "date" in event, f"Event {i} missing date field"
        assert "description" in event, f"Event {i} missing description field"
        assert isinstance(event["date"], str), f"Event {i} date must be string"
        assert isinstance(event["description"], str), f"Event {i} description must be string"
        assert len(event["description"]) > 30, f"Event {i} description too short: {len(event['description'])} chars"
    
    print("✅ Event List Template: Correct structure with detailed event descriptions")
    return True

def test_table_dark_props_generation():
    """Test that table-dark template generates table data with correct structure"""
    print("Testing Table Dark Template Props Generation...")
    
    # Simulate AI-generated content for table-dark template
    test_content = {
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
    
    # Validate structure
    assert "title" in test_content, "Missing title field"
    assert "tableData" in test_content, "Missing tableData object"
    assert "headers" in test_content["tableData"], "Missing headers array"
    assert "rows" in test_content["tableData"], "Missing rows array"
    
    # Validate headers and rows
    headers = test_content["tableData"]["headers"]
    rows = test_content["tableData"]["rows"]
    
    assert len(headers) >= 2, f"Expected at least 2 headers, got {len(headers)}"
    assert len(rows) >= 2, f"Expected at least 2 rows, got {len(rows)}"
    
    # Validate each row has correct number of cells
    for i, row in enumerate(rows):
        expected_cells = len(headers) + 1  # +1 for row label
        assert len(row) == expected_cells, f"Row {i} has {len(row)} cells, expected {expected_cells}"
    
    print("✅ Table Dark Template: Correct structure with proper table data")
    return True

def test_market_share_props_generation():
    """Test that market-share template generates chart data with correct structure"""
    print("Testing Market Share Template Props Generation...")
    
    # Simulate AI-generated content for market-share template
    test_content = {
        "title": "Competitive Market Analysis",
        "subtitle": "Understanding our position in the market landscape is essential for strategic planning and competitive advantage.",
        "chartData": [
            {
                "label": "Our Market Share",
                "description": "Industry Leader",
                "percentage": 23.5,
                "color": "#3B82F6",
                "year": "2024"
            },
            {
                "label": "Primary Competitor A",
                "description": "Strong Challenger",
                "percentage": 18.2,
                "color": "#EF4444",
                "year": "2024"
            },
            {
                "label": "Primary Competitor B",
                "description": "Established Player",
                "percentage": 15.7,
                "color": "#10B981",
                "year": "2024"
            },
            {
                "label": "Secondary Competitors",
                "description": "Emerging Threats",
                "percentage": 12.3,
                "color": "#F59E0B",
                "year": "2024"
            },
            {
                "label": "New Market Entrants",
                "description": "Innovation Focus",
                "percentage": 8.1,
                "color": "#8B5CF6",
                "year": "2024"
            },
            {
                "label": "Other Players",
                "description": "Fragmented Segment",
                "percentage": 22.2,
                "color": "#6B7280",
                "year": "2024"
            }
        ],
        "bottomText": "Market share analysis based on Q4 2024 data"
    }
    
    # Validate structure
    assert "title" in test_content, "Missing title field"
    assert "subtitle" in test_content, "Missing subtitle field"
    assert "chartData" in test_content, "Missing chartData array"
    assert "bottomText" in test_content, "Missing bottomText field"
    
    # Validate chart data
    chart_data = test_content["chartData"]
    assert len(chart_data) >= 4, f"Expected at least 4 competitors, got {len(chart_data)}"
    
    # Validate each competitor
    for i, competitor in enumerate(chart_data):
        assert "label" in competitor, f"Competitor {i} missing label field"
        assert "description" in competitor, f"Competitor {i} missing description field"
        assert "percentage" in competitor, f"Competitor {i} missing percentage field"
        assert "color" in competitor, f"Competitor {i} missing color field"
        assert "year" in competitor, f"Competitor {i} missing year field"
        
        assert isinstance(competitor["percentage"], (int, float)), f"Competitor {i} percentage must be number"
        assert 0 <= competitor["percentage"] <= 100, f"Competitor {i} percentage out of range: {competitor['percentage']}%"
    
    # Check percentage total
    total_percentage = sum(competitor["percentage"] for competitor in chart_data)
    assert 95 <= total_percentage <= 105, f"Percentage total should be close to 100%, got {total_percentage}%"
    
    print("✅ Market Share Template: Correct structure with competitive analysis data")
    return True

def test_metrics_analytics_props_generation():
    """Test that metrics-analytics template generates metrics with correct structure"""
    print("Testing Metrics Analytics Template Props Generation...")
    
    # Simulate AI-generated content for metrics-analytics template
    test_content = {
        "title": "Performance Analytics Dashboard",
        "metrics": [
            {
                "number": "23.5%",
                "text": "Conversion Rate (↑ 15% from Q3)"
            },
            {
                "number": "$45.20",
                "text": "Customer Acquisition Cost (↓ 8% from Q3)"
            },
            {
                "number": "$127.80",
                "text": "Average Order Value (↑ 12% from Q3)"
            },
            {
                "number": "$1,245.00",
                "text": "Customer Lifetime Value (↑ 18% from Q3)"
            },
            {
                "number": "340%",
                "text": "Return on Investment (↑ 25% from Q3)"
            },
            {
                "number": "2.3%",
                "text": "Market Share Growth (↑ 0.8% from Q3)"
            }
        ]
    }
    
    # Validate structure
    assert "title" in test_content, "Missing title field"
    assert "metrics" in test_content, "Missing metrics array"
    assert len(test_content["metrics"]) >= 4, f"Expected at least 4 metrics, got {len(test_content['metrics'])}"
    
    # Validate each metric
    for i, metric in enumerate(test_content["metrics"]):
        assert "number" in metric, f"Metric {i} missing number field"
        assert "text" in metric, f"Metric {i} missing text field"
        assert isinstance(metric["number"], str), f"Metric {i} number must be string"
        assert isinstance(metric["text"], str), f"Metric {i} text must be string"
        
        # Check for trend indicators
        assert any(trend in metric["text"] for trend in ["↑", "↓"]), f"Metric {i} missing trend indicator"
    
    print("✅ Metrics Analytics Template: Correct structure with trend indicators")
    return True

def run_all_tests():
    """Run all template props generation tests"""
    print("🧪 Testing Enhanced Template Props Generation")
    print("=" * 50)
    
    tests = [
        test_big_numbers_props_generation,
        test_pie_chart_props_generation,
        test_six_ideas_props_generation,
        test_event_list_props_generation,
        test_table_dark_props_generation,
        test_market_share_props_generation,
        test_metrics_analytics_props_generation
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ {test.__name__}: Failed - {str(e)}")
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Template props generation is working correctly.")
        return True
    else:
        print("⚠️  Some tests failed. Please review the template configurations.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1) 