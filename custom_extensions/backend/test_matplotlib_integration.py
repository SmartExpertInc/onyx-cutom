#!/usr/bin/env python3
"""
Test script to verify Matplotlib chart integration in the PDF template.

This script tests the chart generation functionality and simulates
the PDF generation process with Matplotlib charts.
"""

import sys
import os
import asyncio
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.services.chart_generator import chart_generator
from app.services.pdf_generator import generate_pdf_from_html_template
import uuid
from datetime import datetime

async def test_matplotlib_integration():
    """Test the Matplotlib chart integration."""
    
    print("🧪 Testing Matplotlib Chart Integration")
    print("=" * 50)
    
    # Sample data similar to what would come from the database
    sample_projects = [
        {'design_microproduct_type': 'Training Plan', 'title': 'Course 1'},
        {'design_microproduct_type': 'Training Plan', 'title': 'Course 2'},
        {'design_microproduct_type': 'Text Presentation', 'title': 'Presentation 1'},
        {'design_microproduct_type': 'Text Presentation', 'title': 'Presentation 2'},
        {'design_microproduct_type': 'Text Presentation', 'title': 'Presentation 3'},
        {'design_microproduct_type': 'Quiz', 'title': 'Quiz 1'},
        {'design_microproduct_type': 'Quiz', 'title': 'Quiz 2'},
        {'design_microproduct_type': 'Video Lesson', 'title': 'Video 1'},
        {'design_microproduct_type': 'Slide Deck', 'title': 'Slides 1'},
        {'design_microproduct_type': 'Slide Deck', 'title': 'Slides 2'},
    ]
    
    # Simulate the chart data collection process
    project_types = {}
    for project in sample_projects:
        project_type = project.get('design_microproduct_type', 'Other')
        if project_type not in project_types:
            project_types[project_type] = 0
        project_types[project_type] += 1
    
    print(f"📊 Sample Project Data: {project_types}")
    
    # Test chart generation
    try:
        print("\n🔧 Testing Matplotlib Chart Generation...")
        
        chart_colors = ['#9333ea', '#2563eb', '#16a34a', '#ea580c', '#dc2626', '#7c3aed']
        
        # Generate Matplotlib chart
        matplotlib_chart = chart_generator.generate_pie_chart_matplotlib(
            data=project_types,
            title="Products Distribution",
            colors=chart_colors[:len(project_types)]
        )
        
        print(f"   ✅ Matplotlib chart generated successfully ({len(matplotlib_chart)} chars)")
        
        # Prepare template data (similar to what the endpoint would do)
        template_data = {
            'folders': [],  # Empty for this test
            'folder_projects': {},
            'unassigned_projects': [],
            'column_visibility': {
                'title': True,
                'numberOfLessons': True,
                'estCreationTime': True,
                'estCompletionTime': True
            },
            'column_widths': {},
            'folder_id': None,
            'client_name': 'Matplotlib Test',
            'generated_at': datetime.now().isoformat(),
            'summary_stats': {
                'total_projects': len(sample_projects),
                'total_lessons': 25,
                'total_creation_time': 40,
                'total_completion_time': 120
            },
            'chart_data': project_types,
            'chart_colors': chart_colors,
            'matplotlib_chart': matplotlib_chart,
            'total_products': sum(project_types.values())
        }
        
        print(f"   ✅ Template data prepared successfully")
        
        # Test PDF generation with the new template
        print("\n🔧 Testing PDF Generation with Matplotlib Chart...")
        
        unique_output_filename = f"matplotlib_test_{uuid.uuid4().hex[:12]}.pdf"
        pdf_path = await generate_pdf_from_html_template(
            "projects_list_pdf_template.html", 
            template_data, 
            unique_output_filename
        )
        
        if os.path.exists(pdf_path):
            print(f"   ✅ PDF generated successfully: {pdf_path}")
            print(f"   📄 File size: {os.path.getsize(pdf_path)} bytes")
        else:
            print(f"   ❌ PDF file not found: {pdf_path}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 50)
    print("✨ Matplotlib Integration Test Completed!")

if __name__ == "__main__":
    asyncio.run(test_matplotlib_integration())
