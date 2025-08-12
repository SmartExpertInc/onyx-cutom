#!/usr/bin/env python3

import sys
import os
sys.path.append('custom_extensions/backend')

def test_language_config():
    print("=== Testing Language Configuration ===")
    
    try:
        from locales import LANG_CONFIG
        print("✓ Successfully imported LANG_CONFIG")
        
        # Check if all required keywords are present
        required_keys = ['MODULE_KEYWORD', 'LESSONS_HEADER_KEYWORD', 'TOTAL_TIME_KEYWORD', 'TIME_KEYWORD']
        
        for lang_code in ['en', 'ru', 'uk', 'es']:
            if lang_code in LANG_CONFIG:
                config = LANG_CONFIG[lang_code]
                print(f"\nLanguage: {lang_code}")
                missing_keys = []
                for key in required_keys:
                    if key in config:
                        print(f"  ✓ {key}: {config[key]}")
                    else:
                        print(f"  ✗ {key}: MISSING")
                        missing_keys.append(key)
                
                if not missing_keys:
                    print(f"  ✓ All required keywords present for {lang_code}")
                else:
                    print(f"  ✗ Missing keywords for {lang_code}: {missing_keys}")
            else:
                print(f"✗ Language {lang_code} not found in LANG_CONFIG")
        
        print("\n=== Language Detection Test ===")
        
        # Test the detect_language function
        from main import detect_language
        
        test_texts = {
            'en': "Module 1: Introduction\nTotal Time: 2h\nNumber of Lessons: 3\n### Lessons",
            'ru': "Модуль 1: Введение\nОбщее время: 2ч\nКоличество уроков: 3\n### Уроки",
            'uk': "Модуль 1: Вступ\nЗагальний час: 2год\nКількість уроків: 3\n### Уроки"
        }
        
        for lang, text in test_texts.items():
            try:
                detected = detect_language(text)
                print(f"Text in {lang}: detected as {detected}")
                if detected == lang:
                    print(f"  ✓ Correctly detected {lang}")
                else:
                    print(f"  ✗ Incorrectly detected {lang} as {detected}")
            except Exception as e:
                print(f"  ✗ Error detecting {lang}: {e}")
                
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == "__main__":
    test_language_config()
