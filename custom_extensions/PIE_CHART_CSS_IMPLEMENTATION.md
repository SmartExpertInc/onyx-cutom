# PIE CHART - CSS РЕАЛИЗАЦИЯ

## Обзор

Новая реализация pie chart использует CSS и HTML вместо генерации изображений. Это обеспечивает:
- **Точное позиционирование процентов** - проценты всегда находятся в центре своих сегментов
- **Лучшую производительность** - нет необходимости генерировать изображения
- **Масштабируемость** - CSS автоматически адаптируется к разным размерам
- **Совместимость** - работает во всех современных браузерах

## Архитектура

### 1. CSS Pie Chart Generator
**Файл**: `backend/app/utils/pie_chart_css_generator.py`

Основной генератор, который создает CSS и HTML код для pie chart:

```python
def generate_css_pie_chart(segments: List[Dict], chart_id: str = "pie-chart") -> Dict:
    """
    Генерирует CSS pie chart с точным позиционированием процентов
    
    Args:
        segments: Список сегментов с ключами 'percentage', 'color', 'label'
        chart_id: Уникальный ID для CSS селекторов
        
    Returns:
        Словарь с HTML и CSS кодом
    """
```

### 2. PDF Generator Integration
**Файл**: `backend/app/services/pdf_generator.py`

Обновлен для использования CSS генератора вместо изображений:

```python
# Generate pie chart CSS if needed
if safe_slide_data.get('templateId') == 'pie-chart-infographics' and generate_css_pie_chart:
    chart_id = f"pie-chart-{slide_index}" if slide_index is not None else "pie-chart"
    css_pie_chart = generate_css_pie_chart(segments, chart_id)
    context_data['pie_chart_html'] = css_pie_chart['html']
    context_data['pie_chart_css'] = css_pie_chart['css']
```

### 3. HTML Templates
**Файлы**: 
- `backend/templates/slide_deck_pdf_template.html`
- `backend/templates/single_slide_pdf_template.html`

Обновлены для отображения CSS pie chart:

```html
<!-- CSS Pie Chart Container -->
{% if pie_chart_css %}
    <style>{{ pie_chart_css | safe }}</style>
    {{ pie_chart_html | safe }}
{% else %}
    <!-- Fallback to image if CSS not available -->
    <div style="position: relative; width: 312px; height: 312px; margin: 0 auto;">
        <img src="{{ pie_chart_image }}" alt="Pie Chart" style="width: 312px; height: 312px;" />
    </div>
{% endif %}
```

## Технические детали

### CSS Conic Gradient
Используется CSS `conic-gradient` для создания сегментов:

```css
.pie-chart-segment-0 {
    position: absolute;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: conic-gradient(
        #0ea5e9 0deg,
        #0ea5e9 24deg,
        transparent 24deg,
        transparent 360deg
    );
    transform: rotate(-90deg);
}
```

### Точное позиционирование процентов
Проценты позиционируются с помощью абсолютного позиционирования:

```css
.pie-chart-percentage-0 {
    position: absolute;
    left: 140px;
    top: 85px;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 18px;
    font-weight: bold;
    font-family: Arial, Helvetica, sans-serif;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    z-index: 20;
    pointer-events: none;
}
```

### Адаптивный радиус
Для маленьких сегментов (< 30°) используется меньший радиус:

```python
# Адаптивный радиус для правильного позиционирования
if segment_angle < 30:  # Для маленьких сегментов
    label_radius = 85  # Ближе к центру для лучшего размещения
else:
    label_radius = 98  # ТОЧНО как во фронтенде
```

## Структура HTML

```html
<div class="pie-chart-container">
    <div class="pie-chart-chart">
        <div class="pie-chart-outer-border"></div>
        <div class="pie-chart-donut-hole"></div>
        <div class="pie-chart-segment-0"></div>
        <div class="pie-chart-segment-1"></div>
        <!-- ... другие сегменты ... -->
        <div class="pie-chart-percentage-0">8%</div>
        <div class="pie-chart-percentage-1">15%</div>
        <!-- ... другие проценты ... -->
    </div>
</div>
```

## Тестирование

### Тестовый скрипт
**Файл**: `backend/test_css_pie_chart.py`

Запуск теста:
```bash
cd onyx-cutom/custom_extensions/backend
python test_css_pie_chart.py
```

### Тестовые данные
Используются реальные данные из изображения:
- 7 сегментов
- Общий процент: 120%
- Разные размеры сегментов для тестирования адаптивного радиуса

### Ожидаемые результаты
1. **8%** (24°): радиус 85px - ближе к центру
2. **15%** (45°): радиус 98px - стандартный
3. **20%** (60°): радиус 98px - стандартный
4. **20%** (60°): радиус 98px - стандартный
5. **25%** (75°): радиус 98px - стандартный
6. **20%** (60°): радиус 98px - стандартный
7. **12%** (36°): радиус 98px - стандартный

## Преимущества CSS реализации

### 1. Точность
- Проценты всегда находятся точно в центре своих сегментов
- Математические расчеты идентичны фронтенду
- Адаптивное позиционирование для маленьких сегментов

### 2. Производительность
- Нет необходимости генерировать изображения
- CSS рендерится быстрее
- Меньше нагрузки на сервер

### 3. Масштабируемость
- CSS автоматически адаптируется к разным размерам
- Поддержка высокого DPI
- Векторная графика

### 4. Совместимость
- Работает во всех современных браузерах
- Поддержка CSS conic-gradient
- Fallback на изображения при необходимости

## Fallback механизм

Если CSS генератор недоступен, система автоматически использует старую реализацию с изображениями:

```html
{% if pie_chart_css %}
    <!-- CSS версия -->
    <style>{{ pie_chart_css | safe }}</style>
    {{ pie_chart_html | safe }}
{% else %}
    <!-- Fallback на изображение -->
    <img src="{{ pie_chart_image }}" alt="Pie Chart" />
{% endif %}
```

## Файлы изменены

1. **Новые файлы**:
   - `backend/app/utils/pie_chart_css_generator.py` - CSS генератор
   - `backend/test_css_pie_chart.py` - тестовый скрипт
   - `test_css_pie_chart.html` - тестовый HTML файл

2. **Обновленные файлы**:
   - `backend/app/services/pdf_generator.py` - интеграция CSS генератора
   - `backend/templates/slide_deck_pdf_template.html` - CSS pie chart
   - `backend/templates/single_slide_pdf_template.html` - CSS pie chart

## Заключение

CSS реализация pie chart решает проблему с позиционированием процентов, обеспечивая:
- ✅ Точное позиционирование процентов в центре сегментов
- ✅ Совместимость с фронтендом
- ✅ Лучшую производительность
- ✅ Масштабируемость
- ✅ Fallback механизм

Теперь проценты в PDF будут отображаться точно так же, как во фронтенде! 