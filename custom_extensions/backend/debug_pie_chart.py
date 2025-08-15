#!/usr/bin/env python3
"""
Отладочный скрипт для проверки версии кода pie chart генератора
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.pie_chart_generator import PieChartGenerator
import math

def debug_generator_version():
    """Проверяет версию генератора"""
    print("=== ОТЛАДКА PIE CHART ГЕНЕРАТОРА ===")
    
    # Создаем экземпляр генератора
    generator = PieChartGenerator()
    
    # Проверяем атрибуты
    print(f"Ширина: {generator.width}")
    print(f"Высота: {generator.height}")
    print(f"Центр X: {generator.center_x}")
    print(f"Центр Y: {generator.center_y}")
    print(f"Внешний радиус: {generator.outer_radius}")
    print(f"Внутренний радиус: {generator.inner_radius}")
    
    # Тестовые данные
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
    print(f"\nОбщий процент: {total_percentage}%")
    
    # Симулируем логику позиционирования
    print("\n=== СИМУЛЯЦИЯ ПОЗИЦИОНИРОВАНИЯ ===")
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
            
        x = generator.center_x + label_radius * math.cos(rad)
        y = generator.center_y + label_radius * math.sin(rad)
        
        print(f"Сегмент {i+1} ({segment['label']}):")
        print(f"  Размер сегмента: {segment_angle:.1f}°")
        print(f"  Центральный угол: {label_angle:.1f}°")
        print(f"  Используемый радиус: {label_radius}px")
        print(f"  Позиция: ({x:.1f}, {y:.1f})")
        print()
        
        current_angle += segment_angle

def test_actual_generation():
    """Тестирует реальную генерацию"""
    print("\n=== ТЕСТ РЕАЛЬНОЙ ГЕНЕРАЦИИ ===")
    
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
        print("Генерируем изображение...")
        image_data = generator.generate_pie_chart_image(segments)
        
        if image_data.startswith("data:image/png;base64,"):
            print("✅ Генерация успешна")
            
            # Сохраняем тестовое изображение
            import base64
            image_bytes = base64.b64decode(image_data.split(',')[1])
            with open('debug_test.png', 'wb') as f:
                f.write(image_bytes)
            print("✅ Изображение сохранено как 'debug_test.png'")
            print(f"Размер данных: {len(image_data)} символов")
        else:
            print("❌ Ошибка генерации")
            print(f"Полученные данные: {image_data[:100]}...")
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("ОТЛАДКА PIE CHART ГЕНЕРАТОРА")
    print("=" * 60)
    
    debug_generator_version()
    test_actual_generation()
    
    print("=" * 60)
    print("Проверьте файл 'debug_test.png' для визуальной проверки") 