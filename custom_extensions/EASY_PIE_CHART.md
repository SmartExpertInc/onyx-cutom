# Простая круговая диаграмма

## Файлы

- `backend/app/services/easy_pie_chart.py` - генератор изображений
- `backend/app/utils/easy_css.py` - CSS генератор  
- `backend/test_easy.py` - тест

## Использование

```python
# Импорт
from app.services.easy_pie_chart import create_pie_chart, create_default_segments
from app.utils.easy_css import make_css_chart

# Создание данных
segments = create_default_segments()

# Генерация изображения
image_base64 = create_pie_chart(segments)

# Генерация CSS
css_result = make_css_chart(segments, "my-chart")
html = css_result["html"]
css = css_result["css"]
```

## Тестирование

```bash
cd onyx-cutom/custom_extensions/backend
python test_easy.py
```

## Результат

- ✅ Красивая круговая диаграмма 320x320px
- ✅ 6 сегментов с современными цветами
- ✅ Внутренний круг (donut hole)
- ✅ Белые границы между сегментами
- ✅ CSS код для веб-отображения

## Цвета

- 🔵 Синий: `#3B82F6`
- 🟢 Зеленый: `#10B981`
- 🟡 Желтый: `#F59E0B`
- 🔴 Красный: `#EF4444`
- 🟣 Фиолетовый: `#8B5CF6`
- 🟠 Розовый: `#EC4899`

Эта версия работает без конфликтов! 