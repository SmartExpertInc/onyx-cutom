#!/bin/bash

echo "=== Решение проблемы с кэшированными файлами Python ==="

# 1. Устанавливаем переменную окружения
export PYTHONDONTWRITEBYTECODE=1

# 2. Пытаемся удалить проблемные файлы
echo "Удаляем кэшированные файлы..."
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name "*.pyo" -delete 2>/dev/null || true

# 3. Если не получается удалить, меняем права доступа
echo "Изменяем права доступа..."
chmod -R 755 . 2>/dev/null || true

# 4. Пытаемся удалить снова
echo "Повторно удаляем кэшированные файлы..."
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

# 5. Добавляем изменения в Git
echo "Добавляем изменения в Git..."
git add .gitignore
git add custom_extensions/backend/app/utils/pie_chart_css_generator.py

# 6. Коммитим изменения
echo "Коммитим изменения..."
git commit -m "Отключено создание кэшированных файлов Python" 2>/dev/null || true

# 7. Пытаемся сделать pull
echo "Выполняем git pull..."
git pull origin evgeniy-dev

echo "=== Готово! ===" 