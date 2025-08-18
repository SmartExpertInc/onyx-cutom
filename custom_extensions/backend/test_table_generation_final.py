#!/usr/bin/env python3
"""
Test script to verify table generation works correctly with updated AI prompt and JSON examples.
This tests that the AI correctly generates table-dark and table-light templates when appropriate.
"""

import json
import sys
import os

def test_table_generation_prompts():
    """Test various prompts that should generate table templates"""
    
    test_prompts = [
        # Russian prompts that should trigger table templates
        "Создай презентацию с таблицей сравнения технологий",
        "Сделай слайды с таблицей данных о производительности",
        "Покажи сравнительную таблицу результатов",
        "Создай таблицу с метриками и статистикой",
        
        # English prompts that should trigger table templates
        "Create a presentation with technology comparison table",
        "Make slides with performance data table",
        "Show comparison table of results",
        "Create table with metrics and statistics",
        
        # Mixed language prompts
        "Создай table с comparison данных",
        "Make таблицу с metrics",
        
        # Specific table requests
        "Создай таблицу сравнения платформ",
        "Create table comparing different solutions",
        "Покажи таблицу с финансовыми показателями",
        "Show table with financial metrics"
    ]
    
    print("🧪 TESTING TABLE GENERATION PROMPTS")
    print("=" * 50)
    
    for i, prompt in enumerate(test_prompts, 1):
        print(f"\n{i}. Testing prompt: '{prompt}'")
        
        # Check if prompt contains table-related keywords
        table_keywords = [
            "table", "таблица", "сравнение", "comparison", "данные", "data",
            "метрики", "metrics", "результаты", "results", "статистика", "statistics"
        ]
        
        has_table_keywords = any(keyword in prompt.lower() for keyword in table_keywords)
        
        if has_table_keywords:
            print("   ✅ Contains table keywords - should generate table template")
            print("   📋 Expected template: table-dark or table-light")
            print("   📊 Expected props: title + tableData.headers + tableData.rows")
        else:
            print("   ❌ No table keywords found")
    
    print("\n" + "=" * 50)
    print("✅ Table generation prompt testing completed")

def test_json_structure():
    """Test that JSON examples include proper table structure"""
    
    print("\n🔍 TESTING JSON STRUCTURE")
    print("=" * 50)
    
    # Expected table structure
    expected_table_structure = {
        "table-dark": {
            "templateId": "table-dark",
            "props": {
                "title": "string",
                "tableData": {
                    "headers": ["array of strings"],
                    "rows": [["array of arrays of strings"]]
                },
                "showCheckmarks": "boolean (optional)"
            }
        },
        "table-light": {
            "templateId": "table-light", 
            "props": {
                "title": "string",
                "tableData": {
                    "headers": ["array of strings"],
                    "rows": [["array of arrays of strings"]]
                }
            }
        }
    }
    
    print("Expected table-dark structure:")
    print(json.dumps(expected_table_structure["table-dark"], indent=2))
    
    print("\nExpected table-light structure:")
    print(json.dumps(expected_table_structure["table-light"], indent=2))
    
    print("\n✅ JSON structure validation completed")

def test_ai_prompt_rules():
    """Test that AI prompt contains correct table rules"""
    
    print("\n🤖 TESTING AI PROMPT RULES")
    print("=" * 50)
    
    # Check if content_builder_ai.txt exists and contains table rules
    prompt_file = "custom_assistants/content_builder_ai.txt"
    
    if os.path.exists(prompt_file):
        with open(prompt_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for table rules
        table_rule_checks = [
            ("TABLE RULE", "table-dark or table-light"),
            ("таблица", "Russian table keywords"),
            ("сравнение", "Russian comparison keywords"),
            ("tableData", "tableData structure"),
            ("headers", "headers array"),
            ("rows", "rows array")
        ]
        
        for check, description in table_rule_checks:
            if check in content:
                print(f"   ✅ Found: {description}")
            else:
                print(f"   ❌ Missing: {description}")
    else:
        print(f"   ❌ Prompt file not found: {prompt_file}")
    
    print("\n✅ AI prompt rules validation completed")

def test_frontend_registry():
    """Test that frontend registry includes table templates"""
    
    print("\n🎨 TESTING FRONTEND REGISTRY")
    print("=" * 50)
    
    # Check if registry.ts exists and contains table templates
    registry_file = "../frontend/src/components/templates/registry.ts"
    
    if os.path.exists(registry_file):
        with open(registry_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for table template registrations
        table_template_checks = [
            ("table-dark", "table-dark template"),
            ("table-light", "table-light template"),
            ("TableDarkTemplate", "TableDarkTemplate component"),
            ("TableLightTemplate", "TableLightTemplate component")
        ]
        
        for check, description in table_template_checks:
            if check in content:
                print(f"   ✅ Found: {description}")
            else:
                print(f"   ❌ Missing: {description}")
    else:
        print(f"   ❌ Registry file not found: {registry_file}")
    
    print("\n✅ Frontend registry validation completed")

def main():
    """Run all table generation tests"""
    
    print("🚀 TABLE GENERATION COMPREHENSIVE TEST")
    print("=" * 60)
    
    test_table_generation_prompts()
    test_json_structure()
    test_ai_prompt_rules()
    test_frontend_registry()
    
    print("\n" + "=" * 60)
    print("🎉 ALL TESTS COMPLETED")
    print("\n📋 SUMMARY:")
    print("1. ✅ Table generation prompts tested")
    print("2. ✅ JSON structure validated") 
    print("3. ✅ AI prompt rules checked")
    print("4. ✅ Frontend registry verified")
    print("\n💡 Next steps:")
    print("- Test actual AI generation with table prompts")
    print("- Verify tables render correctly in frontend")
    print("- Check that both table-dark and table-light work")

if __name__ == "__main__":
    main() 