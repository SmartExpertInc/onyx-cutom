#!/usr/bin/env python3
"""
Тестовый скрипт для проверки шрифтов и позиционирования в pie chart
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.services.pie_chart_generator import pie_chart_generator
    print("✅ Pie chart generator imported successfully")
except ImportError as e:
    print(f"❌ Failed to import pie chart generator: {e}")
    sys.exit(1)

def test_pie_chart_fonts():
    """Тестирует шрифты и позиционирование в pie chart"""
    
    # Тестовые данные - точно как во фронтенде
    test_segments = [
        {'label': '15%', 'percentage': 15, 'color': '#0ea5e9', 'description': 'Blue segment'},
        {'label': '20%', 'percentage': 20, 'color': '#06b6d4', 'description': 'Cyan segment'},
        {'label': '25%', 'percentage': 25, 'color': '#67e8f9', 'description': 'Light blue segment'},
        {'label': '20%', 'percentage': 20, 'color': '#0891b2', 'description': 'Dark blue segment'},
        {'label': '12%', 'percentage': 12, 'color': '#f97316', 'description': 'Orange segment'},
        {'label': '8%', 'percentage': 8, 'color': '#fb923c', 'description': 'Light orange segment'}
    ]
    
    print("🎨 Testing pie chart fonts and positioning...")
    print(f"Segments: {len(test_segments)}")
    
    # Генерируем изображение
    output_path = "test_pie_chart_fonts.png"
    image_data = pie_chart_generator.generate_pie_chart_image(test_segments, output_path)
    
    if image_data and image_data.startswith("data:image/png;base64,"):
        print(f"✅ Pie chart generated successfully")
        print(f"📁 Image saved to: {output_path}")
        print(f"📊 Image data length: {len(image_data)} characters")
        
        # Проверяем что файл создан
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f"📏 File size: {file_size} bytes")
            print("🎯 Font and positioning test completed!")
            return True
        else:
            print("❌ File was not created")
            return False
    else:
        print("❌ Failed to generate pie chart")
        return False

def main():
    """Основная функция"""
    
    print("🎨 Pie Chart Fonts and Positioning Test")
    print("=" * 50)
    
    success = test_pie_chart_fonts()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Test completed! Check the generated image file.")
        print("💡 Compare with frontend to verify fonts and positioning match.")
    else:
        print("❌ Test failed.")
    
    return 0 if success else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code) 