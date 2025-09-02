#!/usr/bin/env python3
"""
Utility for calculating pie chart segment properties
Simplified version without percentage labels on the chart
"""

import math
from typing import List, Dict, Tuple

def calculate_segment_angles(segments: List[Dict]) -> List[Dict]:
    """
    Calculate segment angles for pie chart.
    
    Args:
        segments: List of segment dictionaries with 'percentage' key
    
    Returns:
        List of dictionaries with 'start_angle', 'end_angle', 'center_angle' for each segment
    """
    total_percentage = sum(segment.get('percentage', 0) for segment in segments)
    if total_percentage == 0:
        return []
    
    cumulative_percentage = 0
    segment_angles = []
    
    for segment in segments:
        percentage = segment.get('percentage', 0)
        
        # Calculate angles for this segment
        start_angle = (cumulative_percentage / total_percentage) * 360
        end_angle = ((cumulative_percentage + percentage) / total_percentage) * 360
        center_angle = (start_angle + end_angle) / 2
        
        segment_angles.append({
            'start_angle': round(start_angle, 2),
            'end_angle': round(end_angle, 2),
            'center_angle': round(center_angle, 2),
            'percentage': percentage,
            'label': segment.get('label', f"Сегмент"),
            'color': segment.get('color', '#3B82F6')
        })
        
        cumulative_percentage += percentage
    
    return segment_angles

def generate_conic_gradient(segments: List[Dict]) -> str:
    """
    Generate conic gradient CSS for pie chart.
    
    Args:
        segments: List of segment dictionaries
    
    Returns:
        CSS conic-gradient string
    """
    total_percentage = sum(segment.get('percentage', 0) for segment in segments)
    if total_percentage == 0:
        return "conic-gradient(transparent 0deg, transparent 360deg)"
    
    gradient_parts = []
    cumulative_percentage = 0
    
    for segment in segments:
        percentage = segment.get('percentage', 0)
        if percentage <= 0:
            continue
            
        color = segment.get('color', '#3B82F6')
        segment_angle = (percentage / total_percentage) * 360
        end_angle = cumulative_percentage + segment_angle
        
        gradient_parts.append(f"{color} {cumulative_percentage}deg {end_angle}deg")
        cumulative_percentage = end_angle
    
    if gradient_parts:
        return f"conic-gradient({', '.join(gradient_parts)})"
    else:
        return "conic-gradient(transparent 0deg, transparent 360deg)"

def validate_segments(segments: List[Dict]) -> Dict:
    """
    Validate and normalize segment data.
    
    Args:
        segments: List of segment dictionaries
    
    Returns:
        Dictionary with validation results and normalized segments
    """
    if not segments:
        return {
            'valid': False,
            'error': 'No segments provided',
            'segments': []
        }
    
    total_percentage = sum(segment.get('percentage', 0) for segment in segments)
    
    if total_percentage == 0:
        return {
            'valid': False,
            'error': 'Total percentage is zero',
            'segments': segments
        }
    
    # Normalize segments to ensure they sum to 100%
    normalized_segments = []
    for segment in segments:
        percentage = segment.get('percentage', 0)
        normalized_percentage = (percentage / total_percentage) * 100 if total_percentage > 0 else 0
        
        normalized_segments.append({
            'label': segment.get('label', 'Сегмент'),
            'percentage': round(normalized_percentage, 2),
            'color': segment.get('color', '#3B82F6'),
            'description': segment.get('description', '')
        })
    
    return {
        'valid': True,
        'total_percentage': 100.0,
        'segments': normalized_segments
    }

def test_calculations():
    """Test the segment calculations"""
    test_segments = [
        {"label": "Сегмент 1", "percentage": 16.67, "color": "#3B82F6"},
        {"label": "Сегмент 2", "percentage": 16.67, "color": "#10B981"},
        {"label": "Сегмент 3", "percentage": 16.67, "color": "#F59E0B"},
        {"label": "Сегмент 4", "percentage": 16.67, "color": "#EF4444"},
        {"label": "Сегмент 5", "percentage": 16.67, "color": "#8B5CF6"},
        {"label": "Сегмент 6", "percentage": 16.67, "color": "#EC4899"}
    ]
    
    # Test angle calculations
    angles = calculate_segment_angles(test_segments)
    print("Segment Angles:")
    for i, angle_data in enumerate(angles):
        print(f"Segment {i+1}: {angle_data['start_angle']}° - {angle_data['end_angle']}° (center: {angle_data['center_angle']}°)")
    
    # Test conic gradient generation
    gradient = generate_conic_gradient(test_segments)
    print(f"\nConic Gradient:\n{gradient}")
    
    # Test validation
    validation = validate_segments(test_segments)
    print(f"\nValidation: {validation['valid']}")
    if validation['valid']:
        print(f"Total percentage: {validation['total_percentage']}%")
        for segment in validation['segments']:
            print(f"  {segment['label']}: {segment['percentage']}%")

if __name__ == "__main__":
    test_calculations() 