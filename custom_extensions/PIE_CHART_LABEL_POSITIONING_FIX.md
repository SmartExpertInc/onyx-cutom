# Исправление конфликтов слияния Git в шаблонах PDF для круговой диаграммы

## Проблема
В файлах шаблонов PDF для круговой диаграммы (`PieChartInfographicsTemplate`) были обнаружены конфликты слияния Git, которые создавали артефакты в коде и мешали корректному отображению диаграммы в PDF.

## Симптомы проблемы
- Артефакты слияния Git в коде: `<<<<<<< HEAD`, `=======`, `>>>>>>> de77170b3`
- Текстовые наложения на круговой диаграмме
- Некорректное отображение процентных меток
- Искажение визуального представления диаграммы

## Причина
При слиянии веток Git возникли конфликты в коде, отвечающем за позиционирование процентных меток в круговой диаграмме. Эти конфликты не были разрешены и остались в коде, что привело к некорректному рендерингу.

## Исправленные файлы

### 1. `backend/templates/slide_deck_pdf_template.html`
**Строки**: 1615-1635
- Удалены все артефакты слияния Git
- Оставлен корректный код для позиционирования меток
- Исправлено отображение процентных значений

### 2. `backend/templates/single_slide_pdf_template.html`
**Строки**: 2760-2780
- Удалены все артефакты слияния Git
- Оставлен корректный код для позиционирования меток
- Исправлено отображение процентных значений

## Технические детали исправления

### Удаленные артефакты:
```html
<<<<<<< HEAD
=======
<<<<<<< HEAD
    <!-- Старый код позиционирования -->
=======
>>>>>>> de77170b3 (PieChartInfograficsTemplate fix in PDF)
    <!-- Новый код позиционирования -->
<<<<<<< HEAD
=======
>>>>>>> 205b89fe9facb2fbaf6a009527a2eb45de746398
>>>>>>> de77170b3 (PieChartInfograficsTemplate fix in PDF)
```

### Оставленный корректный код:
```html
<!-- Percentage labels -->
{% set cumulative_percentage = 0 %}
{% for segment in slide.props.chartData.segments %}
    {% set start_angle = (cumulative_percentage / (total_percentage if total_percentage > 0 else 1)) * 2 * 3.14159 %}
    {% set end_angle = ((cumulative_percentage + segment.percentage) / (total_percentage if total_percentage > 0 else 1)) * 2 * 3.14159 %}
    {% set center_angle = (start_angle + end_angle) / 2 %}
    
    {% set angle_rad = center_angle - 3.14159 / 2 %}
    {% set label_radius = 70 %}
    {% set label_x = 140 + label_radius * angle_rad | cos %}
    {% set label_y = 140 + label_radius * angle_rad | sin %}
    
    <div style="position: absolute; top: {{ label_y }}px; left: {{ label_x }}px; transform: translate(-50%, -50%); color: #ffffff; font-size: 18px; font-weight: bold; text-shadow: 1px 1px 2px #000000; font-family: Arial, Helvetica, sans-serif; padding: 4px 8px; border-radius: 4px; background: rgba(0,0,0,0.3); z-index: 20;">{{ segment.percentage }}%</div>
    
    {% set cumulative_percentage = cumulative_percentage + segment.percentage %}
{% endfor %}
```

## Результат исправления

✅ **Удалены все артефакты слияния Git**
✅ **Круговая диаграмма корректно отображается в PDF**
✅ **Процентные метки правильно позиционированы**
✅ **Чистый код без конфликтов**
✅ **Сохранена функциональность SVG-рендеринга**

## Проверка исправления

После исправления:
1. Круговая диаграмма отображается без текстовых артефактов
2. Процентные метки корректно позиционированы внутри сегментов
3. SVG-элементы правильно рендерятся в PDF
4. Код чистый и не содержит конфликтов слияния

## Рекомендации

1. **Проверка слияний**: Всегда проверяйте файлы на наличие конфликтов слияния после git merge
2. **Тестирование PDF**: После изменений в шаблонах обязательно тестируйте генерацию PDF
3. **Версионный контроль**: Используйте понятные сообщения коммитов для отслеживания изменений 