#!/usr/bin/env python3

import sys
import os
sys.path.append('custom_extensions/backend')

from locales import LANG_CONFIG

def test_language_config():
    print("=== Language Configuration Debug ===")
    
    for lang_code, config in LANG_CONFIG.items():
        print(f"\nLanguage: {lang_code}")
        print(f"Config keys: {list(config.keys())}")
        
        # Check for required keywords
        required_keys = ['MODULE_KEYWORD', 'LESSONS_HEADER_KEYWORD', 'TOTAL_TIME_KEYWORD', 'TIME_KEYWORD']
        for key in required_keys:
            if key in config:
                print(f"  ✓ {key}: {config[key]}")
            else:
                print(f"  ✗ {key}: MISSING")
    
    print("\n=== Testing Language Detection ===")
    
    # Test the detect_language function
    from main import detect_language
    
    test_texts = {
        'en': "Module 1: Introduction\nTotal Time: 2h\nNumber of Lessons: 3\n### Lessons",
        'ru': "Модуль 1: Введение\nОбщее время: 2ч\nКоличество уроков: 3\n### Уроки",
        'uk': "Модуль 1: Вступ\nЗагальний час: 2год\nКількість уроків: 3\n### Уроки"
    }
    
    for lang, text in test_texts.items():
        detected = detect_language(text)
        print(f"Text in {lang}: detected as {detected}")
        print(f"  Text: {text[:50]}...")

if __name__ == "__main__":
    test_language_config()
