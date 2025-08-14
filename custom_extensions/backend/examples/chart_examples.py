#!/usr/bin/env python3
"""
Example script demonstrating different chart library options for pie charts.

This script shows how to use the ChartGenerator service to create pie charts
using different libraries: Matplotlib, Plotly, SVG, and Chart.js.

Usage:
    python chart_examples.py
"""

import sys
import os
import asyncio
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.services.chart_generator import chart_generator

async def main():
    """Main function demonstrating chart generation capabilities."""
    
    print("🎨 Chart Library Examples")
    print("=" * 50)
    
    # Sample data
    chart_data = {
        "One-pager": 45,
        "Presentation": 38,
        "Quiz": 42,
        "Video Lesson": 31
    }
    
    chart_colors = ['#9333ea', '#2563eb', '#16a34a', '#ea580c']
    title = "Products Distribution"
    
    print(f"📊 Sample Data: {chart_data}")
    print(f"🎨 Colors: {chart_colors}")
    print(f"📝 Title: {title}")
    print()
    
    # Test each chart library
    libraries = [
        ("Matplotlib", "matplotlib"),
        ("Plotly", "plotly"), 
        ("SVG", "svg"),
        ("Chart.js", "chartjs")
    ]
    
    for lib_name, lib_type in libraries:
        print(f"🔧 Testing {lib_name}...")
        
        try:
            if lib_type == "matplotlib":
                result = chart_generator.generate_pie_chart_matplotlib(
                    data=chart_data,
                    title=title,
                    colors=chart_colors
                )
                print(f"   ✅ {lib_name}: Generated base64 PNG image ({len(result)} chars)")
                
            elif lib_type == "plotly":
                result = chart_generator.generate_pie_chart_plotly(
                    data=chart_data,
                    title=title,
                    colors=chart_colors
                )
                print(f"   ✅ {lib_name}: Generated base64 PNG image ({len(result)} chars)")
                
            elif lib_type == "svg":
                result = chart_generator.generate_svg_pie_chart(
                    data=chart_data,
                    title=title,
                    colors=chart_colors
                )
                print(f"   ✅ {lib_name}: Generated SVG string ({len(result)} chars)")
                
            elif lib_type == "chartjs":
                result = chart_generator.generate_chart_js_config(
                    data=chart_data,
                    title=title,
                    colors=chart_colors
                )
                print(f"   ✅ {lib_name}: Generated Chart.js config ({len(str(result))} chars)")
                
        except Exception as e:
            print(f"   ❌ {lib_name}: Failed - {str(e)}")
        
        print()
    
    # Compare library capabilities
    print("📋 Library Comparison:")
    print("-" * 30)
    
    comparison = {
        "Matplotlib": {
            "Type": "Server-side",
            "Output": "PNG/PDF",
            "Best for": "PDF generation, print materials",
            "Pros": "High quality, customizable, no client dependencies",
            "Cons": "Server processing, static only, larger files"
        },
        "Plotly": {
            "Type": "Server-side",
            "Output": "PNG/SVG/HTML", 
            "Best for": "Web dashboards, interactive reports",
            "Pros": "Modern design, interactive (client-side), good for web",
            "Cons": "Server processing, larger library, complex setup"
        },
        "SVG": {
            "Type": "Vector",
            "Output": "SVG",
            "Best for": "PDF generation, print materials, simple charts",
            "Pros": "Perfect scaling, small files, no dependencies",
            "Cons": "Limited interactivity, manual calculations, basic styling"
        },
        "Chart.js": {
            "Type": "Client-side",
            "Output": "Canvas",
            "Best for": "Web applications, interactive dashboards",
            "Pros": "Interactive, responsive, animations, large community",
            "Cons": "Requires JavaScript, may not work in PDFs, client processing"
        }
    }
    
    for lib_name, details in comparison.items():
        print(f"\n{lib_name}:")
        for key, value in details.items():
            print(f"  {key}: {value}")
    
    print("\n" + "=" * 50)
    print("🎯 Recommendations:")
    print("• PDF Generation: Use Matplotlib or SVG")
    print("• Web Applications: Use Chart.js or Plotly")
    print("• Print Materials: Use Matplotlib or SVG")
    print("• Interactive Dashboards: Use Chart.js or Plotly")
    
    # Save example outputs
    print("\n💾 Saving example outputs...")
    
    try:
        # Save SVG example
        svg_result = chart_generator.generate_svg_pie_chart(
            data=chart_data,
            title=title,
            colors=chart_colors
        )
        
        output_dir = Path("chart_examples_output")
        output_dir.mkdir(exist_ok=True)
        
        with open(output_dir / "pie_chart_example.svg", "w") as f:
            f.write(svg_result)
        print("   ✅ Saved SVG example: chart_examples_output/pie_chart_example.svg")
        
        # Save Chart.js config
        chartjs_result = chart_generator.generate_chart_js_config(
            data=chart_data,
            title=title,
            colors=chart_colors
        )
        
        import json
        with open(output_dir / "chartjs_config_example.json", "w") as f:
            json.dump(chartjs_result, f, indent=2)
        print("   ✅ Saved Chart.js config: chart_examples_output/chartjs_config_example.json")
        
    except Exception as e:
        print(f"   ❌ Failed to save examples: {e}")
    
    print("\n✨ Chart examples completed!")

if __name__ == "__main__":
    asyncio.run(main())
