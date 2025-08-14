# custom_extensions/backend/app/routes/chart_demo.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import HTMLResponse
from typing import Dict, List
import logging
from app.services.chart_generator import chart_generator
from app.services.pdf_generator import generate_pdf_from_html_template
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/charts", tags=["charts"])

@router.get("/demo", response_class=HTMLResponse)
async def chart_demo():
    """
    Demo endpoint showing different chart library options for pie charts.
    """
    try:
        # Sample data for demonstration
        chart_data = {
            "One-pager": 45,
            "Presentation": 38,
            "Quiz": 42,
            "Video Lesson": 31
        }
        
        total_products = sum(chart_data.values())
        chart_colors = ['#9333ea', '#2563eb', '#16a34a', '#ea580c']
        
        # Generate charts using different libraries
        charts = {}
        
        # Matplotlib chart
        try:
            charts['matplotlib'] = chart_generator.generate_pie_chart_matplotlib(
                data=chart_data,
                title="Products Distribution",
                colors=chart_colors
            )
        except Exception as e:
            logger.warning(f"Matplotlib chart generation failed: {e}")
            charts['matplotlib'] = None
        
        # Plotly chart
        try:
            charts['plotly'] = chart_generator.generate_pie_chart_plotly(
                data=chart_data,
                title="Products Distribution",
                colors=chart_colors
            )
        except Exception as e:
            logger.warning(f"Plotly chart generation failed: {e}")
            charts['plotly'] = None
        
        # SVG chart
        try:
            charts['svg'] = chart_generator.generate_svg_pie_chart(
                data=chart_data,
                title="Products Distribution",
                colors=chart_colors
            )
        except Exception as e:
            logger.warning(f"SVG chart generation failed: {e}")
            charts['svg'] = None
        
        # Chart.js configuration
        try:
            charts['chartjs'] = chart_generator.generate_chart_js_config(
                data=chart_data,
                title="Products Distribution",
                colors=chart_colors
            )
        except Exception as e:
            logger.warning(f"Chart.js config generation failed: {e}")
            charts['chartjs'] = None
        
        # Prepare template data
        template_data = {
            'chart_data': chart_data,
            'total_products': total_products,
            'chart_colors': chart_colors,
            'matplotlib_chart': charts.get('matplotlib'),
            'plotly_chart': charts.get('plotly'),
            'svg_chart': charts.get('svg'),
            'chartjs_config': charts.get('chartjs'),
            'client_name': 'Chart Library Demo',
            'generated_at': datetime.now().isoformat()
        }
        
        # Generate PDF with charts
        unique_output_filename = f"chart_demo_{uuid.uuid4().hex[:12]}.pdf"
        pdf_path = await generate_pdf_from_html_template(
            "projects_list_pdf_template_with_charts.html", 
            template_data, 
            unique_output_filename
        )
        
        # Return HTML response for web viewing
        from jinja2 import Environment, FileSystemLoader
        import os
        
        template_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
        env = Environment(loader=FileSystemLoader(template_dir))
        template = env.get_template("projects_list_pdf_template_with_charts.html")
        
        html_content = template.render(**template_data)
        
        return HTMLResponse(content=html_content, status_code=200)
        
    except Exception as e:
        logger.error(f"Chart demo generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Chart demo generation failed: {str(e)}")

@router.get("/compare")
async def compare_chart_libraries():
    """
    Compare different chart libraries and their capabilities.
    """
    return {
        "chart_libraries": {
            "matplotlib": {
                "type": "Server-side",
                "format": "PNG/PDF",
                "pros": [
                    "High quality output",
                    "Excellent for PDF generation",
                    "Highly customizable",
                    "No client-side dependencies"
                ],
                "cons": [
                    "Requires server processing",
                    "Static images only",
                    "Larger file sizes"
                ],
                "best_for": "PDF reports, print materials, server-side generation"
            },
            "plotly": {
                "type": "Server-side",
                "format": "PNG/SVG/HTML",
                "pros": [
                    "Interactive charts (when used client-side)",
                    "Modern design",
                    "Good for web applications",
                    "Can generate static images"
                ],
                "cons": [
                    "Requires server processing for static images",
                    "Larger library size",
                    "More complex setup"
                ],
                "best_for": "Web dashboards, interactive reports, modern UI"
            },
            "svg": {
                "type": "Vector",
                "format": "SVG",
                "pros": [
                    "Perfect scaling at any resolution",
                    "Small file sizes",
                    "No external dependencies",
                    "Excellent for PDF generation"
                ],
                "cons": [
                    "Limited interactivity",
                    "Manual path calculations",
                    "Less sophisticated styling"
                ],
                "best_for": "PDF generation, print materials, simple charts"
            },
            "chartjs": {
                "type": "Client-side",
                "format": "Canvas",
                "pros": [
                    "Interactive charts",
                    "Responsive design",
                    "Rich animations",
                    "Large community"
                ],
                "cons": [
                    "Requires JavaScript",
                    "May not work in PDF generation",
                    "Client-side processing"
                ],
                "best_for": "Web applications, interactive dashboards, real-time data"
            }
        },
        "recommendations": {
            "pdf_generation": ["matplotlib", "svg"],
            "web_applications": ["chartjs", "plotly"],
            "print_materials": ["matplotlib", "svg"],
            "interactive_dashboards": ["chartjs", "plotly"]
        }
    }

@router.post("/generate")
async def generate_custom_chart(
    data: Dict[str, int],
    chart_type: str = "matplotlib",
    title: str = "Custom Chart",
    colors: List[str] = None
):
    """
    Generate a custom pie chart using the specified library.
    
    Args:
        data: Dictionary with labels as keys and values as sizes
        chart_type: One of "matplotlib", "plotly", "svg", "chartjs"
        title: Chart title
        colors: List of colors for the pie slices
    """
    try:
        if chart_type == "matplotlib":
            result = chart_generator.generate_pie_chart_matplotlib(data, title, colors)
            return {"type": "image", "format": "base64_png", "data": result}
        
        elif chart_type == "plotly":
            result = chart_generator.generate_pie_chart_plotly(data, title, colors)
            return {"type": "image", "format": "base64_png", "data": result}
        
        elif chart_type == "svg":
            result = chart_generator.generate_svg_pie_chart(data, title, colors)
            return {"type": "svg", "format": "svg", "data": result}
        
        elif chart_type == "chartjs":
            result = chart_generator.generate_chart_js_config(data, title, colors)
            return {"type": "config", "format": "json", "data": result}
        
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported chart type: {chart_type}")
            
    except Exception as e:
        logger.error(f"Chart generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Chart generation failed: {str(e)}")
