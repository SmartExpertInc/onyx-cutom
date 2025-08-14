# custom_extensions/backend/app/services/chart_generator.py
import os
import base64
import tempfile
import logging
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import json

logger = logging.getLogger(__name__)

# Try to import chart libraries
try:
    import matplotlib.pyplot as plt
    import matplotlib.patches as patches
    from matplotlib.figure import Figure
    from matplotlib.backends.backend_agg import FigureCanvasAgg
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False
    logger.warning("Matplotlib not available. Install with: pip install matplotlib")

try:
    import plotly.graph_objects as go
    import plotly.io as pio
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False
    logger.warning("Plotly not available. Install with: pip install plotly")

try:
    import seaborn as sns
    SEABORN_AVAILABLE = True
except ImportError:
    SEABORN_AVAILABLE = False
    logger.warning("Seaborn not available. Install with: pip install seaborn")

class ChartGenerator:
    """Service for generating various types of charts using different libraries."""
    
    def __init__(self):
        self.temp_dir = Path("/tmp/chart_cache")
        self.temp_dir.mkdir(exist_ok=True)
        
        # Set up matplotlib style for better-looking charts
        if MATPLOTLIB_AVAILABLE:
            plt.style.use('default')
            plt.rcParams['font.family'] = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            plt.rcParams['font.size'] = 10
            plt.rcParams['axes.facecolor'] = 'white'
            plt.rcParams['figure.facecolor'] = 'white'
    
    def generate_pie_chart_matplotlib(
        self, 
        data: Dict[str, int], 
        title: str = "Distribution",
        colors: Optional[List[str]] = None,
        width: int = 8,
        height: int = 6
    ) -> str:
        """
        Generate a pie chart using Matplotlib and return as base64 encoded image.
        
        Args:
            data: Dictionary with labels as keys and values as sizes
            title: Chart title
            colors: List of colors for the pie slices
            width: Chart width in inches
            height: Chart height in inches
            
        Returns:
            Base64 encoded PNG image
        """
        if not MATPLOTLIB_AVAILABLE:
            raise ImportError("Matplotlib is not available")
        
        # Default colors if not provided
        if colors is None:
            colors = ['#9333ea', '#2563eb', '#16a34a', '#ea580c', '#dc2626', '#7c3aed']
        
        # Create figure and axis
        fig, ax = plt.subplots(figsize=(width, height))
        
        # Extract labels and sizes
        labels = list(data.keys())
        sizes = list(data.values())
        
        # Create pie chart
        wedges, texts, autotexts = ax.pie(
            sizes,
            labels=labels,
            colors=colors[:len(labels)],
            autopct='%1.1f%%',
            startangle=90,
            textprops={'fontsize': 10, 'fontweight': 'normal'},
            wedgeprops={'edgecolor': 'white', 'linewidth': 2}
        )
        
        # Customize autopct text
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
            autotext.set_fontsize(9)
        
        # Add title
        ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
        
        # Equal aspect ratio ensures that pie is drawn as a circle
        ax.axis('equal')
        
        # Convert to base64
        canvas = FigureCanvasAgg(fig)
        canvas.draw()
        
        # Save to temporary file
        temp_file = self.temp_dir / f"pie_chart_{hash(str(data))}.png"
        fig.savefig(temp_file, dpi=300, bbox_inches='tight', facecolor='white')
        plt.close(fig)
        
        # Read and encode
        with open(temp_file, 'rb') as f:
            img_data = f.read()
        
        # Clean up temp file
        temp_file.unlink(missing_ok=True)
        
        return base64.b64encode(img_data).decode('utf-8')
    
    def generate_pie_chart_plotly(
        self, 
        data: Dict[str, int], 
        title: str = "Distribution",
        colors: Optional[List[str]] = None,
        width: int = 400,
        height: int = 400
    ) -> str:
        """
        Generate a pie chart using Plotly and return as base64 encoded image.
        
        Args:
            data: Dictionary with labels as keys and values as sizes
            title: Chart title
            colors: List of colors for the pie slices
            width: Chart width in pixels
            height: Chart height in pixels
            
        Returns:
            Base64 encoded PNG image
        """
        if not PLOTLY_AVAILABLE:
            raise ImportError("Plotly is not available")
        
        # Default colors if not provided
        if colors is None:
            colors = ['#9333ea', '#2563eb', '#16a34a', '#ea580c', '#dc2626', '#7c3aed']
        
        # Create pie chart
        fig = go.Figure(data=[go.Pie(
            labels=list(data.keys()),
            values=list(data.values()),
            hole=0.3,  # Donut chart
            marker_colors=colors[:len(data)],
            textinfo='label+percent',
            textfont_size=12,
            textposition='outside'
        )])
        
        # Update layout
        fig.update_layout(
            title={
                'text': title,
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 16, 'color': '#1e293b'}
            },
            width=width,
            height=height,
            showlegend=False,
            margin=dict(l=20, r=20, t=40, b=20),
            paper_bgcolor='white',
            plot_bgcolor='white'
        )
        
        # Convert to base64
        temp_file = self.temp_dir / f"plotly_pie_{hash(str(data))}.png"
        pio.write_image(fig, temp_file, format='png', width=width, height=height)
        
        # Read and encode
        with open(temp_file, 'rb') as f:
            img_data = f.read()
        
        # Clean up temp file
        temp_file.unlink(missing_ok=True)
        
        return base64.b64encode(img_data).decode('utf-8')
    
    def generate_svg_pie_chart(
        self, 
        data: Dict[str, int], 
        title: str = "Distribution",
        colors: Optional[List[str]] = None,
        width: int = 300,
        height: int = 300
    ) -> str:
        """
        Generate a pie chart as SVG string.
        
        Args:
            data: Dictionary with labels as keys and values as sizes
            title: Chart title
            colors: List of colors for the pie slices
            width: SVG width
            height: SVG height
            
        Returns:
            SVG string
        """
        # Default colors if not provided
        if colors is None:
            colors = ['#9333ea', '#2563eb', '#16a34a', '#ea580c', '#dc2626', '#7c3aed']
        
        # Calculate total and percentages
        total = sum(data.values())
        if total == 0:
            return self._generate_empty_svg(width, height, title)
        
        # Calculate angles for each slice
        angles = []
        current_angle = 0
        for value in data.values():
            angle = (value / total) * 360
            angles.append((current_angle, current_angle + angle))
            current_angle += angle
        
        # Generate SVG
        svg_parts = [
            f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">',
            f'<title>{title}</title>'
        ]
        
        # Add slices
        center_x, center_y = width // 2, height // 2
        radius = min(width, height) // 3
        
        for i, ((label, value), (start_angle, end_angle), color) in enumerate(zip(data.items(), angles, colors)):
            if value == 0:
                continue
                
            # Convert angles to radians
            start_rad = (start_angle - 90) * 3.14159 / 180
            end_rad = (end_angle - 90) * 3.14159 / 180
            
            # Calculate arc coordinates
            x1 = center_x + radius * (1 if abs(start_angle - end_angle) >= 180 else 0)
            y1 = center_y
            x2 = center_x + radius * (1 if abs(start_angle - end_angle) >= 180 else 0)
            y2 = center_y
            
            # Create path for pie slice
            large_arc_flag = 1 if (end_angle - start_angle) > 180 else 0
            
            start_x = center_x + radius * (1 if abs(start_angle - end_angle) >= 180 else 0)
            start_y = center_y
            end_x = center_x + radius * (1 if abs(start_angle - end_angle) >= 180 else 0)
            end_y = center_y
            
            path_data = f"M {center_x} {center_y} L {start_x} {start_y} A {radius} {radius} 0 {large_arc_flag} 1 {end_x} {end_y} Z"
            
            svg_parts.append(f'<path d="{path_data}" fill="{color}" stroke="white" stroke-width="2"/>')
        
        # Add center circle for donut effect
        svg_parts.append(f'<circle cx="{center_x}" cy="{center_y}" r="{radius//2}" fill="white" stroke="#e2e8f0" stroke-width="1"/>')
        
        # Add total in center
        svg_parts.append(f'<text x="{center_x}" y="{center_y}" text-anchor="middle" dy=".3em" style="font-size: 14px; font-weight: 600; fill: #1e293b;">{total}</text>')
        svg_parts.append(f'<text x="{center_x}" y="{center_y + 20}" text-anchor="middle" style="font-size: 10px; fill: #64748b;">Total</text>')
        
        svg_parts.append('</svg>')
        
        return '\n'.join(svg_parts)
    
    def _generate_empty_svg(self, width: int, height: int, title: str) -> str:
        """Generate an empty SVG when no data is available."""
        return f'''<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">
            <title>{title}</title>
            <rect width="{width}" height="{height}" fill="#f8fafc"/>
            <text x="{width//2}" y="{height//2}" text-anchor="middle" style="font-size: 14px; fill: #64748b;">No data available</text>
        </svg>'''
    
    def generate_chart_js_config(
        self, 
        data: Dict[str, int], 
        title: str = "Distribution",
        colors: Optional[List[str]] = None
    ) -> Dict:
        """
        Generate Chart.js configuration for client-side rendering.
        
        Args:
            data: Dictionary with labels as keys and values as sizes
            title: Chart title
            colors: List of colors for the pie slices
            
        Returns:
            Chart.js configuration object
        """
        # Default colors if not provided
        if colors is None:
            colors = ['#9333ea', '#2563eb', '#16a34a', '#ea580c', '#dc2626', '#7c3aed']
        
        return {
            "type": "doughnut",
            "data": {
                "labels": list(data.keys()),
                "datasets": [{
                    "data": list(data.values()),
                    "backgroundColor": colors[:len(data)],
                    "borderColor": "white",
                    "borderWidth": 2,
                    "hoverBorderWidth": 3
                }]
            },
            "options": {
                "responsive": True,
                "maintainAspectRatio": False,
                "plugins": {
                    "title": {
                        "display": True,
                        "text": title,
                        "font": {
                            "size": 16,
                            "weight": "bold"
                        },
                        "color": "#1e293b"
                    },
                    "legend": {
                        "display": True,
                        "position": "right",
                        "labels": {
                            "font": {
                                "size": 12
                            },
                            "color": "#475569"
                        }
                    },
                    "tooltip": {
                        "callbacks": {
                            "label": "function(context) { return context.label + ': ' + context.parsed + ' (' + context.parsed + '%)'; }"
                        }
                    }
                }
            }
        }

# Global instance
chart_generator = ChartGenerator()
