#!/usr/bin/env python3
"""
Генератор круговой диаграммы - новая версия без проблем с правами
"""

import base64
import io
from PIL import Image, ImageDraw
import math

def make_chart(segments, size=320):
    """
    Создает круговую диаграмму
    
    Args:
        segments: Список сегментов [{"percentage": 16.67, "color": "#3B82F6"}, ...]
        size: Размер изображения (по умолчанию 320px)
        
    Returns:
        base64 строка изображения
    """
    try:
        # Размеры
        width = height = size
        center_x = center_y = size // 2
        outer_radius = size // 2
        inner_radius = size // 4
        
        # Создаем изображение
        image = Image.new('RGBA', (width, height), (255, 255, 255, 0))
        draw = ImageDraw.Draw(image)
        
        # Вычисляем общий процент
        total = sum(seg.get('percentage', 0) for seg in segments)
        if total == 0:
            total = 1
            
        # Рисуем сегменты
        current_angle = 0
        for segment in segments:
            percentage = segment.get('percentage', 0)
            if percentage > 0:
                # Вычисляем угол сегмента
                segment_angle = (percentage / total) * 360
                
                # Рисуем сегмент
                draw_segment(draw, center_x, center_y, outer_radius, 
                           current_angle, current_angle + segment_angle, 
                           segment.get('color', '#3B82F6'))
                
                current_angle += segment_angle
        
        # Рисуем внутренний круг
        draw_inner_circle(draw, center_x, center_y, inner_radius)
        
        # Рисуем внешний контур
        draw_outer_border(draw, center_x, center_y, outer_radius)
        
        # Сохраняем в base64
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        buffer.seek(0)
        
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return f"data:image/png;base64,{image_base64}"
        
    except Exception as e:
        print(f"Ошибка создания диаграммы: {e}")
        return ""

def draw_segment(draw, cx, cy, radius, start_angle, end_angle, color):
    """Рисует сегмент диаграммы"""
    try:
        # Конвертируем цвет
        if color.startswith('#'):
            color = color[1:]
        rgb_color = tuple(int(color[i:i+2], 16) for i in (0, 2, 4))
        
        # Вычисляем точки сегмента
        points = [(cx, cy)]
        
        # Добавляем точки по дуге
        angle_step = 1
        current_angle = start_angle
        
        while current_angle <= end_angle:
            rad = math.radians(current_angle)
            x = cx + radius * math.cos(rad)
            y = cy + radius * math.sin(rad)
            points.append((int(x), int(y)))
            current_angle += angle_step
        
        # Добавляем конечную точку
        rad = math.radians(end_angle)
        x = cx + radius * math.cos(rad)
        y = cy + radius * math.sin(rad)
        points.append((int(x), int(y)))
        
        # Рисуем сегмент
        if len(points) > 2:
            draw.polygon(points, fill=rgb_color, outline=(255, 255, 255, 255), width=3)
            
    except Exception as e:
        print(f"Ошибка рисования сегмента: {e}")

def draw_inner_circle(draw, cx, cy, radius):
    """Рисует внутренний круг"""
    try:
        bbox = [cx - radius, cy - radius, cx + radius, cy + radius]
        draw.ellipse(bbox, fill=(255, 255, 255, 255), outline=(229, 231, 235, 255), width=4)
    except Exception as e:
        print(f"Ошибка рисования внутреннего круга: {e}")

def draw_outer_border(draw, cx, cy, radius):
    """Рисует внешний контур"""
    try:
        bbox = [cx - radius, cy - radius, cx + radius, cy + radius]
        draw.ellipse(bbox, fill=None, outline=(255, 255, 255, 255), width=4)
    except Exception as e:
        print(f"Ошибка рисования внешнего контура: {e}")

def get_default_segments():
    """Создает 6 сегментов по умолчанию"""
    return [
        {"percentage": 16.67, "color": "#3B82F6"},
        {"percentage": 16.67, "color": "#10B981"},
        {"percentage": 16.67, "color": "#F59E0B"},
        {"percentage": 16.67, "color": "#EF4444"},
        {"percentage": 16.67, "color": "#8B5CF6"},
        {"percentage": 16.67, "color": "#EC4899"}
    ]

def test_chart():
    """Тестирует генератор"""
    print("=== ТЕСТ ГЕНЕРАТОРА ДИАГРАММЫ ===")
    
    # Создаем тестовые данные
    test_segments = get_default_segments()
    
    # Генерируем диаграмму
    image_base64 = make_chart(test_segments)
    
    if image_base64:
        print("✅ Диаграмма успешно создана!")
        print(f"Длина base64: {len(image_base64)} символов")
    else:
        print("❌ Ошибка создания диаграммы")
    
    return image_base64

if __name__ == "__main__":
    test_chart() 