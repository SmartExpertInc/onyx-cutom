import os
import base64
import io
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

class PieChartGenerator:
    """Генератор красивых pie chart изображений для PDF без процентов на диаграмме"""
    
    def __init__(self):
        self.width = 320
        self.height = 320
        self.center_x = 160
        self.center_y = 160
        self.outer_radius = 160
        self.inner_radius = 80  # для donut hole
        
    def generate_pie_chart_image(self, segments: List[Dict], output_path: str = None) -> str:
        """
        Генерирует красивую pie chart изображение без процентов на диаграмме
        
        Args:
            segments: Список сегментов с ключами 'percentage', 'color', 'label'
            output_path: Опциональный путь для сохранения файла
            
        Returns:
            base64 строка изображения
        """
        try:
            # Создаем новое изображение с прозрачным фоном
            image = Image.new('RGBA', (self.width, self.height), (0, 0, 0, 0))
            draw = ImageDraw.Draw(image)
            
            # Вычисляем общий процент
            total_percentage = sum(segment['percentage'] for segment in segments)
            if total_percentage == 0:
                total_percentage = 1  # Избегаем деления на ноль
                
            # Рисуем сегменты с улучшенным дизайном
            current_angle = 0
            for segment in segments:
                if segment['percentage'] > 0:
                    # Вычисляем угол сегмента
                    segment_angle = (segment['percentage'] / total_percentage) * 360
                    
                    # Рисуем сегмент с улучшенным стилем
                    self._draw_modern_pie_segment(
                        draw, 
                        self.center_x, 
                        self.center_y, 
                        self.outer_radius,
                        current_angle, 
                        current_angle + segment_angle, 
                        segment['color']
                    )
                    
                    current_angle += segment_angle
            
            # Рисуем внутренний круг (donut hole) с улучшенным дизайном
            self._draw_modern_donut_hole(draw)
            
            # Рисуем внешний контур с улучшенным стилем
            self._draw_modern_outer_border(draw)
            
            # Добавляем красивую тень
            shadow_image = self._add_modern_shadow_effect(image)
            
            # Сохраняем в буфер
            buffer = io.BytesIO()
            shadow_image.save(buffer, format='PNG')
            buffer.seek(0)
            
            # Конвертируем в base64
            image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            # Сохраняем файл если указан путь
            if output_path:
                shadow_image.save(output_path, format='PNG')
                logger.info(f"Pie chart saved to: {output_path}")
            
            return f"data:image/png;base64,{image_base64}"
            
        except Exception as e:
            logger.error(f"Error generating pie chart: {e}")
            # Возвращаем пустое изображение в случае ошибки
            return self._generate_empty_image()
    
    def _draw_modern_pie_segment(self, draw: ImageDraw.Draw, cx: int, cy: int, radius: int, 
                               start_angle: float, end_angle: float, color: str):
        """Рисует современный сегмент pie chart с улучшенным дизайном"""
        try:
            # Конвертируем цвета hex в RGB
            if color.startswith('#'):
                color = color[1:]
            rgb_color = tuple(int(color[i:i+2], 16) for i in (0, 2, 4))
            
            # Рисуем сегмент как многоугольник с белой границей для четкого разделения
            points = self._calculate_segment_points(cx, cy, radius, start_angle, end_angle)
            if len(points) > 2:
                # Рисуем основной сегмент
                draw.polygon(points, fill=rgb_color, outline=(255, 255, 255, 255), width=3)
                
                # Добавляем легкий градиентный эффект (имитация)
                self._add_segment_highlight(draw, points, rgb_color)
                
        except Exception as e:
            logger.error(f"Error drawing pie segment: {e}")
    
    def _calculate_segment_points(self, cx: int, cy: int, radius: int, 
                                start_angle: float, end_angle: float) -> List[Tuple[int, int]]:
        """Вычисляет точки для сегмента pie chart с высоким качеством"""
        points = [(cx, cy)]  # Центр
        
        # Добавляем точки по дуге с высоким разрешением для гладких сегментов
        angle_step = 0.5  # Очень маленький шаг для максимальной гладкости
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
        
        return points
    
    def _add_segment_highlight(self, draw: ImageDraw.Draw, points: List[Tuple[int, int]], base_color: Tuple[int, int, int]):
        """Добавляет легкий эффект подсветки к сегменту"""
        try:
            # Создаем более светлую версию цвета для подсветки
            highlight_color = tuple(min(255, c + 30) for c in base_color)
            
            # Рисуем небольшую подсветку в верхней части сегмента
            if len(points) > 3:
                highlight_points = points[:len(points)//3]  # Только верхняя треть
                if len(highlight_points) > 2:
                    draw.polygon(highlight_points, fill=highlight_color + (100,), outline=None)
        except Exception as e:
            logger.error(f"Error adding segment highlight: {e}")
    
    def _draw_modern_donut_hole(self, draw: ImageDraw.Draw):
        """Рисует современный внутренний круг (donut hole)"""
        try:
            # Основной внутренний круг
            bbox = [self.center_x - self.inner_radius, self.center_y - self.inner_radius, 
                   self.center_x + self.inner_radius, self.center_y + self.inner_radius]
            
            # Рисуем с градиентным эффектом (имитация)
            draw.ellipse(bbox, fill=(255, 255, 255, 255), outline=(229, 231, 235, 255), width=4)
            
            # Добавляем внутреннюю тень
            inner_shadow_radius = self.inner_radius - 2
            shadow_bbox = [self.center_x - inner_shadow_radius, self.center_y - inner_shadow_radius,
                          self.center_x + inner_shadow_radius, self.center_y + inner_shadow_radius]
            draw.ellipse(shadow_bbox, fill=None, outline=(0, 0, 0, 20), width=2)
            
        except Exception as e:
            logger.error(f"Error drawing donut hole: {e}")
    
    def _draw_modern_outer_border(self, draw: ImageDraw.Draw):
        """Рисует современный внешний контур"""
        try:
            # Основной белый контур
            bbox = [self.center_x - self.outer_radius, self.center_y - self.outer_radius,
                   self.center_x + self.outer_radius, self.center_y + self.outer_radius]
            draw.ellipse(bbox, fill=None, outline=(255, 255, 255, 255), width=4)
            
            # Дополнительный тонкий контур для глубины
            outer_bbox = [self.center_x - self.outer_radius - 2, self.center_y - self.outer_radius - 2,
                         self.center_x + self.outer_radius + 2, self.center_y + self.outer_radius + 2]
            draw.ellipse(outer_bbox, fill=None, outline=(0, 0, 0, 30), width=1)
            
        except Exception as e:
            logger.error(f"Error drawing outer border: {e}")
    
    def _generate_empty_image(self) -> str:
        """Генерирует пустое изображение в случае ошибки"""
        try:
            image = Image.new('RGBA', (self.width, self.height), (0, 0, 0, 0))
            buffer = io.BytesIO()
            image.save(buffer, format='PNG')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            return f"data:image/png;base64,{image_base64}"
        except:
            return ""

    def _add_modern_shadow_effect(self, image: Image.Image) -> Image.Image:
        """Добавляет современную тень к изображению pie chart"""
        try:
            # Создаем новое изображение с дополнительным пространством для тени
            shadow_offset = 12
            shadow_blur = 32
            total_width = self.width + shadow_offset + shadow_blur
            total_height = self.height + shadow_offset + shadow_blur
            
            # Создаем новое изображение
            result_image = Image.new('RGBA', (total_width, total_height), (0, 0, 0, 0))
            
            # Создаем тень с градиентом
            shadow = Image.new('RGBA', (self.width, self.height), (0, 0, 0, 0))
            shadow_draw = ImageDraw.Draw(shadow)
            
            # Рисуем эллиптическую тень с градиентом
            for i in range(20):
                alpha = max(0, 40 - i * 2)
                radius_offset = i * 2
                shadow_bbox = [radius_offset, radius_offset, 
                              self.width - radius_offset, self.height - radius_offset]
                shadow_draw.ellipse(shadow_bbox, fill=(0, 0, 0, alpha))
            
            # Размываем тень
            for i in range(shadow_blur):
                shadow = shadow.filter(ImageFilter.GaussianBlur(radius=1))
            
            # Вставляем тень
            result_image.paste(shadow, (shadow_offset, shadow_offset), shadow)
            
            # Вставляем основное изображение
            result_image.paste(image, (0, 0), image)
            
            return result_image
            
        except Exception as e:
            logger.error(f"Error adding shadow effect: {e}")
            return image

# Глобальный экземпляр генератора
pie_chart_generator = PieChartGenerator() 