#!/usr/bin/env python3
"""
Test script to verify table generation fixes
"""

import json
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_table_fixes():
    """Test the table generation fixes"""
    
    print("=== ПРОВЕРКА ИСПРАВЛЕНИЙ ГЕНЕРАЦИИ ТАБЛИЦ ===")
    
    # Test prompts that should generate tables
    table_prompts = [
        "Создай таблицу сравнения технологий",
        "Сделай таблицу с данными о продуктах", 
        "Сгенерируй таблицу сравнения планов подписки",
        "Создай таблицу метрик производительности",
        "Сделай сравнительную таблицу функций",
        "Создай таблицу данных",
        "Сделай таблицу анализа",
        "Сгенерируй таблицу статистики"
    ]
    
    print("\n=== ПРОМПТЫ ДЛЯ ТЕСТИРОВАНИЯ ===")
    for i, prompt in enumerate(table_prompts, 1):
        print(f"{i}. {prompt}")
    
    print("\n=== ОЖИДАЕМЫЙ РЕЗУЛЬТАТ ===")
    print("При использовании этих промптов система должна:")
    print("1. ✅ Выбрать шаблон table-dark или table-light")
    print("2. ✅ Сгенерировать правильную структуру JSON")
    print("3. ✅ Отобразить таблицу на сайте")
    print("4. ❌ НЕ использовать two-column или другие шаблоны")
    
    print("\n=== СТРУКТУРА JSON ДЛЯ ТАБЛИЦ ===")
    print("""
{
  "slideId": "slide_X",
  "slideNumber": X,
  "slideTitle": "Title",
  "templateId": "table-dark" | "table-light",
  "props": {
    "title": "Table Title",
    "tableData": {
      "headers": ["Header1", "Header2", "Header3"],
      "rows": [
        ["Row1Col1", "Row1Col2", "Row1Col3"],
        ["Row2Col1", "Row2Col2", "Row2Col3"]
      ]
    }
  }
}
""")
    
    print("=== СТАТУС ИСПРАВЛЕНИЙ ===")
    print("✅ Удален comparison-slide из main.py")
    print("✅ Добавлены CRITICAL TABLE RULE в main.py")
    print("✅ Усилены правила в content_builder_ai.txt")
    print("✅ Добавлены JSON примеры в main.py")
    print("✅ Исправлены frontend компоненты")
    print("✅ Обновлен registry")
    
    print("\n=== ИНСТРУКЦИИ ДЛЯ ТЕСТИРОВАНИЯ ===")
    print("1. Запустите сервер: python main.py")
    print("2. Откройте сайт")
    print("3. Попробуйте промпты из списка выше")
    print("4. Убедитесь, что генерируются именно таблицы, а не слайды сравнения")
    print("5. Проверьте, что таблицы отображаются без ошибок")

if __name__ == "__main__":
    test_table_fixes() 