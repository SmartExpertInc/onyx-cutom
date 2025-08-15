#!/usr/bin/env python3
"""
Тест простой версии круговой диаграммы
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.simple_pie_chart_generator import simple_pie_generator
from app.utils.simple_css_generator import generate_simple_css
from app.utils.simple_calculator import calculate_segments, validate_data, create_default_segments

def test_simple_pie_chart():
    """Тестирует простую версию круговой диаграммы"""
    
    print("=== ТЕСТ ПРОСТОЙ ВЕРСИИ КРУГОВОЙ ДИАГРАММЫ ===\n")
    
    # Создаем тестовые данные
    test_segments = create_default_segments()
    
    # Тест 1: Валидация данных
    print("1. Тест валидации данных:")
    validation = validate_data(test_segments)
    print(f"   Валидность: {validation['valid']}")
    if validation['valid']:
        print(f"   Общий процент: {validation['total_percentage']}%")
        for segment in validation['segments']:
            print(f"   - {segment['label']}: {segment['percentage']}% ({segment['color']})")
    print()
    
    # Тест 2: Расчет углов
    print("2. Тест расчета углов:")
    angles = calculate_segments(test_segments)
    for i, angle_data in enumerate(angles):
        print(f"   Сегмент {i+1}: {angle_data['start_angle']}° - {angle_data['end_angle']}° (центр: {angle_data['center_angle']}°)")
    print()
    
    # Тест 3: CSS генератор
    print("3. Тест CSS генератора:")
    css_result = generate_simple_css(test_segments, "simple-chart")
    print("   HTML код:")
    print(css_result["html"])
    print("\n   CSS код:")
    print(css_result["css"])
    print()
    
    # Тест 4: Генератор изображений
    print("4. Тест генератора изображений:")
    try:
        image_base64 = simple_pie_generator.generate_pie_chart(test_segments)
        if image_base64:
            print("   ✅ Изображение успешно сгенерировано")
            print(f"   Длина base64: {len(image_base64)} символов")
            
            # Сохраняем тестовое изображение
            output_path = "simple_pie_chart.png"
            simple_pie_generator.generate_pie_chart(test_segments, output_path)
            print(f"   Изображение сохранено в: {output_path}")
        else:
            print("   ❌ Ошибка генерации изображения")
    except Exception as e:
        print(f"   ❌ Ошибка: {e}")
    
    print("\n=== ТЕСТ ЗАВЕРШЕН ===")
    print("✅ Простая версия работает без проблем с правами доступа!")

if __name__ == "__main__":
    test_simple_pie_chart() 