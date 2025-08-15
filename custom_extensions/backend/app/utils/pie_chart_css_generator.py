#!/usr/bin/env python3

import os
import sys

# Отключаем создание .pyc файлов
sys.dont_write_bytecode = True
os.environ['PYTHONDONTWRITEBYTECODE'] = '1'

import math
from typing import List, Dict

def generate_css_pie_chart(segments: List[Dict], chart_id: str = "pie-chart") -> Dict:
    """
    Генерирует CSS pie chart без процентов на диаграмме
    
    Args:
        segments: Список сегментов с ключами 'percentage', 'color', 'label'
        chart_id: Уникальный ID для CSS селекторов
        
    Returns:
        Словарь с HTML и CSS кодом
    """
    if not segments:
        return {"html": "", "css": ""}
    
    # Вычисляем общий процент
    total_percentage = sum(segment.get('percentage', 0) for segment in segments)
    if total_percentage == 0:
        return {"html": "", "css": ""}
    
    # Генерируем один conic-gradient для всех сегментов
    conic_gradient = generate_conic_gradient(segments, total_percentage)
    
    # Собираем полный CSS
    full_css = generate_full_css(chart_id, conic_gradient)
    
    # Собираем полный HTML
    full_html = generate_full_html(chart_id)
    
    return {
        "html": full_html,
        "css": full_css
    }

def generate_conic_gradient(segments: List[Dict], total_percentage: float) -> str:
    """Генерирует conic-gradient для всех сегментов с разными цветами"""
    gradient_parts = []
    current_angle = 0
    
    for segment in segments:
        percentage = segment.get('percentage', 0)
        if percentage <= 0:
            continue
            
        color = segment.get('color', '#3B82F6')
        segment_angle = (percentage / total_percentage) * 360
        end_angle = current_angle + segment_angle
        
        # Добавляем часть градиента для этого сегмента
        gradient_parts.append(f"{color} {current_angle}deg {end_angle}deg")
        
        current_angle = end_angle
    
    # Создаем полный conic-gradient
    if gradient_parts:
        return f"conic-gradient({', '.join(gradient_parts)})"
    else:
        return "conic-gradient(transparent 0deg, transparent 360deg)"

def generate_full_css(chart_id: str, conic_gradient: str) -> str:
    """Генерирует полный CSS код для современной круговой диаграммы"""
    
    # CSS для контейнера
    container_css = f"""
    .{chart_id}-container {{
        position: relative;
        width: 352px;
        height: 352px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
    }}
    
    .{chart_id}-chart {{
        position: relative;
        width: 320px;
        height: 320px;
        border-radius: 50%;
        background: {conic_gradient};
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
        border: 4px solid white;
    }}
    
    .{chart_id}-donut-hole {{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 160px;
        height: 160px;
        border-radius: 50%;
        background: white;
        border: 4px solid #e5e7eb;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    }}
    
    .{chart_id}-outer-border {{
        position: absolute;
        top: -4px;
        left: -4px;
        width: 328px;
        height: 328px;
        border-radius: 50%;
        border: 4px solid white;
        z-index: 5;
    }}
    
    .{chart_id}-shadow {{
        position: absolute;
        top: 12px;
        left: 12px;
        width: 320px;
        height: 320px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.1);
        filter: blur(16px);
        z-index: -1;
    }}
    """
    
    return container_css

def generate_full_html(chart_id: str) -> str:
    """Генерирует полный HTML код для круговой диаграммы"""
    
    # HTML для контейнера
    container_html = f"""
    <div class="{chart_id}-container">
        <div class="{chart_id}-shadow"></div>
        <div class="{chart_id}-chart">
            <div class="{chart_id}-outer-border"></div>
            <div class="{chart_id}-donut-hole"></div>
        </div>
    </div>
    """
    
    return container_html

def test_css_generator():
    """Тестирует CSS генератор"""
    test_segments = [
        {"label": "Сегмент 1", "percentage": 16.67, "color": "#3B82F6"},
        {"label": "Сегмент 2", "percentage": 16.67, "color": "#10B981"},
        {"label": "Сегмент 3", "percentage": 16.67, "color": "#F59E0B"},
        {"label": "Сегмент 4", "percentage": 16.67, "color": "#EF4444"},
        {"label": "Сегмент 5", "percentage": 16.67, "color": "#8B5CF6"},
        {"label": "Сегмент 6", "percentage": 16.67, "color": "#EC4899"}
    ]
    
    result = generate_css_pie_chart(test_segments, "test-chart")
    
    print("=== CSS PIE CHART GENERATOR TEST ===")
    print("\nHTML:")
    print(result["html"])
    print("\nCSS:")
    print(result["css"])
    
    return result

if __name__ == "__main__":
    test_css_generator() 