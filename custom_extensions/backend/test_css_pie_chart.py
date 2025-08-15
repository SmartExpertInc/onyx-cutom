#!/usr/bin/env python3
"""
Тест CSS Pie Chart - проверяет новую реализацию pie chart с CSS
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.utils.pie_chart_css_generator import generate_css_pie_chart
import math

def test_css_pie_chart():
    """Тестирует CSS pie chart генератор"""
    print("=== ТЕСТ CSS PIE CHART ===")
    
    # Тестовые данные из изображения
    segments = [
        {"label": "8%", "percentage": 8, "color": "#0ea5e9"},
        {"label": "15%", "percentage": 15, "color": "#f97316"},
        {"label": "20%", "percentage": 20, "color": "#fb923c"},
        {"label": "20%", "percentage": 20, "color": "#0ea5e9"},
        {"label": "25%", "percentage": 25, "color": "#06b6d4"},
        {"label": "20%", "percentage": 20, "color": "#67e8f9"},
        {"label": "12%", "percentage": 12, "color": "#0891b2"}
    ]
    
    total_percentage = sum(segment['percentage'] for segment in segments)
    print(f"Общий процент: {total_percentage}%")
    
    # Генерируем CSS pie chart
    result = generate_css_pie_chart(segments, "test-chart")
    
    print("\n=== HTML КОД ===")
    print(result["html"])
    
    print("\n=== CSS КОД ===")
    print(result["css"])
    
    # Проверяем позиции процентов
    print("\n=== ПОЗИЦИИ ПРОЦЕНТОВ ===")
    current_angle = 0
    
    for i, segment in enumerate(segments):
        segment_angle = (segment['percentage'] / total_percentage) * 360
        label_angle = current_angle + (segment_angle / 2)
        
        # Вычисляем позицию метки
        rad = math.radians(label_angle - 90)
        
        # Адаптивный радиус
        if segment_angle < 30:
            label_radius = 85
        else:
            label_radius = 98
            
        x = 140 + label_radius * math.cos(rad)
        y = 140 + label_radius * math.sin(rad)
        
        print(f"{segment['label']}: ({x:.1f}, {y:.1f}) - радиус {label_radius}px")
        
        current_angle += segment_angle
    
    # Создаем тестовый HTML файл
    test_html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>CSS Pie Chart Test</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #f0f0f0;
        }}
        .test-container {{
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }}
        {result["css"]}
    </style>
</head>
<body>
    <div class="test-container">
        <h2>CSS Pie Chart Test</h2>
        {result["html"]}
    </div>
</body>
</html>
    """
    
    # Сохраняем тестовый файл
    with open('test_css_pie_chart.html', 'w', encoding='utf-8') as f:
        f.write(test_html)
    
    print(f"\n✅ Тестовый HTML файл сохранен как 'test_css_pie_chart.html'")
    print("Откройте файл в браузере для визуальной проверки")

if __name__ == "__main__":
    test_css_pie_chart() 