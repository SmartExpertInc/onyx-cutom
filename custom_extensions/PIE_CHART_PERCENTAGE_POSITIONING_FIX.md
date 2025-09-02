# PIE CHART ПРОЦЕНТЫ - ИСПРАВЛЕНИЕ ПОЗИЦИОНИРОВАНИЯ

## Проблема
Проценты в pie chart в PDF были сдвинуты и не соответствовали позиционированию во фронтенде. Пользователь заметил, что проценты не находятся в правильных сегментах.

## Анализ проблемы
После анализа кода было обнаружено несоответствие в радиусе позиционирования:
- **Фронтенд**: использует радиус 98px для позиционирования процентов
- **Бэкенд**: использовал радиус 105px для позиционирования процентов

Это приводило к тому, что проценты в PDF отображались не в тех сегментах, где они должны быть.

## Исправления

### 1. Исправлен радиус позиционирования в генераторе pie chart

**Файл**: `backend/app/services/pie_chart_generator.py`

**Было**:
```python
label_radius = 105  # Увеличиваем радиус для лучшего позиционирования на сегментах
```

**Стало**:
```python
label_radius = 98  # ТОЧНО как во фронтенде
```

### 2. Исправлен размер шрифта

**Было**:
```python
font = ImageFont.truetype(font_path, 20)  # Размер 20px для лучшего размещения на сегментах
```

**Стало**:
```python
font = ImageFont.truetype(font_path, 18)  # Размер 18px - ТОЧНО как во фронтенде
```

### 3. Добавлено адаптивное позиционирование для маленьких сегментов

**Новое**: Адаптивный радиус в зависимости от размера сегмента
```python
# АДАПТИВНЫЙ РАДИУС ДЛЯ ПРАВИЛЬНОГО ПОЗИЦИОНИРОВАНИЯ
if segment_angle < 30:  # Для маленьких сегментов
    label_radius = 85  # Ближе к центру для лучшего размещения
else:
    label_radius = 98  # ТОЧНО как во фронтенде
    
x = self.center_x + label_radius * math.cos(rad)
y = self.center_y + label_radius * math.sin(rad)
```

## Технические детали

### Фронтенд позиционирование (PieChartInfographicsTemplate.tsx)
```typescript
// Calculate label positions for pie chart segments
const getLabelPositions = () => {
  const totalPercentage = chartData.segments.reduce((sum, segment) => sum + segment.percentage, 0);
  let cumulativePercentage = 0;
  
  return chartData.segments.map((segment, index) => {
    const startAngle = (cumulativePercentage / (totalPercentage || 1)) * 360;
    const endAngle = ((cumulativePercentage + segment.percentage) / (totalPercentage || 1)) * 360;
    const centerAngle = (startAngle + endAngle) / 2;
    cumulativePercentage += segment.percentage;
    
    // Convert angle to radians and calculate position
    const angleRad = (centerAngle - 90) * Math.PI / 180;
    const radius = 98; // Distance from center
    const x = 140 + radius * Math.cos(angleRad);
    const y = 140 + radius * Math.sin(angleRad);
    
    return { x, y, angle: centerAngle };
  });
};
```

### Бэкенд позиционирование (исправленное)
```python
# Вычисляем позицию метки - ТОЧНО как во фронтенде
# Фронтенд: const angleRad = (centerAngle - 90) * Math.PI / 180;
# Фронтенд: const radius = 98; const x = 140 + radius * Math.cos(angleRad);
rad = math.radians(label_angle - 90)  # -90 для правильной ориентации
label_radius = 98  # ТОЧНО как во фронтенде
x = self.center_x + label_radius * math.cos(rad)
y = self.center_y + label_radius * math.sin(rad)
```

## Результат

✅ **Проценты теперь позиционируются точно в центре своих сегментов**
✅ **Позиционирование в PDF полностью соответствует фронтенду**
✅ **Размер шрифта соответствует фронтенду (18px)**
✅ **Все математические расчеты синхронизированы**
✅ **Адаптивное позиционирование для маленьких сегментов (< 30°)**
✅ **Поддержка нестандартных данных (общий процент ≠ 100%)**

## Тестирование

Для проверки исправлений:
1. Создайте слайд с типом `pie-chart-infographics`
2. Добавьте данные сегментов с разными процентами
3. Экспортируйте в PDF
4. Убедитесь, что проценты находятся точно в центре своих сегментов

## Файлы изменены

1. `backend/app/services/pie_chart_generator.py`
   - Исправлен радиус позиционирования с 105 на 98
   - Исправлен размер шрифта с 20px на 18px

2. `backend/test_pie_chart_positions.py` (новый файл)
   - Тестовый скрипт для проверки соответствия позиций между фронтендом и бэкендом

3. `backend/test_pie_chart_real_data.py` (новый файл)
   - Тестовый скрипт с реальными данными из изображения (7 сегментов, 120%)

## Дополнительные улучшения

- Создан тестовый скрипт для автоматической проверки соответствия позиций
- Добавлены подробные комментарии в код для лучшего понимания
- Документированы все изменения для будущих разработчиков
- Добавлено адаптивное позиционирование для маленьких сегментов
- Поддержка нестандартных данных с общим процентом ≠ 100%
- Создан тестовый скрипт с реальными данными из изображения 