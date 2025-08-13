import os
import base64
import io
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

class PieChartGenerator:
    """Генератор pie chart изображений для PDF"""
    
    def __init__(self):
        self.width = 280
        self.height = 280
        self.center_x = 140
        self.center_y = 140
        self.outer_radius = 140
        self.inner_radius = 67  # для donut hole
        
    def generate_pie_chart_image(self, segments: List[Dict], output_path: str = None) -> str:
        """
        Генерирует pie chart изображение и возвращает base64 строку
        
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
                
            # Рисуем сегменты
            current_angle = 0
            for segment in segments:
                if segment['percentage'] > 0:
                    # Вычисляем угол сегмента
                    segment_angle = (segment['percentage'] / total_percentage) * 360
                    
                    # Рисуем сегмент
                    self._draw_pie_segment(
                        draw, 
                        self.center_x, 
                        self.center_y, 
                        self.outer_radius,
                        current_angle, 
                        current_angle + segment_angle, 
                        segment['color']
                    )
                    
                    current_angle += segment_angle
            
            # Рисуем внутренний круг (donut hole) - точно как во фронтенде
            self._draw_circle(
                draw,
                self.center_x,
                self.center_y,
                self.inner_radius,
                fill=(0, 0, 0, 0),  # Прозрачный
                outline=(229, 231, 235, 255),  # #e5e7eb - точно как во фронтенде
                width=2
            )
            
            # Рисуем внешний контур - белый как во фронтенде
            self._draw_circle(
                draw,
                self.center_x,
                self.center_y,
                self.outer_radius,
                fill=None,
                outline=(255, 255, 255, 255),  # Белый контур как во фронтенде
                width=3
            )
            
            # Рисуем процентные метки с точным стилем фронтенда
            self._draw_percentage_labels(draw, segments, total_percentage)
            
            # Добавляем тень - создаем новое изображение с тенью
            shadow_image = self._add_shadow_effect(image)
            
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
    
    def _draw_pie_segment(self, draw: ImageDraw.Draw, cx: int, cy: int, radius: int, 
                         start_angle: float, end_angle: float, color: str):
        """Рисует сегмент pie chart"""
        try:
            # Конвертируем цвета hex в RGB - точно как во фронтенде
            if color.startswith('#'):
                color = color[1:]
            rgb_color = tuple(int(color[i:i+2], 16) for i in (0, 2, 4))
            
            # Рисуем сегмент как многоугольник
            points = self._calculate_segment_points(cx, cy, radius, start_angle, end_angle)
            if len(points) > 2:
                draw.polygon(points, fill=rgb_color)
                
        except Exception as e:
            logger.error(f"Error drawing pie segment: {e}")
    
    def _calculate_segment_points(self, cx: int, cy: int, radius: int, 
                                start_angle: float, end_angle: float) -> List[Tuple[int, int]]:
        """Вычисляет точки для сегмента pie chart"""
        points = [(cx, cy)]  # Центр
        
        # Добавляем точки по дуге
        angle_step = 2  # Шаг в градусах для сглаживания
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
    
    def _draw_circle(self, draw: ImageDraw.Draw, cx: int, cy: int, radius: int, 
                    fill=None, outline=None, width=1):
        """Рисует круг"""
        try:
            bbox = [cx - radius, cy - radius, cx + radius, cy + radius]
            draw.ellipse(bbox, fill=fill, outline=outline, width=width)
        except Exception as e:
            logger.error(f"Error drawing circle: {e}")
    
    def _draw_percentage_labels(self, draw: ImageDraw.Draw, segments: List[Dict], total_percentage: float):
        """Рисует процентные метки на сегментах с точным стилем фронтенда"""
        try:
            # Пытаемся загрузить шрифт, если не получится - используем дефолтный
            try:
                # Используем Arial как во фронтенде
                font = ImageFont.truetype("arial.ttf", 18)
            except:
                try:
                    # Попробуем найти Arial в системе
                    font = ImageFont.truetype("Arial", 18)
                except:
                    font = ImageFont.load_default()
            
            current_angle = 0
            for segment in segments:
                if segment['percentage'] > 0:
                    segment_angle = (segment['percentage'] / total_percentage) * 360
                    label_angle = current_angle + (segment_angle / 2)
                    
                    # Вычисляем позицию метки - точно как во фронтенде
                    rad = math.radians(label_angle - 90)  # -90 для правильной ориентации
                    label_radius = 98  # Расстояние от центра - точно как во фронтенде
                    x = self.center_x + label_radius * math.cos(rad)
                    y = self.center_y + label_radius * math.sin(rad)
                    
                    # Текст метки
                    text = f"{segment['percentage']}%"
                    
                    # Получаем размеры текста
                    bbox = draw.textbbox((0, 0), text, font=font)
                    text_width = bbox[2] - bbox[0]
                    text_height = bbox[3] - bbox[1]
                    
                    # Позиционируем текст по центру
                    text_x = int(x - text_width / 2)
                    text_y = int(y - text_height / 2)
                    
                    # Рисуем тень - точно как во фронтенде (text-shadow: 1px 1px 2px #000000)
                    draw.text((text_x + 1, text_y + 1), text, fill=(0, 0, 0, 255), font=font)
                    
                    # Рисуем основной текст - белый как во фронтенде
                    draw.text((text_x, text_y), text, fill=(255, 255, 255, 255), font=font)
                    
                    current_angle += segment_angle
                    
        except Exception as e:
            logger.error(f"Error drawing percentage labels: {e}")
    
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

    def _add_shadow_effect(self, image: Image.Image) -> Image.Image:
        """Добавляет тень к изображению pie chart"""
        try:
            # Создаем новое изображение с дополнительным пространством для тени
            shadow_offset = 8
            shadow_blur = 24
            total_width = self.width + shadow_offset + shadow_blur
            total_height = self.height + shadow_offset + shadow_blur
            
            # Создаем новое изображение
            result_image = Image.new('RGBA', (total_width, total_height), (0, 0, 0, 0))
            
            # Создаем тень
            shadow = Image.new('RGBA', (self.width, self.height), (0, 0, 0, 0))
            shadow_draw = ImageDraw.Draw(shadow)
            
            # Рисуем круглую тень
            shadow_draw.ellipse([0, 0, self.width, self.height], fill=(0, 0, 0, 40))
            
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