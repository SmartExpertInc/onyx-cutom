# Pie Chart PDF Rendering Fix

## Problem Description
The pie chart was displaying incorrectly in PDF exports due to multiple issues:

1. **Git merge conflicts** in the PDF templates causing visual artifacts
2. **Incorrect large arc flag calculation** in SVG path generation
3. **Missing validation** for segments with zero or negative percentages
4. **Inconsistent label content** between frontend and backend

## Files Affected
- `backend/templates/slide_deck_pdf_template.html` (lines 1570-1620)
- `backend/templates/single_slide_pdf_template.html` (lines 2710-2760)

## Issues Fixed

### 1. Git Merge Conflicts
**Problem**: Git merge conflict markers (`<<<<<<< HEAD`, `=======`, `>>>>>>>`) were present in the code, causing visual corruption.

**Solution**: Removed all conflict markers and cleaned up the code.

### 2. Large Arc Flag Calculation
**Problem**: The large arc flag was calculated incorrectly using `segment.percentage > 50`, which doesn't account for the actual angle difference.

**Before**:
```html
{% set large_arc_flag = 1 if segment.percentage > 50 else 0 %}
```

**After**:
```html
{% set angle_diff = end_angle - start_angle %}
{% set large_arc_flag = 1 if angle_diff > 3.14159 else 0 %}
```

### 3. Segment Validation
**Problem**: Segments with zero or negative percentages could cause rendering issues.

**Solution**: Added validation to only render segments with positive percentages:

```html
{% if segment.percentage > 0 %}
    <!-- SVG path generation -->
{% endif %}
```

### 4. Label Content Consistency
**Problem**: Frontend showed `segment.label` but backend showed `segment.percentage`.

**Solution**: Backend now consistently shows `{{ segment.percentage }}%` for all labels.

## Correct Code Implementation

### SVG Path Generation
```html
<!-- Pie chart segments -->
{% set total_percentage = slide.props.chartData.segments | sum(attribute='percentage') %}
{% set cumulative_percentage = 0 %}
{% set center_x = 140 %}
{% set center_y = 140 %}
{% set radius = 120 %}

{% for segment in slide.props.chartData.segments %}
    {% if segment.percentage > 0 %}
        {% set start_angle = (cumulative_percentage / (total_percentage if total_percentage > 0 else 1)) * 2 * 3.14159 %}
        {% set end_angle = ((cumulative_percentage + segment.percentage) / (total_percentage if total_percentage > 0 else 1)) * 2 * 3.14159 %}
        
        {% set x1 = center_x + radius * (start_angle - 3.14159 / 2) | cos %}
        {% set y1 = center_y + radius * (start_angle - 3.14159 / 2) | sin %}
        {% set x2 = center_x + radius * (end_angle - 3.14159 / 2) | cos %}
        {% set y2 = center_y + radius * (end_angle - 3.14159 / 2) | sin %}
        
        {% set angle_diff = end_angle - start_angle %}
        {% set large_arc_flag = 1 if angle_diff > 3.14159 else 0 %}
        
        <path d="M {{ center_x }} {{ center_y }} L {{ x1 }} {{ y1 }} A {{ radius }} {{ radius }} 0 {{ large_arc_flag }} 1 {{ x2 }} {{ y2 }} Z" 
            fill="{{ segment.color }}" 
            filter="url(#shadow)" 
            stroke="#ffffff" 
            stroke-width="2"/>
    {% endif %}
    
    {% set cumulative_percentage = cumulative_percentage + segment.percentage %}
{% endfor %}
```

### Percentage Labels
```html
<!-- Percentage labels -->
{% set cumulative_percentage = 0 %}
{% for segment in slide.props.chartData.segments %}
    {% if segment.percentage > 0 %}
        {% set start_angle = (cumulative_percentage / (total_percentage if total_percentage > 0 else 1)) * 2 * 3.14159 %}
        {% set end_angle = ((cumulative_percentage + segment.percentage) / (total_percentage if total_percentage > 0 else 1)) * 2 * 3.14159 %}
        {% set center_angle = (start_angle + end_angle) / 2 %}
        
        {% set angle_rad = center_angle - 3.14159 / 2 %}
        {% set label_radius = 70 %}
        {% set label_x = 140 + label_radius * angle_rad | cos %}
        {% set label_y = 140 + label_radius * angle_rad | sin %}
        
        <div style="position: absolute; top: {{ label_y }}px; left: {{ label_x }}px; transform: translate(-50%, -50%); color: #ffffff; font-size: 18px; font-weight: bold; text-shadow: 1px 1px 2px #000000; font-family: Arial, Helvetica, sans-serif; padding: 4px 8px; border-radius: 4px; background: rgba(0,0,0,0.3); z-index: 20;">{{ segment.percentage }}%</div>
    {% endif %}
    
    {% set cumulative_percentage = cumulative_percentage + segment.percentage %}
{% endfor %}
```

## Result of Fix
- ✅ Git merge conflicts resolved
- ✅ Correct SVG path generation with proper large arc flags
- ✅ Validation for segments with positive percentages only
- ✅ Consistent percentage label display
- ✅ Proper pie chart segment rendering in PDF

## Technical Details

### Large Arc Flag Logic
The large arc flag in SVG arc commands determines whether to draw the larger or smaller arc between two points. The correct calculation is:
- `0` if the angle difference is ≤ 180° (π radians)
- `1` if the angle difference is > 180° (π radians)

### Angle Calculations
- Start angle: `(cumulative_percentage / total_percentage) * 2π`
- End angle: `((cumulative_percentage + segment.percentage) / total_percentage) * 2π`
- Center angle for labels: `(start_angle + end_angle) / 2`

### Coordinate System
- SVG uses a coordinate system where (0,0) is at the top-left
- The pie chart is centered at (140, 140) with radius 120
- Labels are positioned at radius 70 from the center

## Recommendations
1. **Always validate data** before rendering to prevent issues with invalid percentages
2. **Use proper mathematical calculations** for SVG arc flags rather than percentage-based heuristics
3. **Test edge cases** such as segments with very small percentages or zero values
4. **Maintain consistency** between frontend and backend label content
5. **Regular code reviews** to catch merge conflicts before they reach production 