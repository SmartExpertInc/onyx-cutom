#!/usr/bin/env python3
"""
Простой тест для проверки текущих позиций процентов в pie chart
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.pie_chart_generator import PieChartGenerator
import math

def test_current_positions():
    """Тестирует текущие позиции с данными из изображения"""
    # Данные из изображения: 7 сегментов, общий процент 120%
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
    
    # Симулируем логику из генератора
    current_angle = 0
    print("\n=== ТЕКУЩИЕ ПОЗИЦИИ ===")
    
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
        
        print(f"Сегмент {i+1} ({segment['label']}):")
        print(f"  Размер сегмента: {segment_angle:.1f}°")
        print(f"  Центральный угол: {label_angle:.1f}°")
        print(f"  Используемый радиус: {label_radius}px")
        print(f"  Позиция: ({x:.1f}, {y:.1f})")
        print()
        
        current_angle += segment_angle

def test_generator():
    """Тестирует генератор напрямую"""
    print("\n=== ТЕСТ ГЕНЕРАТОРА ===")
    
    segments = [
        {"label": "8%", "percentage": 8, "color": "#0ea5e9"},
        {"label": "15%", "percentage": 15, "color": "#f97316"},
        {"label": "20%", "percentage": 20, "color": "#fb923c"},
        {"label": "20%", "percentage": 20, "color": "#0ea5e9"},
        {"label": "25%", "percentage": 25, "color": "#06b6d4"},
        {"label": "20%", "percentage": 20, "color": "#67e8f9"},
        {"label": "12%", "percentage": 12, "color": "#0891b2"}
    ]
    
    generator = PieChartGenerator()
    
    try:
        # Генерируем изображение
        image_data = generator.generate_pie_chart_image(segments)
        
        if image_data.startswith("data:image/png;base64,"):
            print("✅ Генератор работает")
            
            # Сохраняем тестовое изображение
            import base64
            image_bytes = base64.b64decode(image_data.split(',')[1])
            with open('current_test.png', 'wb') as f:
                f.write(image_bytes)
            print("✅ Изображение сохранено как 'current_test.png'")
        else:
            print("❌ Ошибка генерации")
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")

if __name__ == "__main__":
    print("ПРОВЕРКА ТЕКУЩИХ ПОЗИЦИЙ PIE CHART")
    print("=" * 50)
    
    test_current_positions()
    test_generator()
    
    print("=" * 50)
    print("Проверьте файл 'current_test.png' для визуальной проверки") 