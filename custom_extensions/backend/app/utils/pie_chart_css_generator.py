#!/usr/bin/env python3

import math
from typing import List, Dict

def generate_css_pie_chart(segments: List[Dict], chart_id: str = "pie-chart") -> Dict:
    """
    Генерирует CSS pie chart с точным позиционированием процентов
    
    Args:
        segments: Список сегментов с ключами 'percentage', 'color', 'label'
        chart_id: Уникальный ID для CSS селекторов
        
    Returns:
        Словарь с HTML и CSS кодом
    """
    if not segments:
        return {"html": "", "css": ""}
    
    # Вычисляем общий процент
    total_percentage = sum(segment.get('percentage', 0) for segment in segments)
    if total_percentage == 0:
        return {"html": "", "css": ""}
    
    # Генерируем один conic-gradient для всех сегментов
    conic_gradient = generate_conic_gradient(segments, total_percentage)
    
    # Генерируем позиции для процентов
    percentage_positions = generate_percentage_positions(segments, total_percentage)
    
    # Собираем полный CSS
    full_css = generate_full_css(chart_id, conic_gradient, percentage_positions)
    
    # Собираем полный HTML
    full_html = generate_full_html(chart_id, percentage_positions)
    
    return {
        "html": full_html,
        "css": full_css
    }

def generate_conic_gradient(segments: List[Dict], total_percentage: float) -> str:
    """Генерирует conic-gradient для всех сегментов с разными цветами"""
    gradient_parts = []
    current_angle = 0
    
    for segment in segments:
        percentage = segment.get('percentage', 0)
        if percentage <= 0:
            continue
            
        color = segment.get('color', '#0ea5e9')
        segment_angle = (percentage / total_percentage) * 360
        end_angle = current_angle + segment_angle
        
        # Добавляем часть градиента для этого сегмента
        gradient_parts.append(f"{color} {current_angle}deg {end_angle}deg")
        
        current_angle = end_angle
    
    # Создаем полный conic-gradient
    if gradient_parts:
        return f"conic-gradient({', '.join(gradient_parts)})"
    else:
        return "conic-gradient(transparent 0deg, transparent 360deg)"

def generate_percentage_positions(segments: List[Dict], total_percentage: float) -> List[Dict]:
    """Вычисляет точные позиции для процентов"""
    positions = []
    current_angle = 0
    
    for segment in segments:
        percentage = segment.get('percentage', 0)
        if percentage <= 0:
            continue
            
        segment_angle = (percentage / total_percentage) * 360
        label_angle = current_angle + (segment_angle / 2)
        
        # Вычисляем позицию метки - ТОЧНО как во фронтенде
        rad = math.radians(label_angle - 90)  # -90 для правильной ориентации
        
        # Адаптивный радиус для правильного позиционирования
        if segment_angle < 30:  # Для маленьких сегментов
            label_radius = 85  # Ближе к центру для лучшего размещения
        else:
            label_radius = 98  # ТОЧНО как во фронтенде
            
        x = 140 + label_radius * math.cos(rad)
        y = 140 + label_radius * math.sin(rad)
        
        positions.append({
            'x': x,
            'y': y,
            'label': segment.get('label', f"{percentage}%"),
            'angle': label_angle
        })
        
        current_angle += segment_angle
    
    return positions

def generate_full_css(chart_id: str, conic_gradient: str, 
                     percentage_positions: List[Dict]) -> str:
    """Генерирует полный CSS код"""
    
    # CSS для контейнера
    container_css = f"""
    .{chart_id}-container {{
        position: relative;
        width: 312px;
        height: 312px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
    }}
    
    .{chart_id}-chart {{
        position: relative;
        width: 280px;
        height: 280px;
        border-radius: 50%;
        background: {conic_gradient};
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }}
    
    .{chart_id}-donut-hole {{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 134px;
        height: 134px;
        border-radius: 50%;
        background: transparent;
        border: 2px solid #e5e7eb;
        z-index: 10;
    }}
    
    .{chart_id}-outer-border {{
        position: absolute;
        top: -3px;
        left: -3px;
        width: 286px;
        height: 286px;
        border-radius: 50%;
        border: 3px solid white;
        z-index: 5;
    }}
    """
    
    # CSS для процентов
    percentage_css = ""
    for i, pos in enumerate(percentage_positions):
        percentage_css += f"""
    .{chart_id}-percentage-{i} {{
        position: absolute;
        left: {pos['x']}px;
        top: {pos['y']}px;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 18px;
        font-weight: bold;
        font-family: Arial, Helvetica, sans-serif;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
        z-index: 20;
        pointer-events: none;
    }}
    """
    
    # Собираем все CSS
    all_css = container_css + percentage_css
    
    return all_css

def generate_full_html(chart_id: str, percentage_positions: List[Dict]) -> str:
    """Генерирует полный HTML код"""
    
    # HTML для контейнера
    container_html = f"""
    <div class="{chart_id}-container">
        <div class="{chart_id}-chart">
            <div class="{chart_id}-outer-border"></div>
            <div class="{chart_id}-donut-hole"></div>
    """
    
    # Добавляем проценты
    for i, pos in enumerate(percentage_positions):
        container_html += f'            <div class="{chart_id}-percentage-{i}">{pos["label"]}</div>\n'
    
    container_html += "        </div>\n    </div>"
    
    return container_html

def test_css_generator():
    """Тестирует CSS генератор"""
    test_segments = [
        {"label": "8%", "percentage": 8, "color": "#0ea5e9"},
        {"label": "15%", "percentage": 15, "color": "#f97316"},
        {"label": "20%", "percentage": 20, "color": "#fb923c"},
        {"label": "20%", "percentage": 20, "color": "#0ea5e9"},
        {"label": "25%", "percentage": 25, "color": "#06b6d4"},
        {"label": "20%", "percentage": 20, "color": "#67e8f9"},
        {"label": "12%", "percentage": 12, "color": "#0891b2"}
    ]
    
    result = generate_css_pie_chart(test_segments, "test-chart")
    
    print("=== CSS PIE CHART GENERATOR TEST ===")
    print("\nHTML:")
    print(result["html"])
    print("\nCSS:")
    print(result["css"])
    
    return result

if __name__ == "__main__":
    test_css_generator() 