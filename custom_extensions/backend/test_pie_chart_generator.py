#!/usr/bin/env python3
"""
Тестовый скрипт для проверки pie chart генератора
"""

import sys
import os
import asyncio

# Добавляем путь к модулям
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.services.pie_chart_generator import pie_chart_generator
    print("✅ Pie chart generator imported successfully")
except ImportError as e:
    print(f"❌ Failed to import pie chart generator: {e}")
    sys.exit(1)

def test_pie_chart_generation():
    """Тестирует генерацию pie chart"""
    
    print("\n=== Testing Pie Chart Generator ===")
    
    # Тестовые данные
    test_segments = [
        {'percentage': 30, 'color': '#ff6b6b', 'label': '30%'},
        {'percentage': 25, 'color': '#4ecdc4', 'label': '25%'},
        {'percentage': 20, 'color': '#45b7d1', 'label': '20%'},
        {'percentage': 15, 'color': '#96ceb4', 'label': '15%'},
        {'percentage': 10, 'color': '#feca57', 'label': '10%'}
    ]
    
    print(f"Testing with {len(test_segments)} segments:")
    for segment in test_segments:
        print(f"  - {segment['label']}: {segment['color']}")
    
    try:
        # Генерируем изображение
        print("\nGenerating pie chart image...")
        image_data = pie_chart_generator.generate_pie_chart_image(test_segments)
        
        if image_data:
            print("✅ Pie chart generated successfully")
            print(f"   Image data length: {len(image_data)} characters")
            print(f"   Starts with: {image_data[:50]}...")
            
            # Проверяем, что это валидный base64
            if image_data.startswith('data:image/png;base64,'):
                print("✅ Valid base64 data URL format")
            else:
                print("❌ Invalid data URL format")
                
        else:
            print("❌ Failed to generate pie chart image")
            return False
            
    except Exception as e:
        print(f"❌ Error generating pie chart: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

def test_empty_segments():
    """Тестирует обработку пустых сегментов"""
    
    print("\n=== Testing Empty Segments ===")
    
    try:
        image_data = pie_chart_generator.generate_pie_chart_image([])
        print("✅ Empty segments handled gracefully")
        return True
    except Exception as e:
        print(f"❌ Error with empty segments: {e}")
        return False

def test_invalid_data():
    """Тестирует обработку некорректных данных"""
    
    print("\n=== Testing Invalid Data ===")
    
    # Тест с некорректными процентами
    invalid_segments = [
        {'percentage': -10, 'color': '#ff0000', 'label': '-10%'},
        {'percentage': 0, 'color': '#00ff00', 'label': '0%'},
        {'percentage': 150, 'color': '#0000ff', 'label': '150%'}
    ]
    
    try:
        image_data = pie_chart_generator.generate_pie_chart_image(invalid_segments)
        print("✅ Invalid data handled gracefully")
        return True
    except Exception as e:
        print(f"❌ Error with invalid data: {e}")
        return False

def main():
    """Основная функция тестирования"""
    
    print("🧪 Pie Chart Generator Test Suite")
    print("=" * 50)
    
    # Запускаем тесты
    tests = [
        test_pie_chart_generation,
        test_empty_segments,
        test_invalid_data
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Pie chart generator is working correctly.")
        return 0
    else:
        print("❌ Some tests failed. Please check the implementation.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code) 