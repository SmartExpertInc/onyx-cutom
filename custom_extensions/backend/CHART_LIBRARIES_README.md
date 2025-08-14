# Chart Library Options for Pie Charts

This document explains the different options available for creating pie charts in the custom extensions backend, along with their pros, cons, and use cases.

## Available Chart Libraries

### 1. **Matplotlib** (Server-side)
**Best for:** PDF generation, print materials, high-quality static charts

**Features:**
- High-quality PNG/PDF output
- Highly customizable styling
- No client-side dependencies
- Excellent for PDF generation
- Professional-looking charts

**Installation:**
```bash
pip install matplotlib
```

**Usage:**
```python
from app.services.chart_generator import chart_generator

# Generate pie chart
chart_data = {"One-pager": 45, "Presentation": 38, "Quiz": 42, "Video Lesson": 31}
colors = ['#9333ea', '#2563eb', '#16a34a', '#ea580c']

base64_image = chart_generator.generate_pie_chart_matplotlib(
    data=chart_data,
    title="Products Distribution",
    colors=colors
)
```

**Pros:**
- ✅ High quality output
- ✅ Excellent for PDF generation
- ✅ Highly customizable
- ✅ No client-side dependencies
- ✅ Professional appearance

**Cons:**
- ❌ Requires server processing
- ❌ Static images only
- ❌ Larger file sizes
- ❌ More complex setup

---

### 2. **Plotly** (Server-side)
**Best for:** Web dashboards, interactive reports, modern UI

**Features:**
- Modern, attractive design
- Can generate static images for PDFs
- Interactive charts when used client-side
- Donut chart style with center hole

**Installation:**
```bash
pip install plotly
```

**Usage:**
```python
from app.services.chart_generator import chart_generator

# Generate pie chart
chart_data = {"One-pager": 45, "Presentation": 38, "Quiz": 42, "Video Lesson": 31}
colors = ['#9333ea', '#2563eb', '#16a34a', '#ea580c']

base64_image = chart_generator.generate_pie_chart_plotly(
    data=chart_data,
    title="Products Distribution",
    colors=colors
)
```

**Pros:**
- ✅ Modern design
- ✅ Interactive charts (client-side)
- ✅ Good for web applications
- ✅ Can generate static images
- ✅ Donut chart style

**Cons:**
- ❌ Requires server processing for static images
- ❌ Larger library size
- ❌ More complex setup

---

### 3. **SVG** (Vector)
**Best for:** PDF generation, print materials, simple charts

**Features:**
- Perfect scaling at any resolution
- Small file sizes
- No external dependencies
- Excellent for PDF generation
- Vector-based graphics

**Usage:**
```python
from app.services.chart_generator import chart_generator

# Generate SVG pie chart
chart_data = {"One-pager": 45, "Presentation": 38, "Quiz": 42, "Video Lesson": 31}
colors = ['#9333ea', '#2563eb', '#16a34a', '#ea580c']

svg_string = chart_generator.generate_svg_pie_chart(
    data=chart_data,
    title="Products Distribution",
    colors=colors
)
```

**Pros:**
- ✅ Perfect scaling at any resolution
- ✅ Small file sizes
- ✅ No external dependencies
- ✅ Excellent for PDF generation
- ✅ Vector-based

**Cons:**
- ❌ Limited interactivity
- ❌ Manual path calculations
- ❌ Less sophisticated styling
- ❌ Basic appearance

---

### 4. **Chart.js** (Client-side)
**Best for:** Web applications, interactive dashboards, real-time data

**Features:**
- Interactive charts
- Responsive design
- Rich animations
- Large community support
- Canvas-based rendering

**Usage:**
```python
from app.services.chart_generator import chart_generator

# Generate Chart.js configuration
chart_data = {"One-pager": 45, "Presentation": 38, "Quiz": 42, "Video Lesson": 31}
colors = ['#9333ea', '#2563eb', '#16a34a', '#ea580c']

config = chart_generator.generate_chart_js_config(
    data=chart_data,
    title="Products Distribution",
    colors=colors
)
```

**HTML Integration:**
```html
<canvas id="chartjs-canvas"></canvas>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    const config = {{ chartjs_config | tojson | safe }};
    new Chart(document.getElementById('chartjs-canvas'), config);
</script>
```

**Pros:**
- ✅ Interactive charts
- ✅ Responsive design
- ✅ Rich animations
- ✅ Large community
- ✅ Real-time updates

**Cons:**
- ❌ Requires JavaScript
- ❌ May not work in PDF generation
- ❌ Client-side processing
- ❌ Browser compatibility issues

---

## Comparison Table

| Library | Type | Output Format | PDF Compatible | Interactive | File Size | Setup Complexity |
|---------|------|---------------|----------------|-------------|-----------|------------------|
| Matplotlib | Server-side | PNG/PDF | ✅ Excellent | ❌ No | Large | Medium |
| Plotly | Server-side | PNG/SVG/HTML | ✅ Good | ✅ Yes (client) | Medium | High |
| SVG | Vector | SVG | ✅ Excellent | ❌ Limited | Small | Low |
| Chart.js | Client-side | Canvas | ❌ Poor | ✅ Yes | Small | Low |

## Recommendations by Use Case

### **PDF Generation** 📄
**Recommended:** Matplotlib or SVG
- **Matplotlib**: For high-quality, professional charts
- **SVG**: For lightweight, scalable charts

### **Web Applications** 🌐
**Recommended:** Chart.js or Plotly
- **Chart.js**: For interactive dashboards
- **Plotly**: For modern, attractive charts

### **Print Materials** 🖨️
**Recommended:** Matplotlib or SVG
- **Matplotlib**: For publication-quality charts
- **SVG**: For scalable vector graphics

### **Interactive Dashboards** 📊
**Recommended:** Chart.js or Plotly
- **Chart.js**: For real-time data and animations
- **Plotly**: For complex interactive features

## Implementation Examples

### 1. **Using in Templates**

```html
<!-- Matplotlib/Plotly Chart -->
<img src="data:image/png;base64,{{ matplotlib_chart }}" alt="Chart" />

<!-- SVG Chart -->
{{ svg_chart | safe }}

<!-- Chart.js Chart -->
<canvas id="chartjs-canvas"></canvas>
<script>
    const config = {{ chartjs_config | tojson | safe }};
    new Chart(document.getElementById('chartjs-canvas'), config);
</script>
```

### 2. **API Integration**

```python
from app.services.chart_generator import chart_generator

# Generate chart data
chart_data = {
    "One-pager": 45,
    "Presentation": 38,
    "Quiz": 42,
    "Video Lesson": 31
}

# Choose library based on use case
if use_case == "pdf":
    chart = chart_generator.generate_pie_chart_matplotlib(chart_data)
elif use_case == "web":
    chart = chart_generator.generate_chart_js_config(chart_data)
elif use_case == "svg":
    chart = chart_generator.generate_svg_pie_chart(chart_data)
```

### 3. **Demo Endpoints**

- **Chart Demo**: `GET /api/charts/demo` - Shows all chart types
- **Library Comparison**: `GET /api/charts/compare` - Compares capabilities
- **Custom Chart**: `POST /api/charts/generate` - Generate custom charts

## Installation

Add the required libraries to your `requirements.txt`:

```txt
matplotlib # For server-side chart generation
plotly # For interactive charts
seaborn # For enhanced matplotlib styling
```

Install dependencies:
```bash
pip install -r requirements.txt
```

## Running Examples

```bash
# Run the example script
cd custom_extensions/backend
python examples/chart_examples.py

# Start the demo server
uvicorn main:app --reload

# Visit the demo page
open http://localhost:8000/api/charts/demo
```

## Best Practices

1. **Choose the right library for your use case**
   - PDF generation → Matplotlib or SVG
   - Web applications → Chart.js or Plotly
   - Print materials → Matplotlib or SVG

2. **Consider performance implications**
   - Server-side libraries require more processing
   - Client-side libraries require JavaScript execution

3. **Handle missing libraries gracefully**
   - The chart generator includes fallbacks
   - Check library availability before use

4. **Optimize for your target format**
   - PDF: Use vector formats when possible
   - Web: Consider file sizes and loading times
   - Print: Ensure high resolution and quality

## Troubleshooting

### Common Issues

1. **Matplotlib not working**
   - Install system dependencies: `apt-get install python3-matplotlib`
   - Check font availability
   - Ensure proper backend configuration

2. **Plotly generation fails**
   - Install additional dependencies: `pip install kaleido`
   - Check for headless environment issues

3. **Chart.js not rendering**
   - Ensure JavaScript is enabled
   - Check browser console for errors
   - Verify Chart.js library is loaded

4. **SVG path calculation errors**
   - Check data for zero values
   - Verify color array length matches data

### Debug Mode

Enable debug logging to troubleshoot chart generation:

```python
import logging
logging.getLogger('app.services.chart_generator').setLevel(logging.DEBUG)
```

## Conclusion

The chart generator service provides multiple options for creating pie charts, each suited for different use cases. Choose the library that best fits your requirements for quality, interactivity, and performance.

For the current PDF template use case, **SVG** remains the best choice due to its perfect compatibility with PDF generation, small file sizes, and no external dependencies. However, **Matplotlib** provides the highest quality output for professional reports.
