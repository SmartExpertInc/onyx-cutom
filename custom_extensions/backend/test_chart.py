#!/usr/bin/env python3
"""
Тест новой версии круговой диаграммы
"""

import sys
import os

# Добавляем путь к модулям
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_chart_maker():
    """Тестирует генератор диаграммы"""
    print("=== ТЕСТ CHART_MAKER ===")
    
    try:
        from app.services.chart_maker import make_chart, get_default_segments
        
        # Создаем тестовые данные
        segments = get_default_segments()
        
        # Генерируем диаграмму
        image_base64 = make_chart(segments)
        
        if image_base64:
            print("✅ Диаграмма успешно создана!")
            print(f"Длина base64: {len(image_base64)} символов")
            return True
        else:
            print("❌ Ошибка создания диаграммы")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка импорта chart_maker: {e}")
        return False

def test_css_generator():
    """Тестирует CSS генератор"""
    print("\n=== ТЕСТ CHART_CSS ===")
    
    try:
        from app.utils.chart_css import create_css
        
        # Создаем тестовые данные
        segments = [
            {"percentage": 16.67, "color": "#3B82F6"},
            {"percentage": 16.67, "color": "#10B981"},
            {"percentage": 16.67, "color": "#F59E0B"},
            {"percentage": 16.67, "color": "#EF4444"},
            {"percentage": 16.67, "color": "#8B5CF6"},
            {"percentage": 16.67, "color": "#EC4899"}
        ]
        
        # Генерируем CSS
        result = create_css(segments, "test-chart")
        
        if result["html"] and result["css"]:
            print("✅ CSS успешно создан!")
            print(f"HTML длина: {len(result['html'])} символов")
            print(f"CSS длина: {len(result['css'])} символов")
            return True
        else:
            print("❌ Ошибка создания CSS")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка импорта chart_css: {e}")
        return False

def main():
    """Основная функция тестирования"""
    print("🚀 ЗАПУСК ТЕСТОВ НОВОЙ ВЕРСИИ ДИАГРАММЫ")
    print("=" * 50)
    
    # Тестируем генератор диаграммы
    chart_success = test_chart_maker()
    
    # Тестируем CSS генератор
    css_success = test_css_generator()
    
    # Итоговый результат
    print("\n" + "=" * 50)
    print("📊 ИТОГОВЫЙ РЕЗУЛЬТАТ:")
    
    if chart_success and css_success:
        print("✅ ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!")
        print("🎉 Новая версия диаграммы готова к использованию!")
    else:
        print("❌ НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОШЛИ")
        if not chart_success:
            print("   - Проблема с chart_maker.py")
        if not css_success:
            print("   - Проблема с chart_css.py")
    
    print("\n📁 Созданные файлы:")
    print("   - backend/app/services/chart_maker.py")
    print("   - backend/app/utils/chart_css.py")
    print("   - frontend/src/components/templates/ChartTemplate.tsx")
    print("   - backend/test_chart.py")

if __name__ == "__main__":
    main() 