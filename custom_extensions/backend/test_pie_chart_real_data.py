#!/usr/bin/env python3
"""
Тестовый скрипт для проверки позиционирования процентов в pie chart
с реальными данными из изображения (7 сегментов, 120% общий процент)
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.pie_chart_generator import PieChartGenerator
from app.utils.pie_chart_calculator import calculate_label_positions
import math

def test_real_data_positions():
    """Тестирует позиционирование с реальными данными из изображения"""
    # Данные из изображения: 7 сегментов, общий процент 120%
    segments = [
        {"label": "8%", "percentage": 8, "color": "#0ea5e9"},   # Темно-бирюзовый
        {"label": "15%", "percentage": 15, "color": "#f97316"}, # Оранжевый
        {"label": "20%", "percentage": 20, "color": "#fb923c"}, # Светло-оранжевый
        {"label": "20%", "percentage": 20, "color": "#0ea5e9"}, # Ярко-синий
        {"label": "25%", "percentage": 25, "color": "#06b6d4"}, # Средне-бирюзовый
        {"label": "20%", "percentage": 20, "color": "#67e8f9"}, # Светло-голубой
        {"label": "12%", "percentage": 12, "color": "#0891b2"}  # Темно-бирюзовый
    ]
    
    total_percentage = sum(segment['percentage'] for segment in segments)
    print(f"Общий процент: {total_percentage}%")
    
    # Фронтенд логика (из PieChartInfographicsTemplate.tsx)
    cumulative_percentage = 0
    
    print("=== ФРОНТЕНД ПОЗИЦИИ (РЕАЛЬНЫЕ ДАННЫЕ) ===")
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
            'angle': round(center_angle, 2),
            'segment_angle': round((segment['percentage'] / total_percentage) * 360, 2)
        })
        
        print(f"{segment['label']}: ({x:.2f}, {y:.2f}) - угол: {center_angle:.2f}° - размер сегмента: {round((segment['percentage'] / total_percentage) * 360, 2)}°")
    
    return frontend_positions

def test_backend_real_data_positions():
    """Тестирует позиционирование в бэкенде с реальными данными"""
    segments = [
        {"label": "8%", "percentage": 8, "color": "#0ea5e9"},
        {"label": "15%", "percentage": 15, "color": "#f97316"},
        {"label": "20%", "percentage": 20, "color": "#fb923c"},
        {"label": "20%", "percentage": 20, "color": "#0ea5e9"},
        {"label": "25%", "percentage": 25, "color": "#06b6d4"},
        {"label": "20%", "percentage": 20, "color": "#67e8f9"},
        {"label": "12%", "percentage": 12, "color": "#0891b2"}
    ]
    
    print("\n=== БЭКЕНД ПОЗИЦИИ (РЕАЛЬНЫЕ ДАННЫЕ) ===")
    backend_positions = calculate_label_positions(segments)
    
    for pos in backend_positions:
        print(f"{pos['label']}: ({pos['x']}, {pos['y']}) - угол: {pos['angle']}°")
    
    return backend_positions

def test_pie_chart_generation_real_data():
    """Тестирует генерацию pie chart изображения с реальными данными"""
    print("\n=== ТЕСТ ГЕНЕРАЦИИ PIE CHART (РЕАЛЬНЫЕ ДАННЫЕ) ===")
    
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
            print("✅ Pie chart успешно сгенерирован с реальными данными")
            print(f"Размер base64 данных: {len(image_data)} символов")
            
            # Сохраняем тестовое изображение
            import base64
            image_bytes = base64.b64decode(image_data.split(',')[1])
            with open('test_pie_chart_real_data.png', 'wb') as f:
                f.write(image_bytes)
            print("✅ Тестовое изображение сохранено как 'test_pie_chart_real_data.png'")
        else:
            print("❌ Ошибка генерации pie chart")
            
    except Exception as e:
        print(f"❌ Ошибка при генерации: {e}")

def analyze_segment_sizes():
    """Анализирует размеры сегментов и их влияние на позиционирование"""
    print("\n=== АНАЛИЗ РАЗМЕРОВ СЕГМЕНТОВ ===")
    
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
    
    for segment in segments:
        segment_angle = (segment['percentage'] / total_percentage) * 360
        radius_used = 85 if segment_angle < 30 else 98
        print(f"{segment['label']}: {segment['percentage']}% -> {segment_angle:.1f}° -> радиус {radius_used}px")

if __name__ == "__main__":
    print("ТЕСТИРОВАНИЕ PIE CHART С РЕАЛЬНЫМИ ДАННЫМИ")
    print("=" * 60)
    
    # Анализируем размеры сегментов
    analyze_segment_sizes()
    
    # Тестируем позиционирование с реальными данными
    frontend_positions = test_real_data_positions()
    backend_positions = test_backend_real_data_positions()
    
    # Тестируем генерацию изображения
    test_pie_chart_generation_real_data()
    
    print("\n" + "=" * 60)
    print("ТЕСТИРОВАНИЕ ЗАВЕРШЕНО")
    print("Проверьте файл 'test_pie_chart_real_data.png' для визуальной проверки") 