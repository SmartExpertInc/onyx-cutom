#!/usr/bin/env python3
"""
Тестовый скрипт для проверки позиционирования процентов в pie chart
Сравнивает позиции между фронтендом и бэкендом
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.pie_chart_generator import PieChartGenerator
from app.utils.pie_chart_calculator import calculate_label_positions
import math

def test_frontend_positions():
    """Тестирует позиционирование как во фронтенде"""
    segments = [
        {"label": "15%", "percentage": 15, "color": "#0ea5e9"},
        {"label": "20%", "percentage": 20, "color": "#06b6d4"},
        {"label": "25%", "percentage": 25, "color": "#67e8f9"},
        {"label": "20%", "percentage": 20, "color": "#0891b2"},
        {"label": "12%", "percentage": 12, "color": "#f97316"},
        {"label": "8%", "percentage": 8, "color": "#fb923c"}
    ]
    
    # Фронтенд логика (из PieChartInfographicsTemplate.tsx)
    total_percentage = sum(segment['percentage'] for segment in segments)
    cumulative_percentage = 0
    
    print("=== ФРОНТЕНД ПОЗИЦИИ ===")
    frontend_positions = []
    
    for segment in segments:
        start_angle = (cumulative_percentage / total_percentage) * 360
        end_angle = ((cumulative_percentage + segment['percentage']) / total_percentage) * 360
        center_angle = (start_angle + end_angle) / 2
        cumulative_percentage += segment['percentage']
        
        # Convert angle to radians and calculate position
        angle_rad = (center_angle - 90) * math.pi / 180
        radius = 98  # Distance from center
        x = 140 + radius * math.cos(angle_rad)
        y = 140 + radius * math.sin(angle_rad)
        
        frontend_positions.append({
            'label': segment['label'],
            'x': round(x, 2),
            'y': round(y, 2),
            'angle': round(center_angle, 2)
        })
        
        print(f"{segment['label']}: ({x:.2f}, {y:.2f}) - угол: {center_angle:.2f}°")
    
    return frontend_positions

def test_backend_positions():
    """Тестирует позиционирование в бэкенде"""
    segments = [
        {"label": "15%", "percentage": 15, "color": "#0ea5e9"},
        {"label": "20%", "percentage": 20, "color": "#06b6d4"},
        {"label": "25%", "percentage": 25, "color": "#67e8f9"},
        {"label": "20%", "percentage": 20, "color": "#0891b2"},
        {"label": "12%", "percentage": 12, "color": "#f97316"},
        {"label": "8%", "percentage": 8, "color": "#fb923c"}
    ]
    
    print("\n=== БЭКЕНД ПОЗИЦИИ ===")
    backend_positions = calculate_label_positions(segments)
    
    for pos in backend_positions:
        print(f"{pos['label']}: ({pos['x']}, {pos['y']}) - угол: {pos['angle']}°")
    
    return backend_positions

def compare_positions(frontend_positions, backend_positions):
    """Сравнивает позиции между фронтендом и бэкендом"""
    print("\n=== СРАВНЕНИЕ ПОЗИЦИЙ ===")
    
    if len(frontend_positions) != len(backend_positions):
        print("ОШИБКА: Разное количество сегментов!")
        return
    
    for i, (frontend, backend) in enumerate(zip(frontend_positions, backend_positions)):
        x_diff = abs(frontend['x'] - backend['x'])
        y_diff = abs(frontend['y'] - backend['y'])
        angle_diff = abs(frontend['angle'] - backend['angle'])
        
        print(f"Сегмент {i+1} ({frontend['label']}):")
        print(f"  X: фронтенд={frontend['x']:.2f}, бэкенд={backend['x']:.2f}, разница={x_diff:.2f}")
        print(f"  Y: фронтенд={frontend['y']:.2f}, бэкенд={backend['y']:.2f}, разница={y_diff:.2f}")
        print(f"  Угол: фронтенд={frontend['angle']:.2f}°, бэкенд={backend['angle']:.2f}°, разница={angle_diff:.2f}°")
        
        if x_diff > 0.1 or y_diff > 0.1:
            print(f"  ⚠️  ВНИМАНИЕ: Большая разница в позиционировании!")
        else:
            print(f"  ✅ Позиции совпадают")
        print()

def test_pie_chart_generation():
    """Тестирует генерацию pie chart изображения"""
    print("\n=== ТЕСТ ГЕНЕРАЦИИ PIE CHART ===")
    
    segments = [
        {"label": "15%", "percentage": 15, "color": "#0ea5e9"},
        {"label": "20%", "percentage": 20, "color": "#06b6d4"},
        {"label": "25%", "percentage": 25, "color": "#67e8f9"},
        {"label": "20%", "percentage": 20, "color": "#0891b2"},
        {"label": "12%", "percentage": 12, "color": "#f97316"},
        {"label": "8%", "percentage": 8, "color": "#fb923c"}
    ]
    
    generator = PieChartGenerator()
    
    try:
        # Генерируем изображение
        image_data = generator.generate_pie_chart_image(segments)
        
        if image_data.startswith("data:image/png;base64,"):
            print("✅ Pie chart успешно сгенерирован")
            print(f"Размер base64 данных: {len(image_data)} символов")
        else:
            print("❌ Ошибка генерации pie chart")
            
    except Exception as e:
        print(f"❌ Ошибка при генерации: {e}")

if __name__ == "__main__":
    print("ТЕСТИРОВАНИЕ ПОЗИЦИОНИРОВАНИЯ PIE CHART")
    print("=" * 50)
    
    # Тестируем позиционирование
    frontend_positions = test_frontend_positions()
    backend_positions = test_backend_positions()
    
    # Сравниваем позиции
    compare_positions(frontend_positions, backend_positions)
    
    # Тестируем генерацию изображения
    test_pie_chart_generation()
    
    print("\n" + "=" * 50)
    print("ТЕСТИРОВАНИЕ ЗАВЕРШЕНО") 