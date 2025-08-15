#!/usr/bin/env python3
"""
Test script to verify PieChartInfographicsTemplate PDF generation with fixed label positioning
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.pdf_generator import generate_single_slide_pdf

async def test_pie_chart_label_positioning():
    """Test PDF generation for PieChartInfographicsTemplate with fixed label positioning"""
    
    print("🧪 Testing PieChartInfographicsTemplate PDF generation with fixed label positioning...")
    
    # Test data with various segment sizes to test different label positions
    test_slide = {
        "templateId": "pie-chart-infographics",
        "props": {
            "title": "Test Pie Chart with Fixed Labels",
            "chartData": {
                "segments": [
                    {"label": "25%", "percentage": 25, "color": "#0ea5e9", "description": "Blue segment"},
                    {"label": "30%", "percentage": 30, "color": "#06b6d4", "description": "Cyan segment"},
                    {"label": "20%", "percentage": 20, "color": "#67e8f9", "description": "Light blue segment"},
                    {"label": "15%", "percentage": 15, "color": "#0891b2", "description": "Dark blue segment"},
                    {"label": "10%", "percentage": 10, "color": "#f97316", "description": "Orange segment"}
                ]
            },
            "monthlyData": [
                {"month": "January", "description": "First month of the year", "color": "#0ea5e9"},
                {"month": "February", "description": "Second month of the year", "color": "#0ea5e9"},
                {"month": "March", "description": "Third month of the year", "color": "#0ea5e9"},
                {"month": "April", "description": "Fourth month of the year", "color": "#f97316"},
                {"month": "May", "description": "Fifth month of the year", "color": "#f97316"},
                {"month": "June", "description": "Sixth month of the year", "color": "#f97316"}
            ],
            "descriptionText": "This is a test pie chart to verify label positioning in PDF export"
        }
    }
    
    # Test with different themes
    themes = ["default", "dark-purple", "light-blue"]
    
    for theme in themes:
        print(f"\n📊 Testing with theme: {theme}")
        
        # Generate output filename
        output_filename = f"pie_chart_test_{theme}_fixed_labels.pdf"
        output_path = f"test_outputs/{output_filename}"
        
        # Ensure output directory exists
        os.makedirs("test_outputs", exist_ok=True)
        
        try:
            # Generate PDF
            success = await generate_single_slide_pdf(
                slide_data=test_slide,
                theme=theme,
                slide_height=800,
                output_path=output_path
            )
            
            if success and os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                print(f"  ✅ PDF generated successfully: {output_path}")
                print(f"  📁 File size: {file_size:,} bytes")
                
                # Check if file is not empty
                if file_size > 1000:
                    print(f"  ✅ PDF file appears to be valid (size > 1KB)")
                else:
                    print(f"  ⚠️  PDF file seems small, may be invalid")
            else:
                print(f"  ❌ Failed to generate PDF")
                
        except Exception as e:
            print(f"  ❌ Error generating PDF: {e}")
    
    print("\n🎯 Test completed!")
    print("📝 Check the generated PDFs in the 'test_outputs' directory")
    print("🔍 Verify that the percentage labels are positioned correctly around the pie chart")
    print("📊 The labels should now match the frontend positioning more closely")

if __name__ == "__main__":
    asyncio.run(test_pie_chart_label_positioning()) 