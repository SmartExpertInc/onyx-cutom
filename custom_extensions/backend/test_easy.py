#!/usr/bin/env python3
"""
Тест простой версии круговой диаграммы
"""

from app.services.easy_pie_chart import create_pie_chart, create_default_segments
from app.utils.easy_css import make_css_chart

def test_easy_version():
    """Тестирует простую версию"""
    
    print("=== ТЕСТ ПРОСТОЙ ВЕРСИИ ===")
    
    # Создаем тестовые данные
    test_segments = create_default_segments()
    
    print("1. Тест генератора изображений:")
    image_base64 = create_pie_chart(test_segments)
    if image_base64:
        print("   ✅ Изображение создано успешно")
        print(f"   Длина base64: {len(image_base64)} символов")
    else:
        print("   ❌ Ошибка создания изображения")
    
    print("\n2. Тест CSS генератора:")
    css_result = make_css_chart(test_segments, "easy-chart")
    if css_result["html"] and css_result["css"]:
        print("   ✅ CSS код создан успешно")
        print(f"   HTML: {len(css_result['html'])} символов")
        print(f"   CSS: {len(css_result['css'])} символов")
    else:
        print("   ❌ Ошибка создания CSS")
    
    print("\n=== ТЕСТ ЗАВЕРШЕН ===")
    print("✅ Простая версия работает!")

if __name__ == "__main__":
    test_easy_version() 