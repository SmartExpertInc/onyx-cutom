#!/usr/bin/env python3
"""
Простой калькулятор для круговой диаграммы
"""

def calculate_segments(segments):
    """
    Вычисляет углы для сегментов
    
    Args:
        segments: Список сегментов
        
    Returns:
        Список сегментов с углами
    """
    if not segments:
        return []
    
    total = sum(seg.get('percentage', 0) for seg in segments)
    if total == 0:
        return []
    
    result = []
    current_angle = 0
    
    for segment in segments:
        percentage = segment.get('percentage', 0)
        if percentage > 0:
            segment_angle = (percentage / total) * 360
            end_angle = current_angle + segment_angle
            center_angle = (current_angle + end_angle) / 2
            
            result.append({
                'start_angle': round(current_angle, 2),
                'end_angle': round(end_angle, 2),
                'center_angle': round(center_angle, 2),
                'percentage': percentage,
                'color': segment.get('color', '#3B82F6'),
                'label': segment.get('label', 'Сегмент')
            })
            
            current_angle = end_angle
    
    return result

def validate_data(segments):
    """
    Проверяет и нормализует данные сегментов
    
    Args:
        segments: Список сегментов
        
    Returns:
        Словарь с результатом валидации
    """
    if not segments:
        return {
            'valid': False,
            'error': 'Нет сегментов',
            'segments': []
        }
    
    total = sum(seg.get('percentage', 0) for seg in segments)
    
    if total == 0:
        return {
            'valid': False,
            'error': 'Общий процент равен нулю',
            'segments': segments
        }
    
    # Нормализуем сегменты
    normalized = []
    for segment in segments:
        percentage = segment.get('percentage', 0)
        normalized_percentage = (percentage / total) * 100 if total > 0 else 0
        
        normalized.append({
            'label': segment.get('label', 'Сегмент'),
            'percentage': round(normalized_percentage, 2),
            'color': segment.get('color', '#3B82F6'),
            'description': segment.get('description', '')
        })
    
    return {
        'valid': True,
        'total_percentage': 100.0,
        'segments': normalized
    }

def create_default_segments():
    """
    Создает 6 сегментов по умолчанию
    
    Returns:
        Список сегментов по умолчанию
    """
    return [
        {"label": "Сегмент 1", "percentage": 16.67, "color": "#3B82F6"},
        {"label": "Сегмент 2", "percentage": 16.67, "color": "#10B981"},
        {"label": "Сегмент 3", "percentage": 16.67, "color": "#F59E0B"},
        {"label": "Сегмент 4", "percentage": 16.67, "color": "#EF4444"},
        {"label": "Сегмент 5", "percentage": 16.67, "color": "#8B5CF6"},
        {"label": "Сегмент 6", "percentage": 16.67, "color": "#EC4899"}
    ]

def test_calculator():
    """Тестирует калькулятор"""
    test_segments = create_default_segments()
    
    print("=== ПРОСТОЙ КАЛЬКУЛЯТОР ===")
    
    # Тест валидации
    validation = validate_data(test_segments)
    print(f"Валидация: {validation['valid']}")
    if validation['valid']:
        print(f"Общий процент: {validation['total_percentage']}%")
    
    # Тест расчета углов
    angles = calculate_segments(test_segments)
    print("\nУглы сегментов:")
    for i, angle_data in enumerate(angles):
        print(f"Сегмент {i+1}: {angle_data['start_angle']}° - {angle_data['end_angle']}° (центр: {angle_data['center_angle']}°)")
    
    return angles

if __name__ == "__main__":
    test_calculator() 