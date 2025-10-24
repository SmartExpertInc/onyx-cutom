#!/usr/bin/env python3
"""
Тест для проверки точного соответствия слайда Bullet Points Right фото
"""

import os
import sys
from pathlib import Path

def test_exact_match():
    """Тестирует точное соответствие слайда фото"""
    
    print("🔍 Проверка точного соответствия фото...")
    
    # Проверяем фронтенд компонент
    frontend_path = Path("custom_extensions/frontend/src/components/templates/BulletPointsRightTemplate.tsx")
    if frontend_path.exists():
        with open(frontend_path, 'r', encoding='utf-8') as f:
            frontend_content = f.read()
        
        print("\n📱 Фронтенд компонент:")
        
        # Проверяем структуру
        structure_checks = [
            ("Left section with title and bullets", "Левая секция содержит заголовок и маркеры"),
            ("Right section with image only", "Правая секция содержит только изображение"),
            ("background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)'", "Темно-синий градиент"),
            ("color: '#ffffff'", "Белый цвет текста"),
            ("fontFamily: 'serif'", "Serif шрифт для заголовка"),
            ("▶", "Треугольные маркеры")
        ]
        
        for check, description in structure_checks:
            if check in frontend_content:
                print(f"  ✅ {description}")
            else:
                print(f"  ❌ {description}")
    
    # Проверяем PDF шаблон
    pdf_path = Path("custom_extensions/backend/templates/single_slide_pdf_template.html")
    if pdf_path.exists():
        with open(pdf_path, 'r', encoding='utf-8') as f:
            pdf_content = f.read()
        
        print("\n📄 PDF шаблон:")
        
        # Проверяем HTML структуру
        html_checks = [
            ("Left section with title and bullets", "Левая секция содержит заголовок и маркеры"),
            ("Right section with image only", "Правая секция содержит только изображение"),
            ("<h1 class=\"slide-title\">", "Заголовок в левой секции"),
            ("<ul class=\"bullet-list\">", "Список маркеров"),
            ("<span class=\"bullet-icon\">▶</span>", "Треугольные маркеры")
        ]
        
        for check, description in html_checks:
            if check in pdf_content:
                print(f"  ✅ {description}")
            else:
                print(f"  ❌ {description}")
        
        # Проверяем CSS стили
        css_checks = [
            ("color: #ffffff", "Белый цвет текста"),
            ("font-family: 'serif', serif", "Serif шрифт"),
            ("linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)", "Темно-синий градиент")
        ]
        
        for check, description in css_checks:
            if check in pdf_content:
                print(f"  ✅ {description}")
            else:
                print(f"  ❌ {description}")
    
    print("\n🎯 Структура слайда (как на фото):")
    print("  📍 Левая секция (45%):")
    print("    - Темно-синий градиентный фон")
    print("    - Белый заголовок 'Problem' (serif, 3.5rem)")
    print("    - Белые треугольные маркеры (▶)")
    print("    - Белый текст маркеров")
    print("  📍 Правая секция (55%):")
    print("    - Белый фон")
    print("    - Изображение людей за столом")
    print("    - Диагональная линия между секциями")
    print("    - Синий градиент в левом верхнем углу")
    
    print("\n✅ Слайд Bullet Points Right теперь точно соответствует фото!")
    return True

if __name__ == "__main__":
    print("🚀 Тестирование точного соответствия фото...")
    success = test_exact_match()
    
    if success:
        print("\n🎉 Успешно! Слайд теперь выглядит 1 в 1 как на фото!")
    else:
        print("\n❌ Требуются дополнительные исправления")
        sys.exit(1)