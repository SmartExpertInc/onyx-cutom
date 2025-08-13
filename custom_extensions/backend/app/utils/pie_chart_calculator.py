#!/usr/bin/env python3
"""
Utility for calculating precise label positions for pie chart segments
This ensures consistency between frontend and PDF rendering
"""

import math
from typing import List, Dict, Tuple

def calculate_label_positions(segments: List[Dict], center_x: int = 140, center_y: int = 140, radius: int = 98) -> List[Dict]:
    """
    Calculate precise label positions for pie chart segments.
    
    Args:
        segments: List of segment dictionaries with 'percentage' key
        center_x: X coordinate of pie chart center
        center_y: Y coordinate of pie chart center  
        radius: Distance from center to place labels
    
    Returns:
        List of dictionaries with 'x', 'y', 'angle' for each segment
    """
    total_percentage = sum(segment.get('percentage', 0) for segment in segments)
    if total_percentage == 0:
        return []
    
    cumulative_percentage = 0
    label_positions = []
    
    for segment in segments:
        percentage = segment.get('percentage', 0)
        
        # Calculate center angle of this segment
        start_angle = (cumulative_percentage / total_percentage) * 360
        end_angle = ((cumulative_percentage + percentage) / total_percentage) * 360
        center_angle = (start_angle + end_angle) / 2
        
        # Convert to radians and calculate position (same as frontend)
        angle_rad = (center_angle - 90) * math.pi / 180
        
        # АДАПТИВНЫЙ РАДИУС ДЛЯ ПРАВИЛЬНОГО ПОЗИЦИОНИРОВАНИЯ
        segment_angle = (percentage / total_percentage) * 360
        if segment_angle < 30:  # Для маленьких сегментов
            adaptive_radius = 85  # Ближе к центру для лучшего размещения
        else:
            adaptive_radius = radius  # ТОЧНО как во фронтенде
            
        x = center_x + adaptive_radius * math.cos(angle_rad)
        y = center_y + adaptive_radius * math.sin(angle_rad)
        
        label_positions.append({
            'x': round(x, 2),
            'y': round(y, 2),
            'angle': round(center_angle, 2),
            'percentage': percentage,
            'label': segment.get('label', f"{percentage}%")
        })
        
        cumulative_percentage += percentage
    
    return label_positions

def generate_jinja2_label_code(segments: List[Dict]) -> str:
    """
    Generate Jinja2 template code for label positioning.
    
    Args:
        segments: List of segment dictionaries
    
    Returns:
        Jinja2 template code string
    """
    label_positions = calculate_label_positions(segments)
    
    if not label_positions:
        return ""
    
    code_lines = [
        "<!-- Percentage labels - positioned around the circle -->",
        "{% set cumulative_percentage = 0 %}",
        "{% for segment in slide.props.chartData.segments %}"
    ]
    
    # Add position calculations for each segment
    for i, pos in enumerate(label_positions):
        code_lines.extend([
            f"    {% if loop.index0 == {i} %}",
            f"        {% set label_x = {pos['x']} %}",
            f"        {% set label_y = {pos['y']} %}",
            f"    {% endif %}"
        ])
    
    code_lines.extend([
        "    <div style=\"position: absolute; top: {{ label_y }}px; left: {{ label_x }}px; transform: translate(-50%, -50%); color: #ffffff; font-size: 18px; font-weight: bold; text-shadow: 1px 1px 2px #000000; font-family: Arial, Helvetica, sans-serif;\">{{ segment.label }}</div>",
        "    {% set cumulative_percentage = cumulative_percentage + segment.percentage %}",
        "{% endfor %}"
    ])
    
    return "\n".join(code_lines)

def test_calculations():
    """Test the label position calculations"""
    test_segments = [
        {"label": "25%", "percentage": 25, "color": "#0ea5e9"},
        {"label": "30%", "percentage": 30, "color": "#06b6d4"},
        {"label": "20%", "percentage": 20, "color": "#67e8f9"},
        {"label": "15%", "percentage": 15, "color": "#0891b2"},
        {"label": "10%", "percentage": 10, "color": "#f97316"}
    ]
    
    positions = calculate_label_positions(test_segments)
    
    print("Test Label Positions:")
    for i, pos in enumerate(positions):
        print(f"Segment {i+1}: {pos['label']} at ({pos['x']}, {pos['y']}) - angle: {pos['angle']}°")
    
    print("\nGenerated Jinja2 Code:")
    print(generate_jinja2_label_code(test_segments))

if __name__ == "__main__":
    test_calculations() 