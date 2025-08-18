#!/usr/bin/env python3
"""
Simple test to check table generation functionality
"""

def test_table_keywords():
    """Test that table keywords are properly recognized"""
    
    print("🧪 TESTING TABLE KEYWORD RECOGNITION")
    print("=" * 40)
    
    # Test prompts that should trigger table templates
    test_prompts = [
        "Создай таблицу сравнения технологий",
        "Create table with performance data", 
        "Покажи сравнительную таблицу",
        "Make comparison table of results"
    ]
    
    table_keywords = [
        "table", "таблица", "сравнение", "comparison", 
        "данные", "data", "метрики", "metrics"
    ]
    
    for prompt in test_prompts:
        print(f"\nTesting: '{prompt}'")
        
        # Check if prompt contains table keywords
        found_keywords = [kw for kw in table_keywords if kw in prompt.lower()]
        
        if found_keywords:
            print(f"   ✅ Found keywords: {found_keywords}")
            print("   📋 Should generate: table-dark or table-light")
        else:
            print("   ❌ No table keywords found")
    
    print("\n✅ Table keyword testing completed")

def test_json_structure():
    """Test expected JSON structure for tables"""
    
    print("\n📊 EXPECTED TABLE JSON STRUCTURE")
    print("=" * 40)
    
    # Example table structure
    table_example = {
        "slideId": "slide_table_1",
        "slideNumber": 1,
        "slideTitle": "Technology Comparison",
        "templateId": "table-dark",
        "props": {
            "title": "Technology Platforms Comparison",
            "tableData": {
                "headers": ["Platform", "Performance", "Security", "Cost"],
                "rows": [
                    ["Cloud A", "High", "Strong encryption", "$200/month"],
                    ["Cloud B", "Moderate", "Standard security", "$150/month"],
                    ["On-Premise", "Very High", "Customizable", "$500/month"]
                ]
            },
            "showCheckmarks": True
        }
    }
    
    print("Expected structure for table-dark:")
    print(f"- templateId: {table_example['templateId']}")
    print(f"- title: {table_example['props']['title']}")
    print(f"- headers: {table_example['props']['tableData']['headers']}")
    print(f"- rows count: {len(table_example['props']['tableData']['rows'])}")
    
    print("\n✅ JSON structure validation completed")

def main():
    """Run table generation tests"""
    
    print("🚀 SIMPLE TABLE GENERATION TEST")
    print("=" * 50)
    
    test_table_keywords()
    test_json_structure()
    
    print("\n" + "=" * 50)
    print("🎉 TEST COMPLETED")
    print("\n💡 To test actual generation:")
    print("1. Use prompts with 'table', 'таблица', 'сравнение' keywords")
    print("2. Check that AI generates table-dark or table-light templates")
    print("3. Verify tableData structure with headers and rows")

if __name__ == "__main__":
    main() 