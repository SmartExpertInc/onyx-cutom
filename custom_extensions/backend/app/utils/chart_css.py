#!/usr/bin/env python3
"""
CSS генератор для круговой диаграммы - новая версия
"""

def create_css(segments, chart_id="chart"):
    """
    Создает CSS для круговой диаграммы
    
    Args:
        segments: Список сегментов
        chart_id: ID для CSS селекторов
        
    Returns:
        Словарь с HTML и CSS
    """
    if not segments:
        return {"html": "", "css": ""}
    
    # Вычисляем общий процент
    total = sum(seg.get('percentage', 0) for seg in segments)
    if total == 0:
        return {"html": "", "css": ""}
    
    # Генерируем conic-gradient
    gradient_parts = []
    current_angle = 0
    
    for segment in segments:
        percentage = segment.get('percentage', 0)
        if percentage > 0:
            color = segment.get('color', '#3B82F6')
            segment_angle = (percentage / total) * 360
            end_angle = current_angle + segment_angle
            
            gradient_parts.append(f"{color} {current_angle}deg {end_angle}deg")
            current_angle = end_angle
    
    conic_gradient = f"conic-gradient({', '.join(gradient_parts)})"
    
    # Генерируем CSS
    css = f"""
    .{chart_id}-container {{
        position: relative;
        width: 352px;
        height: 352px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
    }}
    
    .{chart_id}-chart {{
        position: relative;
        width: 320px;
        height: 320px;
        border-radius: 50%;
        background: {conic_gradient};
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        border: 4px solid white;
    }}
    
    .{chart_id}-donut-hole {{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 160px;
        height: 160px;
        border-radius: 50%;
        background: white;
        border: 4px solid #e5e7eb;
    }}
    """
    
    # Генерируем HTML
    html = f"""
    <div class="{chart_id}-container">
        <div class="{chart_id}-chart">
            <div class="{chart_id}-donut-hole"></div>
        </div>
    </div>
    """
    
    return {
        "html": html,
        "css": css
    }

def test_css():
    """Тестирует CSS генератор"""
    test_segments = [
        {"percentage": 16.67, "color": "#3B82F6"},
        {"percentage": 16.67, "color": "#10B981"},
        {"percentage": 16.67, "color": "#F59E0B"},
        {"percentage": 16.67, "color": "#EF4444"},
        {"percentage": 16.67, "color": "#8B5CF6"},
        {"percentage": 16.67, "color": "#EC4899"}
    ]
    
    result = create_css(test_segments, "test-chart")
    
    print("=== CSS ГЕНЕРАТОР ===")
    print("\nHTML:")
    print(result["html"])
    print("\nCSS:")
    print(result["css"])
    
    return result

if __name__ == "__main__":
    test_css() 