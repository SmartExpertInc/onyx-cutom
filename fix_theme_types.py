#!/usr/bin/env python3
import os
import re
import glob

# Список файлов для исправления типов theme
files_to_fix = [
    "custom_extensions/frontend/src/components/templates/BarChartInfographicsTemplate.tsx",
    "custom_extensions/frontend/src/components/templates/BigImageTopTemplate.tsx",
    "custom_extensions/frontend/src/components/templates/ChartTemplate.tsx",
    "custom_extensions/frontend/src/components/templates/ChallengesSolutionsTemplate.tsx",
    "custom_extensions/frontend/src/components/templates/BigImageLeftTemplate.tsx",
    "custom_extensions/frontend/src/components/templates/BulletPointsTemplate.tsx",
    "custom_extensions/frontend/src/components/templates/BulletPointsRightTemplate.tsx",
    "custom_extensions/frontend/src/components/templates/AvatarWithButtonsSlideTemplate.tsx",
    "custom_extensions/frontend/src/components/templates/AvatarStepsSlideTemplate.tsx",
    "custom_extensions/frontend/src/components/templates/AvatarServiceSlideTemplate.tsx",
    "custom_extensions/frontend/src/components/templates/AvatarCrmSlideTemplate.tsx",
    "custom_extensions/frontend/src/components/templates/ProcessStepsTemplate.tsx",
    "custom_extensions/frontend/src/components/templates/PyramidTemplate.tsx",
    "custom_extensions/frontend/src/components/templates/TwoColumnTemplate.tsx",
]

def fix_theme_type(file_path):
    """Исправляет тип theme в файле"""
    if not os.path.exists(file_path):
        print(f"Файл не найден: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Паттерн для поиска theme?: SlideTheme;
    pattern = r'theme\?\:\s*SlideTheme;'
    replacement = 'theme?: string | SlideTheme;'
    
    if re.search(pattern, content):
        content = re.sub(pattern, replacement, content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Исправлен тип theme в: {file_path}")
        return True
    else:
        print(f"⚠️  Паттерн theme?: SlideTheme не найден в: {file_path}")
        return False

def main():
    print("🔧 Исправление типов theme в компонентах слайдов...")
    
    fixed_count = 0
    for file_path in files_to_fix:
        if fix_theme_type(file_path):
            fixed_count += 1
    
    print(f"\n🎉 Исправлено {fixed_count} файлов из {len(files_to_fix)}")

if __name__ == "__main__":
    main()