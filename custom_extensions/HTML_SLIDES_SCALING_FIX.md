# HTML Slides Scaling Fix - Точное соответствие 1 в 1

## 🎯 Проблема

HTML слайды в `avatar_slide_template.html` имели неправильное масштабирование размеров из React компонентов.

## 📐 Масштабирование

### Размеры canvas:
- **React Editor Canvas:** 1200px × 675px
- **Video Canvas:** 1920px × 1080px
- **Scale Factor:** **1.6x** (1920 ÷ 1200 = 1.6)

**Все размеры React × 1.6 = Video размеры**

## ✅ Исправленные слайды

### 1. **CourseOverview**

#### React → Video (×1.6):
- Title fontSize: 63px → **101px** ✓
- Title left: 50px → **80px** ✓
- Gap: 10px → **16px** ✓
- Logo top/left: 30px → **48px** ✓
- Page number fontSize: 17px → **27px** ✓
- Page line width: 20px → **32px** ✓
- Bottom: 30px → **48px** ✓

---

### 2. **WorkLifeBalance**

#### React → Video (×1.6):
- Title fontSize: 58px → **93px** ✓
- Title left: 60px → **96px** ✓
- Title marginTop: 162px → **259px** ✓
- Content fontSize: 23px → **37px** ✓
- Content width: 500px → **800px** ✓
- Content left: 60px → **96px** ✓
- Content marginTop: 31px → **50px** ✓
- Content marginLeft: 6px → **10px** ✓
- Logo top/left: 25px → **40px** ✓
- Logo placeholder: 30px → **48px** ✓
- Logo text fontSize: 14px → **22px** ✓
- Page number fontSize: 17px → **27px** ✓
- Bottom: 30px → **48px** ✓

---

### 3. **PhishingDefinition**

#### React → Video (×1.6):
- Padding: 60px → **96px** ✓
- PaddingTop: 40px → **64px** ✓
- Title fontSize: 50px → **80px** ✓
- Title marginBottom: 15px → **24px** ✓
- Definition fontSize: 14px → **22px** ✓
- Definition gap: 20px → **32px** ✓
- Profile image width/height: 160px → **256px** ✓
- Profile bottom: 93px → **149px** ✓
- Profile left: 60px → **96px** ✓
- Page number fontSize: 17px → **27px** ✓
- Logo bottom/right: 30px → **48px** ✓

---

### 4. **BenefitsList**

#### React → Video (×1.6):
- Top section flex: 427px → **683px** ✓
- Padding: 40px 60px → **64px 96px** ✓
- PaddingTop: 44px → **70px** ✓
- Subtitle fontSize: 20px → **32px** ✓
- Subtitle dot: 8px → **13px** ✓
- Subtitle borderRadius: 24px → **38px** ✓
- Title fontSize: 48px → **77px** ✓
- Title minHeight: 65px → **104px** ✓
- Description fontSize: 28px → **45px** ✓
- Description maxWidth: 643px → **1029px** ✓
- Nav square: 55px → **88px** ✓
- Nav square gap: 55px → **88px** ✓
- Nav square fontSize: 32px → **51px** ✓
- Profile top/right: 60px → **96px** ✓
- Profile size: 170px → **272px** ✓
- Benefits fontSize: 24px → **38px** ✓
- Benefits gap: 20px → **32px** ✓
- Bottom padding: 13px → **32px** ✓

---

### 5. **ImpactStatements**

#### React → Video (×1.6):
- Gap: 70px → **112px** ✓
- PaddingTop: 40px → **64px** ✓
- PaddingBottom: 65px → **104px** ✓
- PaddingLeft: 50px → **80px** ✓
- PaddingRight: 40px → **64px** ✓
- Title fontSize: 46px → **74px** ✓
- Title maxWidth: 490px → **784px** ✓
- Profile container: 490×310px → **784×496px** ✓
- Profile borderRadius: 8px → **13px** ✓
- Statement gap: 15px → **24px** ✓
- Statement number fontSize: 58px → **93px** ✓
- Statement number height: 60px → **96px** ✓
- Statement description fontSize: 18px → **29px** ✓
- Statement description minHeight: 25px → **40px** ✓
- Card padding: 20px → **32px** ✓
- Card borderRadius: 8px → **13px** ✓

---

### 6. **HybridWork**

#### React → Video (×1.6):
- Padding: 40px 60px → **64px 96px** ✓
- Logo top: 20px → **32px** ✓
- Logo left: 35px → **56px** ✓
- Left column paddingRight: 40px → **64px** ✓
- Right column height: 370px → **592px** ✓
- Tag padding: 8px 18px → **13px 29px** ✓
- Tag fontSize: 18px → **29px** ✓
- Tag borderRadius: 50px → **80px** ✓
- Tag gap: 10px → **16px** ✓
- Tag marginBottom: 30px → **48px** ✓
- Tag dot: 8px → **13px** ✓
- Main statement fontSize: 35px → **56px** ✓
- Main statement maxWidth: 400px → **640px** ✓
- Main statement marginBottom: 40px → **64px** ✓
- Profile size: 170px → **272px** ✓
- Profile bottom: 60px → **96px** ✓
- Practice number: 24px → **38px** ✓
- Practice number fontSize: 14px → **22px** ✓
- Practice title fontSize: 15px → **24px** ✓
- Practice description fontSize: 14px → **22px** ✓
- Practice description maxWidth: 280px → **448px** ✓
- Gap: 10px 30px → **16px 48px** ✓
- marginBottom practice: 30px → **48px** ✓

---

## 🎨 Шрифты

Все слайды используют правильные шрифты:
- **Inter** - для всех UI элементов, контента, описаний
- **Lora** - только для заголовков (класс `.title` в HTML)

## 📊 Результат

✅ **Все 6 слайдов теперь 1 в 1 с React версиями по:**
- Размерам шрифтов
- Отступам (padding, margin)
- Позиционированию (top, left, bottom, right)
- Размерам элементов (width, height)
- Gaps и spacing
- Border radius
- Цветам

## 🔍 Как проверить

Сравните любой элемент в React DevTools и в HTML:
```
React: fontSize: 63px → HTML: fontSize: 101px (63 × 1.6)
React: padding: 40px → HTML: padding: 64px (40 × 1.6)
React: gap: 10px → HTML: gap: 16px (10 × 1.6)
```

## 📄 Файл

**`custom_extensions/backend/templates/avatar_slide_template.html`**

Все стили исправлены с точным масштабированием **×1.6** для видео 1920×1080px! 🎬
