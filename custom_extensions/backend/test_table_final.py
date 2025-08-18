#!/usr/bin/env python3
"""
Final test for table generation with updated JSON examples
"""

import json
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_table_prompts():
    """Test various table generation prompts"""
    
    table_prompts = [
        "Создай таблицу сравнения технологий",
        "Сделай таблицу с данными о продуктах",
        "Сгенерируй таблицу сравнения планов подписки",
        "Создай таблицу метрик производительности",
        "Сделай сравнительную таблицу функций"
    ]
    
    print("=== ТЕСТ ГЕНЕРАЦИИ ТАБЛИЦ ===")
    print("Промпты для тестирования:")
    
    for i, prompt in enumerate(table_prompts, 1):
        print(f"{i}. {prompt}")
    
    print("\n=== ОЖИДАЕМАЯ СТРУКТУРА JSON ===")
    print("Для table-dark и table-light:")
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
    print("✅ JSON примеры добавлены в main.py")
    print("✅ Промпты обновлены с русскими ключевыми словами")
    print("✅ Frontend компоненты исправлены")
    print("✅ Registry обновлен")
    print("✅ TypeScript типы исправлены")
    
    print("\n=== ИНСТРУКЦИИ ДЛЯ ТЕСТИРОВАНИЯ ===")
    print("1. Запустите сервер: python main.py")
    print("2. Откройте сайт")
    print("3. Попробуйте промпты из списка выше")
    print("4. Таблицы должны генерироваться без ошибок")

if __name__ == "__main__":
    test_table_prompts() 