#!/usr/bin/env python3
"""
Тест нового компонента круговой диаграммы
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.pie_chart_generator import pie_chart_generator
from app.utils.pie_chart_css_generator import generate_css_pie_chart
from app.utils.pie_chart_calculator import calculate_segment_angles, validate_segments

def test_new_pie_chart():
    """Тестирует новый компонент круговой диаграммы"""
    
    # Тестовые данные для 6 сегментов
    test_segments = [
        {"label": "Сегмент 1", "percentage": 16.67, "color": "#3B82F6", "description": "Первый сегмент диаграммы"},
        {"label": "Сегмент 2", "percentage": 16.67, "color": "#10B981", "description": "Второй сегмент диаграммы"},
        {"label": "Сегмент 3", "percentage": 16.67, "color": "#F59E0B", "description": "Третий сегмент диаграммы"},
        {"label": "Сегмент 4", "percentage": 16.67, "color": "#EF4444", "description": "Четвертый сегмент диаграммы"},
        {"label": "Сегмент 5", "percentage": 16.67, "color": "#8B5CF6", "description": "Пятый сегмент диаграммы"},
        {"label": "Сегмент 6", "percentage": 16.67, "color": "#EC4899", "description": "Шестой сегмент диаграммы"}
    ]
    
    print("=== ТЕСТ НОВОГО КОМПОНЕНТА КРУГОВОЙ ДИАГРАММЫ ===\n")
    
    # Тест валидации сегментов
    print("1. Тест валидации сегментов:")
    validation = validate_segments(test_segments)
    print(f"   Валидность: {validation['valid']}")
    if validation['valid']:
        print(f"   Общий процент: {validation['total_percentage']}%")
        for segment in validation['segments']:
            print(f"   - {segment['label']}: {segment['percentage']}% ({segment['color']})")
    print()
    
    # Тест расчета углов
    print("2. Тест расчета углов сегментов:")
    angles = calculate_segment_angles(test_segments)
    for i, angle_data in enumerate(angles):
        print(f"   Сегмент {i+1}: {angle_data['start_angle']}° - {angle_data['end_angle']}° (центр: {angle_data['center_angle']}°)")
    print()
    
    # Тест CSS генератора
    print("3. Тест CSS генератора:")
    css_result = generate_css_pie_chart(test_segments, "test-chart")
    print("   HTML код:")
    print(css_result["html"])
    print("\n   CSS код:")
    print(css_result["css"])
    print()
    
    # Тест генератора изображений
    print("4. Тест генератора изображений:")
    try:
        image_base64 = pie_chart_generator.generate_pie_chart_image(test_segments)
        if image_base64:
            print("   ✅ Изображение успешно сгенерировано")
            print(f"   Длина base64: {len(image_base64)} символов")
            
            # Сохраняем тестовое изображение
            output_path = "test_pie_chart.png"
            pie_chart_generator.generate_pie_chart_image(test_segments, output_path)
            print(f"   Изображение сохранено в: {output_path}")
        else:
            print("   ❌ Ошибка генерации изображения")
    except Exception as e:
        print(f"   ❌ Ошибка: {e}")
    
    print("\n=== ТЕСТ ЗАВЕРШЕН ===")

if __name__ == "__main__":
    test_new_pie_chart() 