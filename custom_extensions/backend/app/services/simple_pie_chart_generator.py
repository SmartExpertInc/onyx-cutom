#!/usr/bin/env python3
"""
Простой генератор круговой диаграммы без процентов
Альтернативная версия без сложных зависимостей
"""

import base64
import io
from PIL import Image, ImageDraw
import math

class SimplePieChartGenerator:
    """Простой генератор круговой диаграммы"""
    
    def __init__(self):
        self.width = 320
        self.height = 320
        self.center_x = 160
        self.center_y = 160
        self.outer_radius = 160
        self.inner_radius = 80
        
    def generate_pie_chart(self, segments, output_path=None):
        """
        Генерирует простую круговую диаграмму
        
        Args:
            segments: Список сегментов [{"percentage": 16.67, "color": "#3B82F6"}, ...]
            output_path: Путь для сохранения (опционально)
            
        Returns:
            base64 строка изображения
        """
        try:
            # Создаем изображение
            image = Image.new('RGBA', (self.width, self.height), (255, 255, 255, 0))
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
                    self._draw_segment(draw, current_angle, current_angle + segment_angle, segment.get('color', '#3B82F6'))
                    
                    current_angle += segment_angle
            
            # Рисуем внутренний круг
            self._draw_inner_circle(draw)
            
            # Рисуем внешний контур
            self._draw_outer_border(draw)
            
            # Сохраняем
            buffer = io.BytesIO()
            image.save(buffer, format='PNG')
            buffer.seek(0)
            
            # Конвертируем в base64
            image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            # Сохраняем файл если указан путь
            if output_path:
                image.save(output_path, format='PNG')
            
            return f"data:image/png;base64,{image_base64}"
            
        except Exception as e:
            print(f"Ошибка генерации: {e}")
            return ""
    
    def _draw_segment(self, draw, start_angle, end_angle, color):
        """Рисует сегмент диаграммы"""
        try:
            # Конвертируем цвет
            if color.startswith('#'):
                color = color[1:]
            rgb_color = tuple(int(color[i:i+2], 16) for i in (0, 2, 4))
            
            # Вычисляем точки сегмента
            points = [(self.center_x, self.center_y)]
            
            # Добавляем точки по дуге
            angle_step = 1
            current_angle = start_angle
            
            while current_angle <= end_angle:
                rad = math.radians(current_angle)
                x = self.center_x + self.outer_radius * math.cos(rad)
                y = self.center_y + self.outer_radius * math.sin(rad)
                points.append((int(x), int(y)))
                current_angle += angle_step
            
            # Добавляем конечную точку
            rad = math.radians(end_angle)
            x = self.center_x + self.outer_radius * math.cos(rad)
            y = self.center_y + self.outer_radius * math.sin(rad)
            points.append((int(x), int(y)))
            
            # Рисуем сегмент
            if len(points) > 2:
                draw.polygon(points, fill=rgb_color, outline=(255, 255, 255, 255), width=3)
                
        except Exception as e:
            print(f"Ошибка рисования сегмента: {e}")
    
    def _draw_inner_circle(self, draw):
        """Рисует внутренний круг"""
        try:
            bbox = [
                self.center_x - self.inner_radius,
                self.center_y - self.inner_radius,
                self.center_x + self.inner_radius,
                self.center_y + self.inner_radius
            ]
            draw.ellipse(bbox, fill=(255, 255, 255, 255), outline=(229, 231, 235, 255), width=4)
        except Exception as e:
            print(f"Ошибка рисования внутреннего круга: {e}")
    
    def _draw_outer_border(self, draw):
        """Рисует внешний контур"""
        try:
            bbox = [
                self.center_x - self.outer_radius,
                self.center_y - self.outer_radius,
                self.center_x + self.outer_radius,
                self.center_y + self.outer_radius
            ]
            draw.ellipse(bbox, fill=None, outline=(255, 255, 255, 255), width=4)
        except Exception as e:
            print(f"Ошибка рисования внешнего контура: {e}")

# Глобальный экземпляр
simple_pie_generator = SimplePieChartGenerator() 