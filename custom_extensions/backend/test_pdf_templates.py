#!/usr/bin/env python3
"""
Test PDF generation for PieChartInfographicsTemplate and MarketShareTemplate
"""

import asyncio
import json
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.services.pdf_generator import generate_single_slide_pdf

async def test_pie_chart_pdf():
    """Test PDF generation for PieChartInfographicsTemplate"""
    print("Testing PieChartInfographicsTemplate PDF generation...")
    
    slide_data = {
        "templateId": "pie-chart-infographics",
        "props": {
            "title": "Market Distribution Analysis",
            "chartData": {
                "segments": [
                    {"label": "15%", "percentage": 15, "color": "#0ea5e9", "description": "Blue segment"},
                    {"label": "20%", "percentage": 20, "color": "#06b6d4", "description": "Cyan segment"},
                    {"label": "25%", "percentage": 25, "color": "#67e8f9", "description": "Light blue segment"},
                    {"label": "20%", "percentage": 20, "color": "#0891b2", "description": "Dark blue segment"},
                    {"label": "12%", "percentage": 12, "color": "#f97316", "description": "Orange segment"},
                    {"label": "8%", "percentage": 8, "color": "#fb923c", "description": "Light orange segment"}
                ]
            },
            "monthlyData": [
                {"month": "Q1 2024", "description": "Strong growth in digital services", "color": "#0ea5e9"},
                {"month": "Q2 2024", "description": "Market expansion in Asia-Pacific", "color": "#0ea5e9"},
                {"month": "Q3 2024", "description": "Product innovation and R&D", "color": "#0ea5e9"},
                {"month": "Q4 2024", "description": "Strategic partnerships formed", "color": "#f97316"},
                {"month": "Q1 2025", "description": "Global market penetration", "color": "#f97316"},
                {"month": "Q2 2025", "description": "Revenue optimization achieved", "color": "#f97316"}
            ],
            "descriptionText": "Updated market analysis showing quarterly performance trends"
        }
    }
    
    output_path = "test_pie_chart_output.pdf"
    
    try:
        success = await generate_single_slide_pdf(
            slide_data=slide_data,
            theme="dark-purple",
            slide_height=800,
            output_path=output_path,
            slide_index=1,
            template_id="pie-chart-infographics"
        )
        
        if success:
            print(f"✅ PieChartInfographicsTemplate PDF generated successfully: {output_path}")
        else:
            print("❌ PieChartInfographicsTemplate PDF generation failed")
            
    except Exception as e:
        print(f"❌ Error generating PieChartInfographicsTemplate PDF: {e}")

async def test_market_share_pdf():
    """Test PDF generation for MarketShareTemplate"""
    print("\nTesting MarketShareTemplate PDF generation...")
    
    slide_data = {
        "templateId": "market-share",
        "props": {
            "title": "Market share",
            "chartData": [
                {
                    "label": "Mercury",
                    "description": "Mercury is the closest planet to the Sun",
                    "percentage": 85,
                    "color": "#0ea5e9",
                    "year": "2023"
                },
                {
                    "label": "Mars",
                    "description": "Despite being red, Mars is a cold place",
                    "percentage": 40,
                    "color": "#6b7280",
                    "year": "2024"
                }
            ],
            "bottomText": "Follow the link in the graph to modify its data and then paste the new one here. For more info, click here"
        }
    }
    
    output_path = "test_market_share_output.pdf"
    
    try:
        success = await generate_single_slide_pdf(
            slide_data=slide_data,
            theme="light-modern",
            slide_height=800,
            output_path=output_path,
            slide_index=1,
            template_id="market-share"
        )
        
        if success:
            print(f"✅ MarketShareTemplate PDF generated successfully: {output_path}")
        else:
            print("❌ MarketShareTemplate PDF generation failed")
            
    except Exception as e:
        print(f"❌ Error generating MarketShareTemplate PDF: {e}")

async def main():
    """Run all PDF generation tests"""
    print("🚀 Starting PDF generation tests for new templates...\n")
    
    await test_pie_chart_pdf()
    await test_market_share_pdf()
    
    print("\n✨ PDF generation tests completed!")

if __name__ == "__main__":
    asyncio.run(main()) 