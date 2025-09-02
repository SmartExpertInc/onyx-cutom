#!/usr/bin/env python3
"""
Быстрый тест для проверки изменений в pie chart генераторе
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.pie_chart_generator import PieChartGenerator
import math

def quick_test():
    """Быстрый тест позиционирования"""
    print("=== БЫСТРЫЙ ТЕСТ ПОЗИЦИОНИРОВАНИЯ ===")
    
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
    
    # Симулируем логику из генератора
    current_angle = 0
    print("\nПозиции процентов:")
    
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
    
    print("\n✅ Тест завершен")

if __name__ == "__main__":
    quick_test() 